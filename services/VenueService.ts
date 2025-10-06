import { Venue } from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

export class VenueService {
    
    static mapVenueFromDb(dbVenue: any): Venue {
        return {
            id: dbVenue.id,
            name: dbVenue.name,
            address: dbVenue.address,
            city: dbVenue.city,
            imageUrl: dbVenue.image_url,
            email: dbVenue.email,
            status: dbVenue.status,
            contractor_type: dbVenue.contractor_type,
            description: dbVenue.description,
            musicStyles: dbVenue.music_styles,
            capacity: dbVenue.capacity,
            contact: dbVenue.contact,
            website: dbVenue.website,
            socials: dbVenue.socials,
            proposalInfo: dbVenue.proposal_info,
            photos: dbVenue.photos,
            equipment: dbVenue.equipment,
            averageRating: dbVenue.average_rating,
            ratingCount: dbVenue.rating_count,
            profile_completeness: dbVenue.profile_completeness || { is_complete: false, missing_fields: [] },
        };
    }
    
    static mapVenueToDb(venue: Partial<Venue>): any {
        return {
            name: venue.name,
            address: venue.address,
            city: venue.city,
            image_url: venue.imageUrl,
            email: venue.email,
            status: venue.status,
            contractor_type: venue.contractor_type,
            description: venue.description,
            music_styles: venue.musicStyles,
            capacity: venue.capacity,
            contact: venue.contact,
            website: venue.website,
            socials: venue.socials,
            proposal_info: venue.proposalInfo,
            photos: venue.photos,
            equipment: venue.equipment,
            average_rating: venue.averageRating,
            rating_count: venue.ratingCount,
            profile_completeness: venue.profile_completeness,
        };
    }

    static async getAllVenues(): Promise<Venue[]> {
        if (!isSupabaseConfigured) return [];
        
        const { data, error } = await supabase
            .from('venues')
            .select('*')
            .eq('status', 'active')
            .eq('profile_completeness->>is_complete', 'true');
            
        if (error) {
            console.error("Error fetching venues:", error.message);
            return [];
        }
        
        return (data || []).map(this.mapVenueFromDb);
    }
    
    static async getAllVenuesForAdmin(): Promise<Venue[]> {
        if (!isSupabaseConfigured) return [];
         const { data, error } = await supabase
            .from('venues')
            .select('*')
            .order('name', { ascending: true });
        if (error) {
            console.error("Error fetching all venues for admin:", error.message);
            return [];
        }
        return (data || []).map(this.mapVenueFromDb);
    }
    
    static async getVenueById(id: string): Promise<Venue | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('venues')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching venue with id ${id}:`, error.message);
            return null;
        }
        return this.mapVenueFromDb(data);
    }

    static async updateVenue(venueId: string, updates: Partial<Venue>): Promise<Venue | null> {
        if (!isSupabaseConfigured) return null;
    
        const dbPayload = this.mapVenueToDb(updates);
    
        const { data, error } = await supabase
            .from('venues')
            .update(dbPayload)
            .eq('id', venueId)
            .select()
            .single();
        
        if (error) {
            console.error("Error updating venue profile:", error);
            return null;
        }
    
        return this.mapVenueFromDb(data);
    }
}
