
import { DirectGigOffer, Venue, Artist } from '../types';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { VenueService } from './VenueService';
import { ArtistService } from './ArtistService';

export interface EnrichedDirectOffer extends DirectGigOffer {
    venue: Venue;
    artist?: Artist;
}

export class DirectOfferService {
    
    static mapOfferFromDb(dbOffer: any): DirectGigOffer {
        return {
            id: dbOffer.id,
            venueId: dbOffer.venue_id,
            artistId: dbOffer.artist_id,
            date: dbOffer.date,
            startTime: dbOffer.start_time,
            endTime: dbOffer.end_time,
            payment: dbOffer.payment,
            message: dbOffer.message,
            status: dbOffer.status,
        };
    }
    
    static mapOfferToDb(offer: Omit<DirectGigOffer, 'id' | 'status'>): any {
        return {
            venue_id: offer.venueId,
            artist_id: offer.artistId,
            date: offer.date,
            start_time: offer.startTime,
            end_time: offer.endTime,
            payment: offer.payment,
            message: offer.message,
            status: 'pending', // Always starts as pending
        };
    }
    
    static async createOffer(offerData: Omit<DirectGigOffer, 'id' | 'status'>): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { error } = await supabase
            .from('direct_offers')
            .insert([this.mapOfferToDb(offerData)]);
        
        if (error) {
            console.error("Error creating direct offer:", error.message);
            return false;
        }
        return true;
    }

    static async getPendingOffersForArtist(artistId: string): Promise<EnrichedDirectOffer[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('direct_offers')
            .select('*, venues (*)') // Join with venues
            .eq('artist_id', artistId)
            .eq('status', 'pending');

        if (error || !data) {
            console.error("Error fetching pending offers:", error?.message);
            return [];
        }

        return data
            .map((dbOffer: any) => ({
                ...this.mapOfferFromDb(dbOffer),
                venue: dbOffer.venues ? VenueService.mapVenueFromDb(dbOffer.venues) : undefined,
            }))
            .filter(offer => !!offer.venue) as EnrichedDirectOffer[];
    }
    
    static async getAllOffersForArtist(artistId: string): Promise<EnrichedDirectOffer[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('direct_offers')
            .select('*, venues (*)')
            .eq('artist_id', artistId)
            .order('date', { ascending: false });
        if (error || !data) {
            console.error("Error fetching all offers for artist:", error?.message);
            return [];
        }
         return data
            .map((dbOffer: any) => ({
                ...this.mapOfferFromDb(dbOffer),
                venue: dbOffer.venues ? VenueService.mapVenueFromDb(dbOffer.venues) : undefined,
            }))
            .filter(offer => !!offer.venue) as EnrichedDirectOffer[];
    }

    static async getAllOffersForVenue(venueId: string): Promise<EnrichedDirectOffer[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('direct_offers')
            .select('*, artists (*)')
            .eq('venue_id', venueId)
            .order('date', { ascending: false });
        if (error || !data) {
            console.error("Error fetching all offers for venue:", error?.message);
            return [];
        }
         return data
            .map((dbOffer: any) => ({
                ...this.mapOfferFromDb(dbOffer),
                venue: { id: venueId, name: '', address: '', imageUrl: '' } as Venue, // We don't need full venue details here
                artist: dbOffer.artists ? ArtistService.mapArtistFromDb(dbOffer.artists) : undefined,
            }))
            .filter(offer => !!offer.artist) as EnrichedDirectOffer[];
    }
    
    static async updateOfferStatus(offerId: number, status: 'accepted' | 'declined' | 'pending' | 'countered'): Promise<boolean> {
         if (!isSupabaseConfigured) return false;

        const { error } = await supabase
            .from('direct_offers')
            .update({ status })
            .eq('id', offerId);

        if (error) {
            console.error(`Error updating offer status to ${status}:`, error.message);
            return false;
        }
        return true;
    }

    static async updateOfferTerms(offerId: number, newTerms: Partial<DirectGigOffer>): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { error } = await supabase
            .from('direct_offers')
            .update({
                date: newTerms.date,
                start_time: newTerms.startTime,
                end_time: newTerms.endTime,
                payment: newTerms.payment,
                status: 'countered' // Always set to countered on update
            })
            .eq('id', offerId);
        
        if (error) {
            console.error(`Error updating offer terms:`, error.message);
            return false;
        }
        return true;
    }

    // This is a complex transaction that should ideally be an RPC function in Supabase
    // to ensure atomicity.
    static async acceptOffer(offer: EnrichedDirectOffer): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        // 1. Update offer status
        const statusUpdated = await this.updateOfferStatus(offer.id, 'accepted');
        if (!statusUpdated) return false;

        // 2. Add to artist's booked dates
        const artist = await ArtistService.getArtistById(offer.artistId);
        if (!artist) return false;

        const updatedBookedDates = [...(artist.bookedDates || []), offer.date];
        
        const { error: artistUpdateError } = await supabase
            .from('artists')
            .update({ booked_dates: updatedBookedDates })
            .eq('id', artist.id);

        if (artistUpdateError) {
            console.error("Error updating artist's booked dates:", artistUpdateError.message);
            // Rollback attempt (best effort without transactions)
            await this.updateOfferStatus(offer.id, 'pending');
            return false;
        }

        // 3. Create a corresponding 'booking' record for financial tracking.
        const confirmation_pin = Math.floor(1000 + Math.random() * 9000).toString();
        const { error: bookingInsertError } = await supabase
            .from('bookings')
            .insert([{
                artist_id: offer.artistId,
                venue_id: offer.venueId,
                plan_id: null, // Indicates a direct offer
                date: offer.date,
                start_time: offer.startTime,
                end_time: offer.endTime,
                payment: offer.payment,
                status: 'pending', // Payment is pending until venue pays
                payout_status: 'pending',
                confirmation_pin: confirmation_pin,
                artist_checked_in: false,
            }]);
        
         if (bookingInsertError) {
            console.error("Error creating booking from direct offer:", bookingInsertError.message);
            // Rollback attempts
            await this.updateOfferStatus(offer.id, 'pending');
            // Remove the date we just added
            const rolledBackDates = artist.bookedDates || [];
            await supabase.from('artists').update({ booked_dates: rolledBackDates }).eq('id', artist.id);
            return false;
        }

        return true;
    }
}
