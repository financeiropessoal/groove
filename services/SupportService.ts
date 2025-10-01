import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { SupportTicket } from '../types';

export class SupportService {

    static async createTicket(ticketData: Omit<SupportTicket, 'id' | 'created_at' | 'status'>): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase.from('support_tickets').insert([{ ...ticketData, status: 'open' }]);
        if (error) {
            console.error("Error creating support ticket:", error.message);
            return false;
        }
        return true;
    }

    static async getAllTickets(): Promise<SupportTicket[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*, bookings(*, artists(name), venues(name))')
            .order('created_at', { ascending: false });

        if (error || !data) {
            console.error("Error fetching support tickets:", error?.message);
            return [];
        }

        return data.map((t: any) => ({
            id: t.id,
            created_at: t.created_at,
            booking_id: t.booking_id,
            reporter_id: t.reporter_id,
            reporter_type: t.reporter_type,
            description: t.description,
            status: t.status,
            booking: {
                ...t.bookings,
                artistName: t.bookings?.artists?.name,
                venueName: t.bookings?.venues?.name,
            },
            reporter: {
                name: t.reporter_type === 'artist' ? t.bookings?.artists?.name : t.bookings?.venues?.name,
                type: t.reporter_type,
            },
        }));
    }

    static async updateTicketStatus(ticketId: number, status: 'open' | 'in_progress' | 'resolved'): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('support_tickets')
            .update({ status })
            .eq('id', ticketId);

        if (error) {
            console.error("Error updating ticket status:", error.message);
            return false;
        }
        return true;
    }
}
