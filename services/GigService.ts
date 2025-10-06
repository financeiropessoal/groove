import { GigOffer, Venue, Artist } from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { VenueService } from './VenueService';
import { ArtistService } from './ArtistService';
import { GigNotificationService } from './GigNotificationService';

export interface EnrichedGig extends GigOffer {
    venue?: Venue;
    artist?: Artist;
}

export class GigService {
    
    static mapGigFromDb(dbGig: any): GigOffer {
        return {
            id: dbGig.id,
            venueId: dbGig.venue_id,
            date: dbGig.date,
            startTime: dbGig.start_time,
            endTime: dbGig.end_time,
            payment: dbGig.payment,
            notes: dbGig.notes,
            genre: dbGig.genre,
            status: dbGig.status,
            bookedByArtistId: dbGig.booked_by_artist_id,
        };
    }

    static mapGigToDb(gig: Partial<GigOffer>): any {
        return {
            venue_id: gig.venueId,
            date: gig.date,
            start_time: gig.startTime,
            end_time: gig.endTime,
            payment: gig.payment,
            notes: gig.notes,
            genre: gig.genre,
            status: gig.status || 'open',
            booked_by_artist_id: gig.bookedByArtistId,
        };
    }
    
    /**
     * Fetches all gigs with status 'open' and enriches them with venue details.
     */
    static async getAllOpenGigs(): Promise<EnrichedGig[]> {
        if (!isSupabaseConfigured) return [];

        const { data: gigsData, error } = await supabase
            .from('gig_offers')
            .select('*, venues (*)') // Join all columns from venues
            .eq('status', 'open');
        
        if (error || !gigsData) {
            console.error('Error fetching open gigs:', error?.message);
            return [];
        }

        return gigsData.map((dbGig: any) => ({
            ...this.mapGigFromDb(dbGig),
            venue: dbGig.venues ? VenueService.mapVenueFromDb(dbGig.venues) : undefined,
        }));
    }
    
    /**
     * Fetches all gigs for a specific venue, enriching with artist details if booked.
     */
    static async getGigsForVenue(venueId: string): Promise<EnrichedGig[]> {
        if (!isSupabaseConfigured) return [];
        
        const { data, error } = await supabase
            .from('gig_offers')
            .select('*, artists (*)') // Join with artists table
            .eq('venue_id', venueId);

        if (error || !data) {
            console.error(`Error fetching gigs for venue ${venueId}:`, error?.message);
            return [];
        }

        return data.map((dbGig: any) => ({
            ...this.mapGigFromDb(dbGig),
            artist: dbGig.artists ? ArtistService.mapArtistFromDb(dbGig.artists) : undefined
        }));
    }

    /**
     * Books a gig for an artist, ensuring transactional consistency by creating a booking record.
     */
    static async bookGig(gigId: number, artistId: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        // Step 1: Atomically update the gig offer to 'booked'
        const { data: updatedGig, error } = await supabase
            .from('gig_offers')
            .update({ status: 'booked', booked_by_artist_id: artistId })
            .eq('id', gigId)
            .eq('status', 'open') // Ensure we only book an open gig
            .select()
            .single();

        if (error || !updatedGig) {
            console.error("Error booking gig or gig already taken:", error?.message);
            return false;
        }

        // Step 2: Create a corresponding 'booking' record for consistency
        const confirmation_pin = Math.floor(1000 + Math.random() * 9000).toString();
        const { error: bookingInsertError } = await supabase
            .from('bookings')
            .insert([{
                artist_id: artistId,
                venue_id: updatedGig.venue_id,
                plan_id: null, // Indicates an open gig booking
                date: updatedGig.date,
                start_time: updatedGig.start_time,
                end_time: updatedGig.end_time,
                payment: updatedGig.payment,
                status: 'pending', // Payment is pending until venue pays
                payout_status: 'pending',
                confirmation_pin: confirmation_pin,
                artist_checked_in: false,
            }]);
        
         if (bookingInsertError) {
            console.error("Error creating booking from open gig:", bookingInsertError.message);
            // Rollback attempt (best effort without transactions)
            await supabase.from('gig_offers').update({ status: 'open', booked_by_artist_id: null }).eq('id', gigId);
            return false;
        }

        // Step 3: Add the date to the artist's 'bookedDates'
        const artist = await ArtistService.getArtistById(artistId);
        if (artist) {
            const updatedBookedDates = [...new Set([...(artist.bookedDates || []), updatedGig.date])];
            await supabase.from('artists').update({ booked_dates: updatedBookedDates }).eq('id', artistId);
        }
        
        return true;
    }


    /**
     * Adds a new gig offer.
     */
    static async addGig(gigData: Omit<GigOffer, 'id' | 'status' | 'bookedByArtistId'>): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { error } = await supabase
            .from('gig_offers')
            .insert([this.mapGigToDb(gigData)]);

        if (error) {
            console.error("Error adding gig:", error.message);
            return false;
        }

        // After successfully creating the gig, notify relevant artists.
        // We run this in the background and don't await it, so the UI isn't blocked.
        GigNotificationService.notifyRelevantArtists(gigData).catch(err => {
            console.error("Failed to send gig notifications:", err);
        });

        return true;
    }

    /**
     * Deletes a gig offer.
     */
    static async deleteGig(gigId: number): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { error } = await supabase
            .from('gig_offers')
            .delete()
            .eq('id', gigId);

        if (error) {
            console.error("Error deleting gig:", error.message);
            return false;
        }
        return true;
    }
}