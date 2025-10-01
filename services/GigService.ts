import { GigOffer, Venue, Artist } from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { VenueService } from './VenueService';
import { ArtistService } from './ArtistService';

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
     * Books a gig for an artist.
     */
    static async bookGig(gigId: number, artistId: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { error } = await supabase
            .from('gig_offers')
            .update({ status: 'booked', booked_by_artist_id: artistId })
            .eq('id', gigId)
            .eq('status', 'open'); // Ensure we only book an open gig

        if (error) {
            console.error("Error booking gig:", error.message);
            return false;
        }

        // TODO: In a real app, you'd also create a corresponding 'booking' record
        // and add the date to the artist's 'bookedDates'. This requires an RPC function
        // for transactional safety.
        
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
