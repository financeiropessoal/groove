import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { ChatService, EnrichedConversation } from '../services/ChatService';
import EmptyState from '../components/EmptyState';

const ConversationsPage: React.FC = () => {
    const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { artist, authUser: artistAuthUser, isAuthenticated: isArtistAuthenticated } = useAuth();
    const { currentVenue, authUser: venueAuthUser } = useVenueAuth();
    
    const currentUser = useMemo(() => {
        if (artist && artistAuthUser) return { id: artist.id, authId: artistAuthUser.id, type: 'artist' as const };
        if (currentVenue && venueAuthUser) return { id: currentVenue.id, authId: venueAuthUser.id, type: 'venue' as const };
        return null;
    }, [artist, artistAuthUser, currentVenue, venueAuthUser]);
    
    const dashboardPath = isArtistAuthenticated ? '/dashboard' : '/venue-dashboard';

    useEffect(() => {
        if (currentUser) {
            ChatService.getConversationsForUser(currentUser.id, currentUser.type, currentUser.authId).then(data => {
                setConversations(data);
                setIsLoading(false);
            });
        }
    }, [currentUser]);

    if (isLoading) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
             <div className="flex items-center gap-4 mb-6">
                <Link to={dashboardPath} className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </Link>
                <h1 className="text-3xl font-bold">Minhas Conversas</h1>
            </div>
            {conversations.length > 0 ? (
                <div className="bg-gray-800 rounded-lg">
                    {conversations.map(conv => (
                        <Link to={`/chat/${conv.conversationId}`} key={conv.conversationId} className="flex items-center p-4 border-b border-gray-700 hover:bg-gray-700/50">
                            <img src={conv.otherParty.imageUrl} alt={conv.otherParty.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                            <div className="flex-1">
                                <h2 className="font-bold">{conv.otherParty.name}</h2>
                                <p className="text-sm text-gray-400 truncate">{conv.lastMessage?.content}</p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <span className="bg-pink-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{conv.unreadCount}</span>
                            )}
                        </Link>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon="fa-comments"
                    title="Nenhuma conversa iniciada"
                    message="Quando você iniciar uma conversa com um artista ou contratante, ela aparecerá aqui."
                />
            )}
        </div>
    );
};

export default ConversationsPage;