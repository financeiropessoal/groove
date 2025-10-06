import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Musician } from '../types';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { MusicianService } from '../services/MusicianService';
import { ProfileCompletenessService } from '../services/ProfileCompletenessService';

// Interfaces for function results
export interface LoginResult {
  success: boolean;
  message?: string;
}

export interface SignupResult {
    success: boolean;
    error?: string;
    requiresConfirmation?: boolean;
}

// Context type definition
interface MusicianAuthContextType {
  isMusicianAuthenticated: boolean;
  musician: Musician | null;
  musicianAuthUser: User | null;
  musicianLogin: (email: string, pass: string) => Promise<LoginResult>;
  musicianLogout: () => Promise<void>;
  musicianSignup: (name: string, email: string, pass: string, instrument: string, city: string) => Promise<SignupResult>;
  updateMusicianProfile: (updatedData: Partial<Musician>) => Promise<void>;
}

const MusicianAuthContext = createContext<MusicianAuthContextType | undefined>(undefined);


export const MusicianAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [musician, setMusician] = useState<Musician | null>(null);
  const [musicianAuthUser, setMusicianAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
    }

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && session.user.user_metadata?.user_type === 'musician') {
            const musicianProfile = await MusicianService.getMusicianById(session.user.id);
            setMusicianAuthUser(session.user);
            setMusician(musicianProfile);
        }
        setIsLoading(false);
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setIsLoading(true);
        const sessionUser = session?.user;
        if (sessionUser && sessionUser.user_metadata?.user_type === 'musician') {
            if (sessionUser.id !== musicianAuthUser?.id) {
                const musicianProfile = await MusicianService.getMusicianById(sessionUser.id);
                setMusicianAuthUser(sessionUser);
                setMusician(musicianProfile);
            }
        } else if (!sessionUser && musicianAuthUser?.user_metadata?.user_type === 'musician') {
            setMusicianAuthUser(null);
            setMusician(null);
        }
        setIsLoading(false);
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, [musicianAuthUser]);

  const musicianLogin = async (email: string, pass: string): Promise<LoginResult> => {
     if (!isSupabaseConfigured) {
        // Mock login for demo mode
        const mockMusician: Musician = {
            id: 'mock-musician-123', name: 'Músico de Teste', email: 'musico@teste.com', instrument: 'Guitarra',
            city: 'Demo City', bio: 'Perfil de demonstração.', imageUrl: 'https://images.pexels.com/photos/96380/pexels-photo-96380.jpeg',
            status: 'approved',
            profile_completeness: { is_complete: true, missing_fields: [] }
        };
        const mockAuthUser: User = {
            id: 'mock-musician-auth-user-id', app_metadata: {}, user_metadata: { user_type: 'musician' },
            aud: 'authenticated', created_at: new Date().toISOString()
        };
        setMusician(mockMusician);
        setMusicianAuthUser(mockAuthUser);
        navigate('/musician-dashboard');
        return { success: true };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, message: error.message };
    return { success: true };
  };

  const musicianLogout = async () => {
    if (isSupabaseConfigured) {
        await supabase.auth.signOut();
    }
    setMusician(null);
    setMusicianAuthUser(null);
    navigate('/musician-login');
  };
  
  const musicianSignup = async (name: string, email: string, pass: string, instrument: string, city: string): Promise<SignupResult> => {
    if (!isSupabaseConfigured) {
        alert("Cadastro de músico desabilitado no modo de demonstração.");
        return { success: false };
    }
     const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: { user_type: 'musician' }
        }
     });

    if (error) return { success: false, error: error.message };

    if (data.user) {
        const { error: profileError } = await supabase.from('musicians').insert({
            id: data.user.id,
            name: name,
            email: email,
            instrument: instrument,
            city: city,
            status: 'pending',
            image_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
            bio: '',
            profile_completeness: { is_complete: false, missing_fields: ['bio', 'imageUrl', 'city'] }
        });
        if (profileError) {
            console.error("Failed to create musician profile:", profileError.message);
            return { success: false, error: "Falha ao criar o perfil do músico." };
        }
    }

    return { success: true, requiresConfirmation: data.session === null };
  };
  
  const updateMusicianProfile = async (updatedData: Partial<Musician>) => {
    if (!musician || !musicianAuthUser) return;
    
    if (!isSupabaseConfigured) {
        const newProfile = { ...musician, ...updatedData };
        const completeness = ProfileCompletenessService.checkMusicianCompleteness(newProfile);
        setMusician({ ...newProfile, profile_completeness: completeness });
        return;
    }
    
    const updatedMusician = await MusicianService.updateMusician(musicianAuthUser.id, updatedData);
    if(updatedMusician) {
         const completeness = ProfileCompletenessService.checkMusicianCompleteness(updatedMusician);
         const { error: completenessError } = await supabase
            .from('musicians')
            .update({ profile_completeness: completeness })
            .eq('id', musicianAuthUser.id);
        
        if(completenessError) {
             console.error("Error updating musician completeness:", completenessError);
        }

        setMusician({ ...updatedMusician, profile_completeness: completeness });
    } else {
        throw new Error("Failed to update musician profile");
    }
  };

  const value = {
      isMusicianAuthenticated: !!musician,
      musician,
      musicianAuthUser,
      musicianLogin,
      musicianLogout,
      musicianSignup,
      updateMusicianProfile
  };

   if (isLoading && isSupabaseConfigured) {
      return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-4xl text-red-500"></i>
          </div>
      );
  }

  return (
    <MusicianAuthContext.Provider value={value}>
      {children}
    </MusicianAuthContext.Provider>
  );
};

export const useMusicianAuth = () => {
  const context = useContext(MusicianAuthContext);
  if (context === undefined) {
    throw new Error('useMusicianAuth must be used within a MusicianAuthProvider');
  }
  return context;
};