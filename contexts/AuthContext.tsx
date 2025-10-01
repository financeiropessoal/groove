import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { ArtistService } from '../services/ArtistService';
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

interface AuthContextType {
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  artist: Artist | null;
  authUser: User | null;
  login: (email: string, pass: string) => Promise<LoginResult>;
  signup: (name: string, email: string, pass: string, phone: string) => Promise<SignupResult>;
  logout: () => void;
  adminLogin: (email: string, pass: string) => Promise<boolean>;
  adminLogout: () => void;
  updateArtistProfile: (updatedData: Partial<Artist>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD;


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => !!localStorage.getItem('adminToken'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const createInitialProfile = async (user: User) => {
      const fullName = user.user_metadata.full_name;
      const phone = user.user_metadata.phone_number;
      if (!fullName || !user.email) {
        console.error('Cannot create profile, user metadata incomplete.');
        setArtist(null);
        return;
      }

      const artistPayload = ArtistService.mapArtistToDb({
        name: fullName,
        email: user.email,
        phone: phone,
        status: 'pending',
        genre: { primary: '', secondary: [] },
        imageUrl:
          'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        youtubeVideoId: '',
        bio: '',
        socials: {},
        bookedDates: [],
        gallery: [],
        plans: [],
        repertoire: [],
        testimonials: [],
        technicalRequirements: {
          space: '',
          power: '',
          providedByArtist: [],
          providedByContractor: [],
        },
        hospitalityRider: [],
      });
      const finalPayload = { ...artistPayload, id: user.id };

      const { data: newProfile, error: insertError } = await supabase
        .from('artists')
        .insert(finalPayload)
        .select()
        .single();

      if (insertError) {
        console.error(
          'CRITICAL: RLS Error. Failed to create profile on login:',
          insertError.message
        );
        setArtist(null);
      } else {
        setArtist(ArtistService.mapArtistFromDb(newProfile));
        sessionStorage.setItem('isNewUser', 'true');
      }
    };

    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        const user = session?.user ?? null;

        if (user && user.user_metadata.user_type === 'artist') {
          const { data: profile, error: profileError } = await supabase
            .from('artists')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile?.status === 'blocked') {
            // If user is blocked, force sign out and clear state
            await supabase.auth.signOut();
            setAuthUser(null);
            setArtist(null);
          } else if (profile) {
            setAuthUser(user);
            setArtist(ArtistService.mapArtistFromDb(profile));
          } else if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it automatically.
            await createInitialProfile(user);
            // After creation, user state is set inside createInitialProfile
            setAuthUser(user); // Ensure auth user is set
          } else if (profileError) {
            console.error('Error fetching artist profile:', profileError.message);
            setArtist(null);
            setAuthUser(null);
          }
        } else {
          // Not an artist session or no session
          setArtist(null);
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
            .from('artists')
            .select('status')
            .eq('id', sessionData.user.id)
            .single();
        
        if (profile?.status === 'blocked') {
            await supabase.auth.signOut(); // Immediately sign out the blocked user
            return { success: false, message: 'Sua conta foi bloqueada. Entre em contato com o suporte.' };
        }
    }
    
    // onAuthStateChange will handle setting the user and profile
    return { success: true };
  };

  const signup = async (name: string, email: string, pass: string, phone: string): Promise<SignupResult> => {
    if (!isSupabaseConfigured) {
        return { success: false, error: "Supabase não configurado." };
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: pass,
        options: {
            data: {
                full_name: name,
                phone_number: phone,
                user_type: 'artist'
            }
        }
    });

    if (signUpError) {
        return { success: false, error: "Não foi possível realizar o cadastro. Verifique se o e-mail já está em uso." };
    }
    
    const requiresConfirmation = !data.session;
    return { success: true, requiresConfirmation };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setArtist(null);
    setAuthUser(null);
    navigate('/login');
  };

  const adminLogin = async (email: string, pass: string): Promise<boolean> => {
     await new Promise(resolve => setTimeout(resolve, 500));
     if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error("Credenciais de admin não configuradas no ambiente. Defina ADMIN_EMAIL e ADMIN_PASSWORD.");
        return false;
     }
     if(email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && pass === ADMIN_PASSWORD) {
        localStorage.setItem('adminToken', 'true');
        setIsAdminAuthenticated(true);
        navigate('/admin/dashboard');
        return true;
     }
     return false;
  }

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdminAuthenticated(false);
    navigate('/admin/login');
  }

  const updateArtistProfile = async (updatedData: Partial<Artist>) => {
    if (!artist || !isSupabaseConfigured) return;
    
    const updatedArtist = { ...artist, ...updatedData };
    const supabasePayload = ArtistService.mapArtistToDb(updatedArtist);

    const { error } = await supabase
      .from('artists')
      .update(supabasePayload)
      .eq('id', artist.id);

    if (error) {
      console.error("Failed to update profile in Supabase:", error.message);
      alert("Erro ao salvar o perfil. Tente novamente.");
    } else {
      setArtist(updatedArtist);
    }
  };
  
  const value = { isAuthenticated: !!artist, isAdminAuthenticated, artist, authUser, login, signup, logout, adminLogin, adminLogout, updateArtistProfile };
  
  if (isLoading) {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};