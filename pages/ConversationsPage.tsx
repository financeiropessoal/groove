import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { ChatService, EnrichedConversation } from '../services/ChatService';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const timeAgo = (date: string | Date): string => {
    const d = new Date(date);
    const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `há ${Math.floor(interval)} anos`;
    interval = seconds / 2592000;
    if (interval > 1) return `há ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `há ${Math.floor(interval)}d`;
    interval = seconds / 3600;
    if (interval > 1) return `há ${Math.floor(interval)}h`;
    interval = seconds / 60;
    if (interval > 1) return `há ${Math.floor(interval)}m`;
    return "agora";
};

const ConversationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated: isArtistAuth, artist, authUser: artistAuthUser } = useAuth();
    const { isAuthenticated: isVenueAuth, currentVenue, authUser: venueAuthUser } = useVenueAuth();

    const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentUser = useMemo(() => {
        if (isArtistAuth && artist && artistAuthUser) {
          return { id: artist.id, type: 'artist' as const, authUserId: artistAuthUser.id };
        }
        if (isVenueAuth && currentVenue && venueAuthUser) {
          return { id: currentVenue.id, type: 'venue' as const, authUserId: venueAuthUser.id };
        }
        return null;
    }, [isArtistAuth, artist, artistAuthUser, isVenueAuth, currentVenue, venueAuthUser]);

    const fetchConversations = async () => {
        if (!currentUser) {
            navigate('/');
            return;
        }
        setIsLoading(true);
        const data = await ChatService.getConversationsForUser(currentUser.id, currentUser.type, currentUser.authUserId);
        setConversations(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchConversations();
    }, [currentUser, navigate]);
    
    useEffect(() => {
        if (!isSupabaseConfigured) return;
        
        const messageChannel = supabase
            .channel('public:messages:conversations_page')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, 
                (payload) => {
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(messageChannel);
        };
    }, [currentUser]);


    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <i className="fas fa-comments text-red-500"></i>
                    Minhas Conversas
                </h1>
                <p className="text-gray-400 mt-1">Veja suas negociações e mensagens recentes.</p>
            </header>

            {isLoading ? (
                <div className="text-center py-20">
                    <i className="fas fa-spinner fa-spin text-4xl text-red-500"></i>
                    <p className="mt-4 text-gray-300">Carregando conversas...</p>
                </div>
            ) : conversations.length > 0 ? (
                <div className="space-y-3">
                    {conversations.map(({ conversationId, otherParty, lastMessage, unreadCount }) => {
                        const hasUnread = unreadCount > 0;
                        return (
                        <Link 
                            key={conversationId} 
                            to={`/chat/${conversationId}`}
                            className="block bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700/50 hover:ring-2 hover:ring-red-500 transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <img src={otherParty.imageUrl} alt={otherParty.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-white text-lg truncate ${hasUnread ? 'font-bold' : 'font-semibold'}`}>{otherParty.name}</h3>
                                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                            {lastMessage ? timeAgo(lastMessage.created_at) : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm truncate ${hasUnread ? 'text-white font-medium' : 'text-gray-400'}`}>
                                            {lastMessage ? lastMessage.content : 'Nenhuma mensagem ainda.'}
                                        </p>
                                        {hasUnread && (
                                            <span className="w-5 h-5 text-xs bg-red-500 rounded-full flex items-center justify-center font-bold flex-shrink-0 ml-2">{unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )})}
                </div>
            ) : (
                <EmptyState
                    icon="fa-comment-slash"
                    title="Nenhuma conversa iniciada"
                    message="Para iniciar uma conversa, encontre um artista na página inicial e clique em 'Mensagem' no perfil dele."
                >
                    <Link to="/artists" className="mt-4 inline-block bg-red-600 text-white font-bold py-2 px-5 rounded-md hover:bg-red-700 transition-colors">
                        Encontrar Artistas
                    </Link>
                </EmptyState>
            )}
        </div>
    );
};

export default ConversationsPage;