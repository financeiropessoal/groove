import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { ChatService, Message, OtherParty } from '../services/ChatService';

const ChatPage: React.FC = () => {
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    
    const { isAuthenticated: isArtistAuth, artist, authUser: artistAuthUser } = useAuth();
    const { isAuthenticated: isVenueAuth, currentVenue, authUser: venueAuthUser } = useVenueAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherParty, setOtherParty] = useState<OtherParty | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentUser = useMemo(() => {
        if (isArtistAuth && artist && artistAuthUser) {
          return { id: artist.id, type: 'artist' as const, authUserId: artistAuthUser.id };
        }
        if (isVenueAuth && currentVenue && venueAuthUser) {
          return { id: currentVenue.id, type: 'venue' as const, authUserId: venueAuthUser.id };
        }
        return null;
    }, [isArtistAuth, artist, artistAuthUser, isVenueAuth, currentVenue, venueAuthUser]);

    useEffect(() => {
        const setupChat = async () => {
            if (!conversationId || !currentUser) {
                navigate('/');
                return;
            }

            setIsLoading(true);
            const convId = Number(conversationId);
            const conversation = await ChatService.getConversation(convId);

            if (!conversation || (currentUser.type === 'artist' && currentUser.id !== conversation.artist_id) || (currentUser.type === 'venue' && currentUser.id !== conversation.venue_id)) {
                navigate('/'); // Not part of this conversation
                return;
            }
            
            // Mark messages as read upon entering chat
            ChatService.markMessagesAsRead(convId, currentUser.authUserId);

            const [fetchedParty, fetchedMessages] = await Promise.all([
                ChatService.getOtherParty(conversation, currentUser.type),
                ChatService.getMessages(convId)
            ]);

            setOtherParty(fetchedParty);
            setMessages(fetchedMessages);
            setIsLoading(false);
        };
        setupChat();
    }, [conversationId, currentUser, navigate]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        if (!conversationId) return;

        const channel = ChatService.subscribeToMessages(Number(conversationId), (newMessagePayload) => {
            setMessages(prevMessages => {
                if (prevMessages.some(m => m.id === newMessagePayload.id)) {
                    return prevMessages;
                }
                return [...prevMessages, newMessagePayload];
            });
            // Mark new incoming message as read immediately
            if(currentUser) {
                ChatService.markMessagesAsRead(Number(conversationId), currentUser.authUserId);
            }
        });

        return () => {
            channel.unsubscribe();
        };
    }, [conversationId, currentUser]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !conversationId) return;
        
        setIsSending(true);
        
        const success = await ChatService.sendMessage(Number(conversationId), currentUser.authUserId, currentUser.type, newMessage);
        if (success) {
            setNewMessage('');
        }
        setIsSending(false);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><i className="fas fa-spinner fa-spin text-4xl text-red-500"></i></div>;
    }
    
    if (!otherParty) {
        return <div className="text-center py-10">Não foi possível carregar a conversa.</div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto bg-gray-800/50 rounded-lg overflow-hidden">
            <header className="flex-shrink-0 bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={otherParty.imageUrl} alt={otherParty.name} className="w-10 h-10 rounded-full object-cover" />
                    <h2 className="font-bold text-white text-lg">{otherParty.name}</h2>
                </div>
                <Link to={otherParty.type === 'artist' ? `/artists/${otherParty.id}` : '/venues'} className="text-sm text-red-400 hover:underline">
                    Ver Perfil
                </Link>
            </header>

            <main className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => {
                    const isMe = msg.sender_id === currentUser?.authUserId;
                    return (
                        <div key={index} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <img src={otherParty.imageUrl} alt={otherParty.name} className="w-6 h-6 rounded-full object-cover self-start" />
                            )}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isMe ? 'bg-red-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </main>

            <footer className="flex-shrink-0 p-4 bg-gray-800 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-grow bg-gray-900 border border-gray-700 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        autoComplete="off"
                    />
                    <button type="submit" disabled={isSending || !newMessage.trim()} className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:bg-red-700 disabled:bg-gray-600">
                        {isSending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatPage;
