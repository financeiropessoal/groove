import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { Rating } from '../types';
import { ArtistService } from './ArtistService';
import { VenueService } from './VenueService';
import { EnrichedGig } from './GigService';

export class RatingService {

    static async createRating(ratingData: Omit<Rating, 'id'>): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        
        const { error } = await supabase.from('ratings').insert([ratingData]);

        if (error) {
            console.error("Error creating rating:", error.message);
            return false;
        }
        return true;
    }
    
    static async getRatingsForUser(userId: string, userType: 'artist' | 'venue'): Promise<Rating[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('ratings')
            .select('*')
            .eq('ratee_id', userId)
            .eq('ratee_type', userType);
        
        if (error) {
            console.error(`Error fetching ratings for ${userType} ${userId}:`, error.message);
            return [];
        }
        return data || [];
    }
    
    static async getGigsToRate(userId: string, userType: 'artist' | 'venue'): Promise<EnrichedGig[]> {
        if (!isSupabaseConfigured) return [];
        
        const today = new Date().toISOString().split('T')[0];
        const raterColumn = userType === 'artist' ? 'booked_by_artist_id' : 'venue_id';
        
        // 1. Fetch all past, booked gigs for this user
        const { data: gigs, error: gigsError } = await supabase
            .from('gig_offers')
            .select('*, artists(*), venues(*)')
            .eq('status', 'booked')
            .eq(raterColumn, userId)
            .lt('date', today);

        if (gigsError || !gigs) {
            console.error("Error fetching past gigs:", gigsError?.message);
            return [];
        }

        // 2. Fetch all ratings given by this user
        const { data: ratings, error: ratingsError } = await supabase
            .from('ratings')
            .select('gig_id')
            .eq('rater_id', userId)
            .eq('rater_type', userType);
        
        if (ratingsError) {
            console.error("Error fetching user's ratings:", ratingsError?.message);
            return [];
        }

        const ratedGigIds = new Set((ratings || []).map(r => r.gig_id));
        
        // 3. Filter out gigs that have already been rated
        const gigsToRate = gigs.filter(gig => !ratedGigIds.has(gig.id));

        return gigsToRate.map(gig => ({
            id: gig.id,
            venueId: gig.venue_id,
            date: gig.date,
            startTime: gig.start_time,
            endTime: gig.end_time,
            payment: gig.payment,
            notes: gig.notes,
            genre: gig.genre,
            status: gig.status,
            bookedByArtistId: gig.booked_by_artist_id,
            artist: gig.artists ? ArtistService.mapArtistFromDb(gig.artists) : undefined,
            venue: gig.venues ? VenueService.mapVenueFromDb(gig.venues) : undefined,
        }));
    }
}