import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { ArtistService } from './ArtistService';
import { VenueService } from './VenueService';
import { PlatformTransaction } from '../types';

let cachedCommissionRate: number | null = null;

export class AdminService {

    static async getCommissionRate(): Promise<number> {
        if (cachedCommissionRate !== null) {
            return cachedCommissionRate;
        }
        const defaultValue = 0.10;
        if (!isSupabaseConfigured) return defaultValue;

        const { data, error } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'commission_rate')
            .single();

        if (error || !data) {
            console.warn("Could not fetch commission rate, defaulting to 10%.", error?.message);
            cachedCommissionRate = defaultValue;
            return defaultValue;
        }

        const rate = parseFloat(data.value);
        if (isNaN(rate)) {
            cachedCommissionRate = defaultValue;
            return defaultValue;
        }
        
        cachedCommissionRate = rate;
        return rate;
    }

    static invalidateCommissionRateCache() {
        cachedCommissionRate = null;
    }

    static async getDashboardStats() {
        if (!isSupabaseConfigured) {
            return {
                totalArtists: 0,
                pendingArtists: 0,
                totalVenues: 0,
                totalGigs: 0,
                totalBookings: 0,
                grossRevenue: 0,
                platformCommission: 0,
            };
        }
        
        const commissionRate = await this.getCommissionRate();

        const [
            { count: totalArtists },
            { count: pendingArtists },
            { count: totalVenues },
            { count: totalGigs },
            { data: bookingsData, error: bookingsError }
        ] = await Promise.all([
            supabase.from('artists').select('*', { count: 'exact', head: true }),
            supabase.from('artists').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('venues').select('*', { count: 'exact', head: true }),
            supabase.from('gig_offers').select('*', { count: 'exact', head: true }),
            supabase.from('bookings').select('plan_id, artists(plans)').eq('status', 'paid')
        ]);
        
        let grossRevenue = 0;
        if (!bookingsError && bookingsData) {
            bookingsData.forEach((b: any) => {
                const plan = b.artists?.plans?.find((p: any) => p.id === b.plan_id);
                grossRevenue += plan?.price || 0;
            });
        }

        return {
            totalArtists: totalArtists || 0,
            pendingArtists: pendingArtists || 0,
            totalVenues: totalVenues || 0,
            totalGigs: totalGigs || 0,
            totalBookings: bookingsData?.length || 0,
            grossRevenue,
            platformCommission: grossRevenue * commissionRate,
        };
    }
    
    static async updateArtistStatus(artistId: string, status: 'approved' | 'pending' | 'blocked'): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase.from('artists').update({ status }).eq('id', artistId);
        if (error) {
            console.error("Error updating artist status:", error.message);
            return false;
        }
        return true;
    }

    static async updateVenueStatus(venueId: string, status: 'active' | 'blocked'): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase.from('venues').update({ status }).eq('id', venueId);
        if (error) {
            console.error("Error updating venue status:", error.message);
            return false;
        }
        return true;
    }
    
    static async updateCommissionRate(rate: number): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const rateAsDecimalString = (rate / 100).toFixed(4);

        const { error } = await supabase
            .from('platform_settings')
            .upsert({ key: 'commission_rate', value: rateAsDecimalString }, { onConflict: 'key' });

        if (error) {
            console.error("Error updating commission rate:", error.message);
            return false;
        }
        
        this.invalidateCommissionRateCache();
        return true;
    }
    
    static async getEnrichedBookings(): Promise<any[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('bookings')
            .select('*, artists(*), venues(name)')
            .order('date', { ascending: false });

        if (error || !data) {
            console.error("Error fetching all bookings:", error?.message);
            return [];
        }

        return data.map((b: any) => {
            const plan = b.artists?.plans?.find((p: any) => p.id === b.plan_id);
            return {
                id: b.id,
                artistId: b.artist_id,
                artistName: b.artists?.name || 'Artista Removido',
                venueId: b.venue_id,
                venueName: b.venues?.name || 'Local Removido',
                planId: b.plan_id,
                planName: plan?.name || 'Proposta Direta',
                planPrice: plan?.price || 0,
                date: b.date,
                payoutStatus: b.payout_status
            };
        });
    }
    
    static async updatePayoutStatus(bookingId: number, status: 'pending' | 'paid'): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { error: updateError } = await supabase
            .from('bookings')
            .update({ payout_status: status })
            .eq('id', bookingId);

        if (updateError) {
            console.error("Error updating payout status:", updateError.message);
            return false;
        }

        if (status === 'paid') {
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .select('*, artists(name, plans), venues(name)')
                .eq('id', bookingId)
                .single();
            
            if (bookingError || !booking) {
                console.error("Could not fetch booking details to create commission record.", bookingError?.message);
                return true; 
            }

            const plan = booking.artists?.plans?.find((p: any) => p.id === booking.plan_id);
            const planPrice = plan?.price || 0;
            
            if (planPrice > 0) {
                const commissionRate = await this.getCommissionRate();
                const commissionValue = planPrice * commissionRate;

                const transaction: Omit<PlatformTransaction, 'id' | 'created_at'> = {
                    description: `Comissão - Show de ${booking.artists.name} em ${booking.venues.name}`,
                    type: 'income',
                    category: 'Comissão de Show',
                    value: commissionValue,
                    status: 'paid',
                    due_date: booking.date,
                    booking_id: booking.id,
                };

                const { error: transactionError } = await supabase
                    .from('platform_finances')
                    .insert([transaction]);
                
                if (transactionError) {
                    console.error("Failed to create commission transaction record:", transactionError.message);
                }
            }
        } else if (status === 'pending') {
            const { error: deleteError } = await supabase
                .from('platform_finances')
                .delete()
                .eq('booking_id', bookingId)
                .eq('category', 'Comissão de Show');
                
            if (deleteError) {
                console.error("Failed to delete commission record on rollback:", deleteError.message);
            }
        }

        return true;
    }

    static async getPlatformFinances(): Promise<PlatformTransaction[]> {
        if (!isSupabaseConfigured) return [];
        
        const { data, error } = await supabase
            .from('platform_finances')
            .select('*')
            .order('due_date', { ascending: false });

        if (error) {
            console.error("Error fetching platform finances:", error.message);
            return [];
        }
        return data || [];
    }

    static async addPlatformTransaction(transaction: Omit<PlatformTransaction, 'id' | 'created_at'>): Promise<PlatformTransaction | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('platform_finances')
            .insert([transaction])
            .select()
            .single();
        if (error) {
            console.error("Error adding platform transaction:", error.message);
            return null;
        }
        return data;
    }

    static async updatePlatformTransaction(id: number, updates: Partial<Omit<PlatformTransaction, 'id' | 'created_at'>>): Promise<PlatformTransaction | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('platform_finances')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error("Error updating platform transaction:", error.message);
            return null;
        }
        return data;
    }

    static async deletePlatformTransaction(id: number): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('platform_finances')
            .delete()
            .eq('id', id);
        if (error) {
            console.error("Error deleting platform transaction:", error.message);
            return false;
        }
        return true;
    }
}