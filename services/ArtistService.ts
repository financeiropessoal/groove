import { Artist } from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { SpecialPriceService } from './SpecialPriceService';

export class ArtistService {

    // Maps a Supabase artist object (snake_case) to our frontend Artist model (camelCase)
    static mapArtistFromDb(dbArtist: any): Artist {
        return {
            id: dbArtist.id,
            name: dbArtist.name,
            email: dbArtist.email,
            phone: dbArtist.phone,
            city: dbArtist.city,
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
            hospitalityRider: dbArtist.hospitality_rider || [],
            bandMembers: dbArtist.band_members || [],
            status: dbArtist.status || 'pending',
            is_pro: dbArtist.is_pro || false,
            pro_subscription_ends_at: dbArtist.pro_subscription_ends_at,
            referred_by: dbArtist.referred_by,
            averageRating: dbArtist.average_rating,
            ratingCount: dbArtist.rating_count,
            is_featured: dbArtist.is_featured || false,
            quality_score: dbArtist.quality_score,
            quality_issues: dbArtist.quality_issues,
            profile_completeness: dbArtist.profile_completeness || { is_complete: false, missing_fields: [] }
        };
    }

    // Maps our frontend Artist model to a Supabase-compatible object
    static mapArtistToDb(artist: Partial<Artist>): any {
        return {
            name: artist.name,
            email: artist.email,
            phone: artist.phone,
            city: artist.city,
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
            hospitality_rider: artist.hospitalityRider,
            band_members: artist.bandMembers,
            status: artist.status,
            is_pro: artist.is_pro,
            pro_subscription_ends_at: artist.pro_subscription_ends_at,
            referred_by: artist.referred_by,
            average_rating: artist.averageRating,
            rating_count: artist.ratingCount,
            is_featured: artist.is_featured,
            quality_score: artist.quality_score,
            quality_issues: artist.quality_issues,
            profile_completeness: artist.profile_completeness,
        };
    }

    static async getAllArtists(): Promise<Artist[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('artists')
            .select('*')
            .eq('status', 'approved');

        if (error) {
            console.error("Error fetching artists:", error.message);
            return [];
        }

        return (data || []).map(this.mapArtistFromDb);
    }
    
    static async getFeaturedArtists(limit: number = 6): Promise<Artist[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('artists')
            .select('*')
            .eq('status', 'approved')
            .eq('is_featured', true)
            .limit(limit);
        
        if (error) {
            console.error("Error fetching featured artists:", error.message);
            return [];
        }
        
        return (data || []).map(this.mapArtistFromDb);
    }

    static async getGenresWithImages(): Promise<{ genre: string, imageUrl: string }[]> {
        if (!isSupabaseConfigured) return [];

        const artists = await this.getAllArtists();
        const genreMap = new Map<string, string>();

        artists.forEach(artist => {
            if (artist.genre.primary && !genreMap.has(artist.genre.primary)) {
                genreMap.set(artist.genre.primary, artist.imageUrl);
            }
        });

        return Array.from(genreMap, ([genre, imageUrl]) => ({ genre, imageUrl }));
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


    static async getArtistById(id: string, viewerId?: string): Promise<Artist | null> {
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

        const artist = this.mapArtistFromDb(data);

        if (viewerId && artist.plans) {
            const specialPrices = await SpecialPriceService.getSpecialPrices(id, viewerId);
            if (specialPrices.length > 0) {
                artist.plans = artist.plans.map(plan => {
                    const special = specialPrices.find(sp => sp.plan_id === plan.id);
                    return special ? { ...plan, price: special.special_price } : plan;
                });
            }
        }

        return artist;
    }
}