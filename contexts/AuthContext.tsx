import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { ArtistService } from '../services/ArtistService';
import type { User } from '@supabase/supabase-js';
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
interface AuthContextType {
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  artist: Artist | null;
  authUser: User | null;
  login: (email: string, pass: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, pass: string, phone: string, city: string, referrerId: string | null) => Promise<SignupResult>;
  updateArtistProfile: (updatedData: Partial<Artist>) => Promise<void>;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demo mode when supabase is not configured
const mockArtist: Artist = {
  id: 'mock-artist-id-12345',
  name: 'Artista Teste (Mock)',
  email: 'artista@teste.com',
  phone: '(11) 91234-5678',
  city: 'São Paulo',
  genre: { primary: 'MPB', secondary: ['Pop', 'Rock'] },
  imageUrl: 'https://images.pexels.com/photos/3775164/pexels-photo-3775164.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  youtubeVideoId: 'P_4Fp_Sp_4c',
  bio: 'Este é um perfil de artista de demonstração. Você pode navegar e interagir com todas as funcionalidades da plataforma como se fosse este artista. Explore a edição de perfil, pacotes, agenda e muito mais!',
  socials: { instagram: '#', spotify: '#', facebook: '#' },
  bookedDates: [],
  gallery: [
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/2111015/pexels-photo-2111015.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  ],
  plans: [
    { id: 1, name: 'Voz e Violão', price: 800, description: 'Show acústico para eventos intimistas.', includes: ['2 horas de show'], costs:[] },
    { id: 2, name: 'Banda Completa', price: 2200, description: 'Show completo com banda para animar sua festa.', includes: ['3 horas de show', 'Banda com 4 integrantes'], costs:[] }
  ],
  repertoire: [{ title: 'Garota de Ipanema', artist: 'Tom Jobim' }],
  testimonials: [{ quote: 'Show incrível!', author: 'Dono do Bar', source: 'Bar do Zé' }],
  hospitalityRider: ['Água'],
  bandMembers: [
    { id: 'musician-mock-1', name: 'Carlos Batera', instrument: 'Bateria' },
    { id: 'musician-mock-2', name: 'Joana Baixo', instrument: 'Baixo Elétrico', email: 'joana@email.com' }
  ],
  status: 'approved',
  is_pro: false,
  profile_completeness: { is_complete: true, missing_fields: [] }
};
const mockAuthUser: User = {
    id: 'mock-auth-user-id',
    app_metadata: {},
    user_metadata: { user_type: 'artist' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
};

const mockAdminAuthUser: User = {
    id: 'admin-mock-id',
    app_metadata: {},
    user_metadata: { user_type: 'admin' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'admin@example.com'
};


// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // This effect runs on mount to check for an existing session
  useEffect(() => {
    if (!isSupabaseConfigured) {
        // In demo mode, we start logged out.
        setIsLoading(false);
        return;
    }

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
            setAuthUser(session.user);
            // Check if it's an admin session
            if (session.user.email === process.env.VITE_ADMIN_EMAIL) {
                setIsAdminAuthenticated(true);
                setArtist(null);
            } else {
                // It's an artist session, fetch artist profile
                const artistProfile = await ArtistService.getArtistById(session.user.id);
                setArtist(artistProfile);
                setIsAdminAuthenticated(false);
            }
        } else {
            // No session, reset all state
            setAuthUser(null);
            setArtist(null);
            setIsAdminAuthenticated(false);
        }
        setIsLoading(false);
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setIsLoading(true);
        if (session?.user) {
             setAuthUser(session.user);
             if (session.user.email === process.env.VITE_ADMIN_EMAIL) {
                setIsAdminAuthenticated(true);
                setArtist(null);
                navigate('/admin/dashboard');
             } else {
                const profile = await ArtistService.getArtistById(session.user.id);
                setArtist(profile);
                setIsAdminAuthenticated(false);
             }
        } else {
            setAuthUser(null);
            setArtist(null);
            setIsAdminAuthenticated(false);
            // Only navigate if we're not on a public page to avoid loops
            if (!['/login', '/signup', '/'].includes(window.location.hash.substring(1))) {
                navigate('/login');
            }
        }
        setIsLoading(false);
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Login function for artists
  const login = async (email: string, pass: string): Promise<LoginResult> => {
    if (!isSupabaseConfigured) {
        // Bypass auth for testing and demo mode
        setArtist(mockArtist);
        setAuthUser(mockAuthUser);
        navigate('/dashboard');
        return { success: true };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
        return { success: false, message: error.message };
    }
    // Auth state change listener will handle the rest
    return { success: true };
  };

  // Logout function for artists and admins
  const logout = async () => {
    if (isSupabaseConfigured) {
        await supabase.auth.signOut();
    }
    // Clear state for all modes
    setArtist(null);
    setAuthUser(null);
    setIsAdminAuthenticated(false);
    navigate('/login');
  };
  
  // Signup function for artists
  const signup = async (name: string, email: string, pass: string, phone: string, city: string, referrerId: string | null): Promise<SignupResult> => {
    if (!isSupabaseConfigured) {
        alert("Cadastro desabilitado no modo de demonstração.");
        return { success: false };
    }
    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: { user_type: 'artist' }
        }
    });

    if (error) {
        return { success: false, error: error.message };
    }
    
    if (data.user) {
        // Create a corresponding entry in the 'artists' table
        const { error: profileError } = await supabase
            .from('artists')
            .insert({
                id: data.user.id,
                name: name,
                email: email,
                phone: phone,
                city: city,
                status: 'pending', // Artists start as pending approval
                referred_by: referrerId, // Save the referrer ID
                // Default empty values for other fields
                genre: { primary: '', secondary: [] },
                image_url: `https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`, // Placeholder
                bio: '',
                socials: {},
                profile_completeness: { is_complete: false, missing_fields: ['bio', 'imageUrl', 'youtubeVideoId', 'plans'] }
            });
        
        if (profileError) {
             // Attempt to clean up the auth user if profile creation fails
            // This requires admin privileges, so it might fail silently in client-side code
            // Best handled by a server-side function or by flagging the auth user for cleanup.
            console.error("Failed to create artist profile:", profileError.message);
            return { success: false, error: "Falha ao criar o perfil do artista. " + profileError.message };
        }
    }
    
    // Check if email confirmation is required
    const requiresConfirmation = data.session === null;
    return { success: true, requiresConfirmation };
  };
  
