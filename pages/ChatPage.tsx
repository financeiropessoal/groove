
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVenueAuth } from '../contexts/VenueAuthContext';
import { ChatService, Message, Conversation, OtherParty } from '../services/ChatService';

const ChatPage: React.FC = () => {
    const { conversationId } = useParams<{ conversationId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [otherParty, setOtherParty] = useState<OtherParty | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { artist, authUser: artistAuthUser } = useAuth();
    const { currentVenue, authUser: venueAuthUser } = useVenueAuth();
    
    const currentUser = useMemo(() => {
        if (artist && artistAuthUser) return { id: artist.id, authId: artistAuthUser.id, type: 'artist' as const, name: artist.name };
        if (currentVenue && venueAuthUser) return { id: currentVenue.id, authId: venueAuthUser.id, type: 'venue' as const, name: currentVenue.name };
        return null;
    }, [artist, artistAuthUser, currentVenue, venueAuthUser]);

    useEffect(() => {
        const id = Number(conversationId);
        if (isNaN(id) || !currentUser) return;
        
        ChatService.getConversation(id).then(conv => {
            if (conv) {
                setConversation(conv);
                ChatService.getOtherParty(conv, currentUser.type).then(setOtherParty);
                ChatService.getMessages(id).then(setMessages);
                ChatService.markMessagesAsRead(id, currentUser.authId);
            }
        });

        const subscription = ChatService.subscribeToMessages(id, (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
            ChatService.markMessagesAsRead(id, currentUser.authId);
        });

        // FIX: The useEffect cleanup function cannot return a Promise.
        // Wrap the unsubscribe call in braces to ensure the function returns void.
        return () => {
            subscription.unsubscribe();
        };
    }, [conversationId, currentUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation || !currentUser) return;
        
        const success = await ChatService.sendMessage(conversation.id, currentUser.authId, currentUser.type, newMessage);
        if (success) {
            setNewMessage('');
        }
    };
    
    if (!otherParty || !currentUser) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-150px)] bg-gray-800 rounded-lg">
            <header className="flex items-center p-4 border-b border-gray-700">
                <Link to="/conversations" className="mr-4 text-gray-400 hover:text-white"><i className="fas fa-arrow-left"></i></Link>
                <img src={otherParty.imageUrl} alt={otherParty.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                <h2 className="font-bold text-lg">{otherParty.name}</h2>
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === currentUser.authId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender_id === currentUser.authId ? 'bg-pink-600' : 'bg-gray-700'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs text-gray-400 text-right mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-gray-900 rounded-full py-2 px-4 focus:outline-none"
                    />
                    <button type="submit" className="bg-pink-600 rounded-full w-10 h-10 flex items-center justify-center"><i className="fas fa-paper-plane"></i></button>
                </form>
            </footer>
        </div>
    );
};

export default ChatPage;
