import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { ArtistService } from './ArtistService';
import { VenueService } from './VenueService';
import { Artist, Venue } from '../data';

export class FavoriteService {

    static async isFavorite(userAuthId: string, favoritedProfileId: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userAuthId)
            .eq('favorited_profile_id', favoritedProfileId)
            .maybeSingle();

        if (error) {
            console.error('Error checking favorite status:', error);
            return false;
        }
        return !!data;
    }

    static async addFavorite(userAuthId: string, favoritedProfileId: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { error } = await supabase
            .from('favorites')
            .insert({ user_id: userAuthId, favorited_profile_id: favoritedProfileId });
        
        if (error) {
            console.error('Error adding favorite:', error);
            return false;
        }
        return true;
    }

    static async removeFavorite(userAuthId: string, favoritedProfileId: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userAuthId)
            .eq('favorited_profile_id', favoritedProfileId);

        if (error) {
            console.error('Error removing favorite:', error);
            return false;
        }
        return true;
    }

    static async getEnrichedFavoritesForVenue(venueAuthId: string): Promise<Artist[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('favorites')
            .select('favorited_profile_id')
            .eq('user_id', venueAuthId);

        if (error || !data) {
            console.error('Error fetching favorite artist IDs:', error?.message);
            return [];
        }

        const artistIds = data.map(f => f.favorited_profile_id);
        if (artistIds.length === 0) return [];

        const { data: artists, error: artistsError } = await supabase
            .from('artists')
            .select('*')
            .in('id', artistIds);

        if (artistsError || !artists) {
            console.error('Error fetching favorite artist profiles:', artistsError?.message);
            return [];
        }

        return artists.map(ArtistService.mapArtistFromDb);
    }

    static async getEnrichedFavoritesForArtist(artistAuthId: string): Promise<Venue[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('favorites')
            .select('favorited_profile_id')
            .eq('user_id', artistAuthId);

        if (error || !data) {
            console.error('Error fetching favorite venue IDs:', error?.message);
            return [];
        }

        const venueIds = data.map(f => f.favorited_profile_id);
        if (venueIds.length === 0) return [];

        const { data: venues, error: venuesError } = await supabase
            .from('venues')
            .select('*')
            .in('id', venueIds);

        if (venuesError || !venues) {
            console.error('Error fetching favorite venue profiles:', venuesError?.message);
            return [];
        }

        return venues.map(VenueService.mapVenueFromDb);
    }
}
