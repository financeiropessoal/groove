import { Artist } from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

export class ArtistService {

    // Maps a Supabase artist object (snake_case) to our frontend Artist model (camelCase)
    static mapArtistFromDb(dbArtist: any): Artist {
        return {
            id: dbArtist.id,
            name: dbArtist.name,
            email: dbArtist.email,
            phone: dbArtist.phone_number,
            genre: dbArtist.genre || { primary: '', secondary: [] },
            imageUrl: dbArtist.image_url,
            youtubeVideoId: dbArtist.youtube_video_id,
            bio: dbArtist.bio,
            socials: dbArtist.socials || {},
            bookedDates: dbArtist.booked_dates || [],
            gallery: dbArtist.gallery || [],
            plans: dbArtist.plans || [],
            repertoire: dbArtist.repertoire || [],
            testimonials: dbArtist.testimonials || [],
            technicalRequirements: dbArtist.technical_requirements || { space: '', power: '', providedByArtist: [], providedByContractor: [] },
            hospitalityRider: dbArtist.hospitality_rider || [],
            status: dbArtist.status || 'pending',
        };
    }

    // Maps our frontend Artist model to a Supabase-compatible object
    static mapArtistToDb(artist: Partial<Artist>): any {
        return {
            name: artist.name,
            email: artist.email,
            phone_number: artist.phone,
            genre: artist.genre,
            image_url: artist.imageUrl,
            youtube_video_id: artist.youtubeVideoId,
            bio: artist.bio,
            socials: artist.socials,
            booked_dates: artist.bookedDates,
            gallery: artist.gallery,
            plans: artist.plans,
            repertoire: artist.repertoire,
            testimonials: artist.testimonials,
            technical_requirements: artist.technicalRequirements,
            hospitality_rider: artist.hospitalityRider,
            status: artist.status,
        };
    }

    static async getAllArtists(): Promise<Artist[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('artists')
            .select('*')
            .eq('status', 'approved'); // Only show approved artists publicly

        if (error) {
            console.error("Error fetching artists:", error.message);
            return [];
        }

        return (data || []).map(this.mapArtistFromDb);
    }
    
    static async getFeaturedArtists(limit: number = 6): Promise<Artist[]> {
        if (!isSupabaseConfigured) return [];

        // FIX: Removed logic for fetching top-rated artists as the 'average_rating' column does not exist.
        // The logic now directly fetches the most recent approved artists.
        const { data: recentArtists, error: recentError } = await supabase
            .from('artists')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (recentError) {
            console.error("Error fetching recent artists:", recentError.message);
            return [];
        }
        
        return (recentArtists || []).map(this.mapArtistFromDb);
    }
    
     static async getAllArtistsForAdmin(): Promise<Artist[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('artists')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching all artists for admin:", error.message);
            return [];
        }

        return (data || []).map(this.mapArtistFromDb);
    }


    static async getArtistById(id: string): Promise<Artist | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('artists')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching artist with id ${id}:`, error.message);
            return null;
        }

        return this.mapArtistFromDb(data);
    }
}