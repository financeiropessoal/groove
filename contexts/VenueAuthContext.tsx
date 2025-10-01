import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Venue } from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { VenueService } from '../services/VenueService';
import { User } from '@supabase/supabase-js';

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
  logout: () => void;
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
    const createInitialProfile = async (user: User) => {
      const name = user.user_metadata.full_name;
      const address = user.user_metadata.address;
      const phone = user.user_metadata.phone_number;

      if (!name || !address || !user.email) {
        console.error('Cannot create venue profile, user metadata incomplete.');
        setCurrentVenue(null);
        return;
      }

      const venuePayload = VenueService.mapVenueToDb({
        name,
        address,
        email: user.email,
        imageUrl:
          'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        status: 'active',
        description: '',
        musicStyles: [],
        capacity: 0,
        contact: { name: '', phone: phone || '' },
        website: '',
        socials: { instagram: '' },
        proposalInfo: {
          structure: { title: 'Estrutura Oferecida', details: [] },
          audience: { title: 'Nosso Público', details: [] },
        },
        photos: [],
        equipment: [],
      });
      const finalPayload = { ...venuePayload, id: user.id };

      const { data: newProfile, error: insertError } = await supabase
        .from('venues')
        .insert(finalPayload)
        .select()
        .single();

      if (insertError) {
        console.error(
          'CRITICAL: RLS Error. Failed to create venue profile on login:',
          insertError.message
        );
        setCurrentVenue(null);
      } else {
        setCurrentVenue(VenueService.mapVenueFromDb(newProfile));
        sessionStorage.setItem('isNewUser', 'true');
      }
    };

    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user ?? null;

        if (user && user.user_metadata.user_type === 'venue') {
          const { data: profile, error: profileError } = await supabase
            .from('venues')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile?.status === 'blocked') {
            await supabase.auth.signOut();
            setAuthUser(null);
            setCurrentVenue(null);
          } else if (profile) {
            setAuthUser(user);
            setCurrentVenue(VenueService.mapVenueFromDb(profile));
          } else if (profileError && profileError.code === 'PGRST116') {
            await createInitialProfile(user);
            setAuthUser(user);
          } else if (profileError) {
            console.error('Error fetching venue profile:', profileError.message);
            setCurrentVenue(null);
            setAuthUser(null);
          }
        } else {
          setCurrentVenue(null);
          setAuthUser(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<LoginResult> => {
    if (!isSupabaseConfigured) {
      return { success: false, message: "A funcionalidade de login está desabilitada." };
    }

    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });
    
    if (signInError) {
      if (signInError.message === 'Email not confirmed') {
          return { success: false, message: 'Seu email ainda não foi confirmado. Verifique sua caixa de entrada e o spam.' };
      }
      return { success: false, message: 'Email ou senha incorretos.' };
    }

    if (sessionData.user) {
        const { data: profile } = await supabase
            .from('venues')
            .select('status')
            .eq('id', sessionData.user.id)
            .single();
        
        if (profile?.status === 'blocked') {
            await supabase.auth.signOut();
            return { success: false, message: 'Sua conta foi bloqueada. Entre em contato com o suporte.' };
        }
    }

    // onAuthStateChange will handle setting the user/profile
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
      if (!isSupabaseConfigured || !venueData.email || !venueData.password) {
          return { success: false, error: "Dados de cadastro incompletos." };
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
          email: venueData.email,
          password: venueData.password,
          options: {
              data: {
                  full_name: venueData.name,
                  address: venueData.address,
                  phone_number: venueData.contact?.phone,
                  user_type: 'venue'
              }
          }
      });

      if (signUpError) {
          return { success: false, error: "Não foi possível realizar o cadastro. Verifique se o e-mail já está em uso." };
      }
       if (!data.user) {
          return { success: false, error: "Ocorreu um erro desconhecido durante o cadastro." };
      }
      
      const requiresConfirmation = !data.session;
      return { success: true, requiresConfirmation };
  };

  const updateVenueProfile = async (updatedData: Partial<Venue>) => {
    if (!currentVenue || !isSupabaseConfigured) return;
    
    const updatedVenue = { ...currentVenue, ...updatedData };
    const supabasePayload = VenueService.mapVenueToDb(updatedVenue);

    const { error } = await supabase
      .from('venues')
      .update(supabasePayload)
      .eq('id', currentVenue.id);

    if (error) {
      console.error("Failed to update venue profile in Supabase:", error.message);
      alert("Erro ao salvar o perfil. Tente novamente.");
    } else {
      setCurrentVenue(updatedVenue);
    }
  };

  const value = { isAuthenticated: !!currentVenue, currentVenue, authUser, login, logout, signup, updateVenueProfile };

  if (isLoading) {
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
