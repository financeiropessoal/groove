
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { ArtistService } from './ArtistService';
import { VenueService } from './VenueService';
import { Artist } from '../types';
import { Venue } from '../types';

export interface Conversation {
    id: number;
    artist_id: string;
    venue_id: string;
    created_at: string;
}

export interface Message {
    id: number;
    conversation_id: number;
    sender_id: string; // Supabase auth user id
    sender_type: 'artist' | 'venue';
    content: string;
    created_at: string;
    read_by: string[] | null;
}

export interface OtherParty {
    id: string;
    name: string;
    imageUrl: string;
    type: 'artist' | 'venue';
}

export interface EnrichedConversation {
    conversationId: number;
    otherParty: OtherParty;
    lastMessage: Message | null;
    unreadCount: number;
}


export class ChatService {

    static async findOrCreateConversation(artistId: string, venueId: string): Promise<Conversation | null> {
        if (!isSupabaseConfigured) return null;

        const { data: existing, error: findError } = await supabase
            .from('conversations')
            .select('*')
            .eq('artist_id', artistId)
            .eq('venue_id', venueId)
            .maybeSingle();

        if (findError) {
            console.error("Error finding conversation:", findError);
            return null;
        }

        if (existing) {
            return existing;
        }

        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({ artist_id: artistId, venue_id: venueId })
            .select()
            .single();
        
        if (createError) {
            console.error("Error creating conversation:", createError);
            return null;
        }

        return newConversation;
    }
    
    static async getConversation(conversationId: number): Promise<Conversation | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
        if (error) { console.error("Error getting conversation:", error.message); return null; }
        return data;
    }
    
    static async getOtherParty(conversation: Conversation, currentUserType: 'artist' | 'venue'): Promise<OtherParty | null> {
        if (currentUserType === 'artist') {
            const venue = await VenueService.getVenueById(conversation.venue_id);
            return venue ? { id: venue.id, name: venue.name, imageUrl: venue.imageUrl, type: 'venue' } : null;
        } else {
            const artist = await ArtistService.getArtistById(conversation.artist_id);
            return artist ? { id: artist.id, name: artist.name, imageUrl: artist.imageUrl, type: 'artist' } : null;
        }
    }

    static async getMessages(conversationId: number): Promise<Message[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at');
        if (error) { console.error("Error getting messages:", error.message); return []; }
        return data || [];
    }

    static async sendMessage(conversationId: number, senderId: string, senderType: 'artist' | 'venue', content: string): Promise<boolean> {
        if (!isSupabaseConfigured || !content.trim()) return false;

        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                sender_type: senderType,
                content: content.trim(),
                read_by: [senderId], // The sender has "read" it by sending it
            });

        if (error) {
            console.error("Error sending message:", error);
            return false;
        }
        return true;
    }
    
    static subscribeToMessages(conversationId: number, onNewMessage: (payload: Message) => void) {
        if (!isSupabaseConfigured) return { unsubscribe: () => {} };
        
        const channel = supabase.channel(`messages-conv-${conversationId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
                (payload) => {
                    onNewMessage(payload.new as Message);
                }
            )
            .subscribe();
            
        return channel;
    }
    
    static async markMessagesAsRead(conversationId: number, readerAuthId: string) {
        if (!isSupabaseConfigured) return;
        // This is a placeholder for an RPC function `mark_messages_as_read`
        // which would be much more efficient.
        const { data: messagesToUpdate, error } = await supabase
            .from('messages')
            .select('id, read_by')
            .eq('conversation_id', conversationId)
            .not('sender_id', 'eq', readerAuthId)
            .or(`read_by.is.null,not.read_by.cs.{${readerAuthId}}`);

        if (error || !messagesToUpdate) {
            console.error('Error fetching messages to mark as read:', error);
            return;
        }

        for (const msg of messagesToUpdate) {
            const updatedReadBy = [...(msg.read_by || []), readerAuthId];
            await supabase.from('messages').update({ read_by: updatedReadBy }).eq('id', msg.id);
        }
    }

    static async getUnreadMessageCount(userAuthId: string, userType: 'artist' | 'venue', userId: string): Promise<number> {
        if (!isSupabaseConfigured) return 0;

        const column = userType === 'artist' ? 'artist_id' : 'venue_id';
        
        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('id')
            .eq(column, userId);

        if (convError || !conversations) {
            return 0;
        }
        
        const conversationIds = conversations.map(c => c.id);
        if (conversationIds.length === 0) return 0;

        const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .not('sender_id', 'eq', userAuthId)
            .or(`read_by.is.null,not.read_by.cs.{${userAuthId}}`);
        
        if (countError) {
             console.error("Error counting unread messages:", countError);
             return 0;
        }

        return count || 0;
    }
    
    static async getConversationsForUser(userId: string, userType: 'artist' | 'venue', userAuthId: string): Promise<EnrichedConversation[]> {
        if (!isSupabaseConfigured) return [];

        const column = userType === 'artist' ? 'artist_id' : 'venue_id';

        const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq(column, userId);

        if (convError || !conversations) {
            console.error("Error fetching conversations:", convError);
            return [];
        }

        const enrichedConversationsPromises = conversations.map(async (conv) => {
            const otherParty = await this.getOtherParty(conv, userType);

            const { data: lastMessage } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const { count: unreadCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .not('sender_id', 'eq', userAuthId)
                .or(`read_by.is.null,not.read_by.cs.{${userAuthId}}`);

            if (!otherParty) return null;

            return {
                conversationId: conv.id,
                otherParty,
                lastMessage: lastMessage || null,
                unreadCount: unreadCount || 0,
            };
        });
        
        const enrichedConversations = await Promise.all(enrichedConversationsPromises);

        return enrichedConversations
            .filter((c): c is EnrichedConversation => c !== null)
            .sort((a, b) => {
                if (!a.lastMessage) return 1;
                if (!b.lastMessage) return -1;
                return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
            });
    }
}
