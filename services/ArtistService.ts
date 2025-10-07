
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { Artist } from '../types';
import { SpecialPriceService } from './SpecialPriceService';

export class ArtistService {
    /**
     * Maps a database row (snake_case) to an Artist object (camelCase).
     */
    static mapArtistFromDb(dbArtist: any): Artist {
        return {
            id: dbArtist.id,
            name: dbArtist.name,
            email: dbArtist.email,
            city: dbArtist.city,
            genre: dbArtist.genre,
            imageUrl: dbArtist.image_url,
            youtubeVideoId: dbArtist.youtube_video_id,
            bio: dbArtist.bio,
            socials: dbArtist.socials,
            bookedDates: dbArtist.booked_dates,
            gallery: dbArtist.gallery,
            plans: dbArtist.plans,
            repertoire: dbArtist.repertoire,
            testimonials: dbArtist.testimonials,
            hospitalityRider: dbArtist.hospitality_rider,
            technicalRequirements: dbArtist.technical_requirements,
            bandMembers: dbArtist.band_members,
            status: dbArtist.status,
            is_pro: dbArtist.is_pro,
            profile_completeness: dbArtist.profile_completeness,
            is_freelancer: dbArtist.is_freelancer,
            freelancer_instruments: dbArtist.freelancer_instruments,
            freelancer_rate: dbArtist.freelancer_rate,
            freelancer_rate_unit: dbArtist.freelancer_rate_unit,
            is_featured: dbArtist.is_featured,
            quality_score: dbArtist.quality_score,
            quality_issues: dbArtist.quality_issues,
            pro_subscription_ends_at: dbArtist.pro_subscription_ends_at,
            referred_by: dbArtist.referred_by,
        };
    }

    /**
     * Maps an Artist object (camelCase) to a database row (snake_case) for updates/inserts.
     */
    static mapArtistToDb(artist: Partial<Artist>): any {
        return {
            name: artist.name,
            email: artist.email,
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
            technical_requirements: artist.technicalRequirements,
            band_members: artist.bandMembers,
            status: artist.status,
            is_pro: artist.is_pro,
            profile_completeness: artist.profile_completeness,
            is_freelancer: artist.is_freelancer,
            freelancer_instruments: artist.freelancer_instruments,
            freelancer_rate: artist.freelancer_rate,
            freelancer_rate_unit: artist.freelancer_rate_unit,
            is_featured: artist.is_featured,
            quality_score: artist.quality_score,
            quality_issues: artist.quality_issues,
            pro_subscription_ends_at: artist.pro_subscription_ends_at,
            referred_by: artist.referred_by,
        };
    }

    static async getAllArtists(): Promise<Artist[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('artists')
            .select('*')
            .eq('status', 'approved')
            .eq('profile_completeness->>is_complete', 'true')
            .order('is_featured', { ascending: false })
            .order('name', { ascending: true });
        
        if (error) {
            console.error("Error fetching artists:", error.message);
            return [];
        }
        return (data || []).map(this.mapArtistFromDb);
    }

    static async getAllArtistsForAdmin(): Promise<Artist[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase.from('artists').select('*').order('name');
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

        let artist = this.mapArtistFromDb(data);

        // If a viewer (venue) is specified, check for special prices
        if (viewerId && artist.plans) {
            const specialPrices = await SpecialPriceService.getSpecialPrices(artist.id, viewerId);
            if (specialPrices.length > 0) {
                const updatedPlans = artist.plans.map(plan => {
                    const specialPrice = specialPrices.find(sp => sp.plan_id === plan.id);
                    // For now, let's assume the price applies to both individual and company.
                    // A more complex model might distinguish this.
                    if (specialPrice) {
                        return { ...plan, priceCompany: specialPrice.special_price, priceIndividual: specialPrice.special_price };
                    }
                    return plan;
                });
                artist = { ...artist, plans: updatedPlans };
            }
        }
        
        return artist;
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
        // This should be an RPC call for efficiency, but we can simulate it client-side
        const { data, error } = await supabase
            .from('artists')
            .select('genre, image_url')
            .eq('status', 'approved');

        if (error) {
            console.error("Error fetching genres:", error);
            return [];
        }

        const genreMap = new Map<string, string>();
        (data || []).forEach(artist => {
            if (artist.genre?.primary && !genreMap.has(artist.genre.primary)) {
                genreMap.set(artist.genre.primary, artist.image_url);
            }
        });

        return Array.from(genreMap, ([genre, imageUrl]) => ({ genre, imageUrl })).slice(0, 10);
    }
}
