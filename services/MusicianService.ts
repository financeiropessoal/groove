import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { Musician } from '../types';

export class MusicianService {

    static mapFromDb(dbObj: any): Musician {
        return {
            id: dbObj.id,
            name: dbObj.name,
            email: dbObj.email,
            instrument: dbObj.instrument,
            city: dbObj.city,
            bio: dbObj.bio,
            imageUrl: dbObj.image_url,
            youtubeVideoId: dbObj.youtube_video_id,
            phone: dbObj.phone,
            socials: dbObj.socials || {},
            styles: dbObj.styles || [],
            gallery: dbObj.gallery || [],
            repertoire: dbObj.repertoire || [],
            status: dbObj.status || 'pending',
            profile_completeness: dbObj.profile_completeness || { is_complete: false, missing_fields: [] }
        };
    }

    static mapToDb(musician: Partial<Omit<Musician, 'id'>>): any {
        return {
            name: musician.name,
            email: musician.email,
            instrument: musician.instrument,
            city: musician.city,
            bio: musician.bio,
            image_url: musician.imageUrl,
            youtube_video_id: musician.youtubeVideoId,
            phone: musician.phone,
            socials: musician.socials,
            styles: musician.styles,
            gallery: musician.gallery,
            repertoire: musician.repertoire,
            status: musician.status,
            profile_completeness: musician.profile_completeness,
        };
    }

    static async getAllMusicians(): Promise<Musician[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from('musicians')
            .select('*')
            .eq('status', 'approved')
            .eq('profile_completeness->>is_complete', 'true')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching musicians:', error.message);
            return [];
        }
        return (data || []).map(this.mapFromDb);
    }

    static async getMusicianById(id: string): Promise<Musician | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('musicians')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching musician with id ${id}:`, error.message);
            return null;
        }

        return this.mapFromDb(data);
    }

    static async updateMusician(musicianId: string, updates: Partial<Musician>): Promise<Musician | null> {
        if (!isSupabaseConfigured) return null;

        const dbPayload = this.mapToDb(updates);

        const { data, error } = await supabase
            .from('musicians')
            .update(dbPayload)
            .eq('id', musicianId)
            .select()
            .single();
        
        if (error) {
            console.error("Error updating musician profile:", error);
            return null;
        }

        return this.mapFromDb(data);
    }
}