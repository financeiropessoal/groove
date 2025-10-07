
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { SpecialPrice, Venue } from '../types';

export class SpecialPriceService {

    static async getSpecialPrices(artistId: string, venueId: string): Promise<Omit<SpecialPrice, 'venues'>[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('special_prices')
            .select('*')
            .eq('artist_id', artistId)
            .eq('venue_id', venueId);

        if (error) {
            console.error('Error fetching special prices:', error.message);
            return [];
        }
        return data || [];
    }

    static async getSpecialPricesForArtist(artistId: string): Promise<SpecialPrice[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('special_prices')
            .select('*, venues (id, name, address, imageUrl)')
            .eq('artist_id', artistId);

        if (error) {
            console.error('Error fetching special prices for artist:', error.message);
            return [];
        }
        return data || [];
    }
    
    static async setSpecialPricesForVenue(artistId: string, venueId: string, prices: SpecialPrice[]): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const upsertData = prices.map(p => ({
            artist_id: artistId,
            venue_id: venueId,
            plan_id: p.plan_id,
            special_price: p.special_price
        }));

        // Upsert based on the composite primary key (artist_id, venue_id, plan_id)
        const { error } = await supabase.from('special_prices').upsert(upsertData, {
            onConflict: 'artist_id,venue_id,plan_id'
        });

        if (error) {
            console.error('Error setting special prices:', error.message);
            return false;
        }
        return true;
    }

    static async deleteSpecialPricesForVenue(artistId: string, venueId: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        
        const { error } = await supabase
            .from('special_prices')
            .delete()
            .eq('artist_id', artistId)
            .eq('venue_id', venueId);

        if(error) {
            console.error('Error deleting special prices:', error.message);
            return false;
        }
        return true;
    }
}
