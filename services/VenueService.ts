import { Venue } from '../data';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

export class VenueService {
    
    static mapVenueFromDb(dbVenue: any): Venue {
        return {
            id: dbVenue.id,
            name: dbVenue.name,
            address: dbVenue.address,
            imageUrl: dbVenue.image_url,
            email: dbVenue.email,
            status: dbVenue.status,
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
        };
    }
    
    static mapVenueToDb(venue: Partial<Venue>): any {
        return {
            name: venue.name,
            address: venue.address,
            image_url: venue.imageUrl,
            email: venue.email,
            status: venue.status,
            description: venue.description,
            music_styles: venue.musicStyles,
            capacity: venue.capacity,
            contact: venue.contact,
            website: venue.website,
            socials: venue.socials,
            proposal_info: venue.proposalInfo,
            photos: venue.photos,
            equipment: venue.equipment,
        };
    }

    static async getAllVenues(): Promise<Venue[]> {
        if (!isSupabaseConfigured) return [];
        
        const { data, error } = await supabase
            .from('venues')
            .select('*')
            .eq('status', 'active');
            
        if (error) {
            console.error("Error fetching venues:", error.message);
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
}