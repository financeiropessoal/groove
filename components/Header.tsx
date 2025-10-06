import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { Notification } from '../types';
import NotificationPanel from './NotificationPanel';
import { NotificationService } from '../services/NotificationService';
import { ChatService } from '../services/ChatService';
import { supabase, isSupabaseConfigured } from '../supabaseClient';


const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated: isArtistAuthenticated, artist, logout: artistLogout, authUser: artistAuthUser } = useAuth();
  const { isAuthenticated: isVenueAuthenticated, currentVenue, logout: venueLogout, authUser: venueAuthUser } = useVenueAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  
  const currentUser = useMemo(() => {
    if (isArtistAuthenticated && artist && artistAuthUser) {
        return { id: artist.id, type: 'artist' as const, authUserId: artistAuthUser.id };
    }
    if (isVenueAuthenticated && currentVenue && venueAuthUser) {
        return { id: currentVenue.id, type: 'venue' as const, authUserId: venueAuthUser.id };
    }
    return null;
  }, [isArtistAuthenticated, artist, artistAuthUser, isVenueAuthenticated, currentVenue, venueAuthUser]);


  useEffect(() => {
    const fetchNotifications = async () => {
      let fetched: Notification[] = [];
      if (isArtistAuthenticated && artist) {
        fetched = await NotificationService.getArtistNotifications(artist.id);
      } else if (isVenueAuthenticated && currentVenue) {
        fetched = await NotificationService.getVenueNotifications(currentVenue.id);
      }
      setNotifications(fetched);
    };

    const fetchUnreadMessages = async () => {
        if (currentUser) {
            const count = await ChatService.getUnreadMessageCount(currentUser.authUserId, currentUser.type, currentUser.id);
            setUnreadMessageCount(count);
        } else {
            setUnreadMessageCount(0);
        }
    };
    
    fetchNotifications();
    fetchUnreadMessages();
    
    // FIX: Prevent Supabase real-time subscription if not configured, which causes a crash.
    if (!isSupabaseConfigured) return;

    // Realtime subscription for messages
    const messageChannel = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, 
            (payload) => {
                // Refetch count on any message change (insert, update for read status)
                fetchUnreadMessages();
            }
        )
        .subscribe();
    
    return () => {
        supabase.removeChannel(messageChannel);
    };
  }, [isArtistAuthenticated, artist, isVenueAuthenticated, currentVenue, currentUser]);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggleNotifications = () => {
    setIsNotificationPanelOpen(prev => !prev);
    // Optimistically mark all as read when opening
    if (!isNotificationPanelOpen) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };


  const navButtonClasses = "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300";
  const activeClasses = "text-white font-semibold";
  const inactiveClasses = "text-gray-400 hover:text-white";

  const mobileNavButtonClasses = "block w-full text-left px-4 py-3 rounded-md text-base font-medium transition-colors duration-300";
  const mobileActiveClasses = "bg-gradient-to-r from-pink-500 to-orange-500 text-white";
  const mobileInactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  const isAuthenticated = isArtistAuthenticated || isVenueAuthenticated;

  const handleLogout = () => {
    if(isArtistAuthenticated) artistLogout();
    if(isVenueAuthenticated) venueLogout();
    setIsMobileMenuOpen(false);
  }
  
  const AuthSection: React.FC<{isMobile?: boolean}> = ({ isMobile = false }) => {
    const commonButtons = (
        <div className="flex items-center space-x-1">
             <Link
                to="/conversations"
                className="relative text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700/50"
                aria-label="Ver conversas"
              >
                <i className="fas fa-comments text-lg"></i>
                {unreadMessageCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-xs bg-red-500 rounded-full border-2 border-gray-800 flex items-center justify-center font-bold">{unreadMessageCount}</span>
                )}
              </Link>
             <button 
                onClick={handleToggleNotifications} 
                className="relative text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700/50"
                aria-label="Ver notificações"
              >
                <i className="fas fa-bell text-lg"></i>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"></span>
                )}
            </button>
        </div>
    );

    if (isVenueAuthenticated && currentVenue) {
       return (
         <div className="flex items-center space-x-2">
            {commonButtons}
            <Link to="/venue-dashboard" className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:shadow-[0_0_15px_rgba(236,72,153,0.7)] transition-shadow">
                Meu Painel
            </Link>
            <button onClick={handleLogout} className="text-gray-300 hover:text-white transition-colors hidden sm:block" aria-label="Sair">
                <i className="fas fa-sign-out-alt text-lg"></i>
            </button>
         </div>
       );
    }
    
    if (isArtistAuthenticated && artist) {
         return (
             <div className="flex items-center space-x-2">
                {commonButtons}
                <Link to="/dashboard" className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:shadow-[0_0_15px_rgba(236,72,153,0.7)] transition-shadow">
                    Meu Painel
                </Link>
                <button onClick={handleLogout} className="text-gray-300 hover:text-white transition-colors hidden sm:block" aria-label="Sair">
                    <i className="fas fa-sign-out-alt text-lg"></i>
                </button>
             </div>
       );
    }

    return (
        <Link to="/login" className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:shadow-[0_0_15px_rgba(236,72,153,0.7)] transition-shadow">
            Área do Artista
        </Link>
    );
  }
  
  return (
    <header className="bg-gray-800 shadow-lg relative z-30">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
          <i className="fas fa-wave-square text-pink-500 text-2xl"></i>
          <h1 className="text-xl font-bold tracking-wider">Groove Music</h1>
        </Link>
        
        {/* --- Desktop Menu --- */}
        <div className="hidden sm:flex items-center space-x-4">
          <nav className="flex space-x-2 bg-gray-900 p-1 rounded-lg">
            <NavLink
              to="/"
              className={({ isActive }) => `${navButtonClasses} ${isActive ? activeClasses : inactiveClasses}`}
              end
            >
              Home
            </NavLink>
             <NavLink
              to="/artists"
              className={({ isActive }) => `${navButtonClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
              Artistas
            </NavLink>
            <NavLink
              to="/musician-login"
              className={({ isActive }) => `${navButtonClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
              Músicos
            </NavLink>
            <NavLink
              to="/how-it-works"
              className={({ isActive }) => `${navButtonClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
              Como Funciona
            </NavLink>
            {!isAuthenticated && (
               <NavLink
                to="/venue-login"
                className={({ isActive }) => `${navButtonClasses} ${isActive ? activeClasses : inactiveClasses}`}
              >
                Login Contratante
              </NavLink>
            )}
          </nav>
           <AuthSection />
        </div>

        {/* --- Mobile Menu Button --- */}
        <div className="sm:hidden flex items-center gap-2">
             {isAuthenticated && <AuthSection isMobile />}
             <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white transition-colors p-2"
                aria-label="Abrir menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
            >
                <i className={isMobileMenuOpen ? "fas fa-times text-2xl" : "fas fa-bars text-2xl"}></i>
            </button>
        </div>
      </div>
      
      {isNotificationPanelOpen && (
        <NotificationPanel 
          notifications={notifications} 
          onClose={() => setIsNotificationPanelOpen(false)} 
        />
      )}


      {/* --- Mobile Menu Panel --- */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="sm:hidden bg-gray-800 absolute top-full left-0 w-full shadow-lg z-20 animate-fade-in">
            <nav className="flex flex-col p-4 space-y-2">
                 <NavLink
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `${mobileNavButtonClasses} ${isActive ? mobileActiveClasses : mobileInactiveClasses}`}
                    end
                    >
                    Home
                </NavLink>
                 <NavLink
                    to="/artists"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `${mobileNavButtonClasses} ${isActive ? mobileActiveClasses : mobileInactiveClasses}`}
                    >
                    Artistas
                </NavLink>
                <NavLink
                    to="/musician-login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `${mobileNavButtonClasses} ${isActive ? mobileActiveClasses : mobileInactiveClasses}`}
                    >
                    Músicos
                </NavLink>
                <NavLink
                    to="/how-it-works"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `${mobileNavButtonClasses} ${isActive ? mobileActiveClasses : mobileInactiveClasses}`}
                >
                    Como Funciona
                </NavLink>

                <hr className="border-gray-700 my-2" />
                
                {isVenueAuthenticated && currentVenue && (
                    <>
                    <Link to="/venue-dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`${mobileNavButtonClasses} ${mobileActiveClasses}`}>
                        Meu Painel
                    </Link>
                     <Link to="/conversations" onClick={() => setIsMobileMenuOpen(false)} className={`${mobileNavButtonClasses} ${mobileInactiveClasses}`}>
                        Mensagens
                    </Link>
                     <button onClick={handleLogout} className={`${mobileNavButtonClasses} ${mobileInactiveClasses}`}>
                        Sair
                    </button>
                    </>
                )}

                {isArtistAuthenticated && artist && (
                    <>
                     <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={`${mobileNavButtonClasses} ${mobileActiveClasses}`}>
                        Meu Painel
                     </Link>
                      <Link to="/conversations" onClick={() => setIsMobileMenuOpen(false)} className={`${mobileNavButtonClasses} ${mobileInactiveClasses}`}>
                        Mensagens
                    </Link>
                     <button onClick={handleLogout} className={`${mobileNavButtonClasses} ${mobileInactiveClasses}`}>
                        Sair
                    </button>
                    </>
                )}

                {!isAuthenticated && (
                    <>
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className={`${mobileNavButtonClasses} ${mobileActiveClasses}`}>
                            Área do Artista
                        </Link>
                        <Link to="/venue-login" onClick={() => setIsMobileMenuOpen(false)} className={`${mobileNavButtonClasses} ${mobileInactiveClasses}`}>
                            Login Contratante
                        </Link>
                    </>
                )}

            </nav>
        </div>
      )}
    </header>
  );
};

export default Header;