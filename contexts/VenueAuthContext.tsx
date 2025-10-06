import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Venue } from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { VenueService } from '../services/VenueService';
import type { User } from '@supabase/supabase-js';
import { ProfileCompletenessService } from '../services/ProfileCompletenessService';

export interface LoginResult {
  success: boolean;
  message?: string;
}

export interface SignupResult {
    success: boolean;
    error?: string;
    requiresConfirmation?: boolean;
}

interface VenueAuthContextType {
  isAuthenticated: boolean;
  currentVenue: Venue | null;
  authUser: User | null;
  login: (email: string, pass: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  signup: (venueData: Partial<Venue>) => Promise<SignupResult>;
  updateVenueProfile: (updatedData: Partial<Venue>) => Promise<void>;
}

const VenueAuthContext = createContext<VenueAuthContextType | undefined>(undefined);

export const VenueAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
    }

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && session.user.user_metadata?.user_type === 'venue') {
            const venueProfile = await VenueService.getVenueById(session.user.id);
            setAuthUser(session.user);
            setCurrentVenue(venueProfile);
        }
        setIsLoading(false);
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setIsLoading(true);
        const sessionUser = session?.user;
        if (sessionUser && sessionUser.user_metadata?.user_type === 'venue') {
            if (sessionUser.id !== authUser?.id) {
                const venueProfile = await VenueService.getVenueById(sessionUser.id);
                setAuthUser(sessionUser);
                setCurrentVenue(venueProfile);
            }
        } else if (!sessionUser && authUser?.user_metadata?.user_type === 'venue') {
            setAuthUser(null);
            setCurrentVenue(null);
        }
        setIsLoading(false);
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, [authUser]);


  const login = async (email: string, pass: string): Promise<LoginResult> => {
    if (!isSupabaseConfigured) {
        // Mock login for demo mode
        const mockVenue: Venue = {
            id: 'mock-venue-1',
            name: 'Bar da Esquina (Mock)',
            address: 'Rua das Flores, 123, Centro',
            city: 'São Paulo',
            imageUrl: 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg',
            email: 'contato@esquina.com',
            contractor_type: 'company',
            description: 'Um bar aconchegante com foco em música ao vivo e coquetéis artesanais. Perfeito para shows de MPB, Jazz e Bossa Nova.',
            musicStyles: ['MPB', 'Jazz', 'Bossa Nova'],
            capacity: 80,
            averageRating: 4.7,
            ratingCount: 42,
            profile_completeness: { is_complete: true, missing_fields: [] },
        };
        const mockAuthUser: User = {
            id: 'mock-venue-auth-user-id', app_metadata: {}, user_metadata: { user_type: 'venue' },
            aud: 'authenticated', created_at: new Date().toISOString()
        };
        setCurrentVenue(mockVenue);
        setAuthUser(mockAuthUser);
        navigate('/venue-dashboard');
        return { success: true };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
        return { success: false, message: error.message };
    }
    // Auth state change listener will handle the rest
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
        await supabase.auth.signOut();
    }
    setCurrentVenue(null);
    setAuthUser(null);
    navigate('/venue-login');
  };
  
  const signup = async (venueData: Partial<Venue>): Promise<SignupResult> => {
      if (!isSupabaseConfigured) {
          alert("Cadastro desabilitado no modo de demonstração.");
          return { success: false };
      }
      
      const { data, error } = await supabase.auth.signUp({
          email: venueData.email!,
          password: venueData.password!,
          options: {
              data: { user_type: 'venue' }
          }
      });

      if (error) return { success: false, error: error.message };

      if (data.user) {
          const { error: profileError } = await supabase.from('venues').insert({
              id: data.user.id,
              name: venueData.name,
              email: venueData.email,
              address: '',
              city: venueData.city,
              image_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', // placeholder
              status: 'active',
              contractor_type: venueData.contractor_type,
              profile_completeness: { is_complete: false, missing_fields: ['description', 'imageUrl', 'address', 'musicStyles'] }
          });
          if (profileError) {
              console.error("Failed to create venue profile:", profileError.message);
              return { success: false, error: "Falha ao criar o perfil do local." };
          }
      }

      return { success: true, requiresConfirmation: data.session === null };
  };

  const updateVenueProfile = async (updatedData: Partial<Venue>) => {
    if (!currentVenue || !authUser) return;

    if (!isSupabaseConfigured) {
        const newProfile = { ...currentVenue, ...updatedData };
        const completeness = ProfileCompletenessService.checkVenueCompleteness(newProfile);
        setCurrentVenue({ ...newProfile, profile_completeness: completeness });
        return;
    }

    const updatedVenue = await VenueService.updateVenue(authUser.id, updatedData);
    if (updatedVenue) {
         const completeness = ProfileCompletenessService.checkVenueCompleteness(updatedVenue);
         const { error: completenessError } = await supabase
            .from('venues')
            .update({ profile_completeness: completeness })
            .eq('id', authUser.id);

        if (completenessError) {
            console.error("Error updating venue completeness:", completenessError);
        }
        
        setCurrentVenue({ ...updatedVenue, profile_completeness: completeness });
    } else {
        throw new Error("Failed to update venue profile");
    }
  };

  const value = { isAuthenticated: !!currentVenue, currentVenue, authUser, login, logout, signup, updateVenueProfile };

  if (isLoading && isSupabaseConfigured) {
      return (
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-4xl text-red-500"></i>
          </div>
      );
  }

  return (
    <VenueAuthContext.Provider value={value}>
      {children}
    </VenueAuthContext.Provider>
  );
};

export const useVenueAuth = () => {
  const context = useContext(VenueAuthContext);
  if (context === undefined) {
    throw new Error('useVenueAuth must be used within a VenueAuthProvider');
  }
  return context;
};