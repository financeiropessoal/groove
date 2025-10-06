import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { FinancialService } from './FinancialService';

export interface ManualGig {
    id: number;
    created_at: string;
    artist_id: string;
    event_name: string;
    date: string;
    start_time: string;
    end_time: string;
    payment: number;
}

export type ManualGigPayload = Omit<ManualGig, 'id' | 'created_at' | 'artist_id'>;

export class ManualGigService {
    
    static mapFromDb(dbObj: any): ManualGig {
        return {
            id: dbObj.id,
            created_at: dbObj.created_at,
            artist_id: dbObj.artist_id,
            event_name: dbObj.event_name,
            date: dbObj.date,
            start_time: dbObj.start_time,
            end_time: dbObj.end_time,
            payment: dbObj.payment,
        };
    }
    
    static mapToDb(payload: ManualGigPayload, artistId: string): any {
        return {
            artist_id: artistId,
            event_name: payload.event_name,
            date: payload.date,
            start_time: payload.start_time,
            end_time: payload.end_time,
            payment: payload.payment,
        };
    }

    static async getManualGigs(artistId: string): Promise<ManualGig[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('manual_gigs')
            .select('*')
            .eq('artist_id', artistId);

        if (error) {
            console.error('Error fetching manual gigs:', error.message);
            return [];
        }
        return (data || []).map(this.mapFromDb);
    }
    
     static async getManualGigById(gigId: number): Promise<ManualGig | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('manual_gigs')
            .select('*')
            .eq('id', gigId)
            .single();

        if (error) return null;
        return this.mapFromDb(data);
    }

    static async addManualGig(payload: ManualGigPayload, artistId: string, currentBookedDates: string[]): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        
        // Add to manual_gigs table
        const { data: newGig, error } = await supabase
            .from('manual_gigs')
            .insert(this.mapToDb(payload, artistId))
            .select()
            .single();

        if (error || !newGig) {
            console.error('Error adding manual gig:', error?.message);
            return false;
        }

        // Add to artist's booked_dates
        const updatedDates = [...new Set([...currentBookedDates, payload.date])];
        const { error: artistUpdateError } = await supabase
            .from('artists')
            .update({ booked_dates: updatedDates })
            .eq('id', artistId);

        if (artistUpdateError) console.error("Failed to update artist's booked dates:", artistUpdateError.message);
        
        // Add to personal finances if payment is provided
        if (payload.payment > 0) {
            await FinancialService.addTransaction(artistId, {
                type: 'income',
                description: `Show: ${payload.event_name}`,
                category: 'Cachê',
                value: payload.payment,
                status: 'pending', // Pending until the date of the gig
                date: payload.date
            });
        }
        
        return true;
    }

    static async updateManualGig(gigId: number, payload: ManualGigPayload, artistId: string, currentBookedDates: string[]): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        
        const { data: oldGigData, error: fetchError } = await supabase.from('manual_gigs').select('date').eq('id', gigId).single();
        if(fetchError) { console.error(fetchError); return false; }
        const oldDate = oldGigData.date;

        const { error } = await supabase
            .from('manual_gigs')
            .update(this.mapToDb(payload, artistId))
            .eq('id', gigId);

        if (error) {
            console.error('Error updating manual gig:', error.message);
            return false;
        }
        
        // Update artist's booked_dates if the date changed
        if(oldDate !== payload.date) {
            const datesWithoutOld = currentBookedDates.filter(d => d !== oldDate);
            const updatedDates = [...new Set([...datesWithoutOld, payload.date])];
             await supabase.from('artists').update({ booked_dates: updatedDates }).eq('id', artistId);
        }

        return true;
    }

    static async deleteManualGig(gigId: number, artistId: string, currentBookedDates: string[]): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        
        const { data: gigToDelete, error: fetchError } = await supabase.from('manual_gigs').select('date').eq('id', gigId).single();
        if (fetchError) { console.error(fetchError); return false; }
        
        const { error } = await supabase.from('manual_gigs').delete().eq('id', gigId);
        if (error) {
            console.error('Error deleting manual gig:', error.message);
            return false;
        }

        // Remove from artist's booked_dates
        const updatedDates = currentBookedDates.filter(d => d !== gigToDelete.date);
         await supabase.from('artists').update({ booked_dates: updatedDates }).eq('id', artistId);
        
        return true;
    }
}