  // Function to update the artist's profile
  const updateArtistProfile = async (updatedData: Partial<Artist>) => {
    if (!artist || !authUser) return;
    
    if (!isSupabaseConfigured) {
        const newProfile = { ...artist, ...updatedData };
        const completeness = ProfileCompletenessService.checkArtistCompleteness(newProfile);
        setArtist({ ...newProfile, profile_completeness: completeness });
        return;
    }

    const dbPayload = ArtistService.mapArtistToDb(updatedData);

    const { data, error } = await supabase
        .from('artists')
        .update(dbPayload)
        .eq('id', authUser.id)
        .select()
        .single();
    
    if (error) {
        console.error("Error updating artist profile:", error);
        throw error;
    }

    if (data) {
        const updatedArtist = ArtistService.mapArtistFromDb(data);
        const completeness = ProfileCompletenessService.checkArtistCompleteness(updatedArtist);

        // Second update for completeness status
        const { error: completenessError } = await supabase
            .from('artists')
            .update({ profile_completeness: completeness })
            .eq('id', authUser.id);
        
        if (completenessError) {
             console.error("Error updating profile completeness:", completenessError);
        }

        setArtist({ ...updatedArtist, profile_completeness: completeness });
    }
  };

  // Admin-specific login
  const adminLogin = async (email: string, pass: string): Promise<boolean> => {
     if (!isSupabaseConfigured) {
        setIsAdminAuthenticated(true);
        setAuthUser(mockAdminAuthUser);
        navigate('/admin/dashboard');
        return true;
    }
    
    if (email.toLowerCase() !== (process.env.VITE_ADMIN_EMAIL || '').toLowerCase() || pass !== process.env.VITE_ADMIN_PASSWORD) {
        return false;
    }
    
    // Admins use the same login mechanism but are identified by email
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return !error;
  };

  const adminLogout = async () => {
    await logout();
    navigate('/admin/login');
  };
  
  // The value provided to the context consumers
  const value = {
      isAuthenticated: !!artist && !!authUser && !isAdminAuthenticated,
      isAdminAuthenticated,
      artist,
      authUser,
      login,
      logout,
      signup,
      updateArtistProfile,
      adminLogin,
      adminLogout
  };

  if (isLoading && isSupabaseConfigured) {
      return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-4xl text-red-500"></i>
          </div>
      );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};