import { isSupabaseConfigured, supabase } from '../supabaseClient';

export class StorageService {
    static BUCKET_NAME = 'media';

    static async uploadFile(file: File, path: string): Promise<string | null> {
        if (!isSupabaseConfigured) return null;

        const { error } = await supabase.storage
            .from(this.BUCKET_NAME)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true, // Overwrites file if it exists, useful for profile pics
            });
        
        if (error) {
            console.error('Error uploading file:', error.message);
            return null;
        }

        const { data } = supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(path);
        
        // Add a timestamp to bust cache if the file was overwritten
        return `${data.publicUrl}?t=${new Date().getTime()}`;
    }

    static async deleteFile(publicUrl: string): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        try {
            // Remove any cache-busting query params
            const cleanUrl = publicUrl.split('?')[0];
            const urlParts = cleanUrl.split('/');
            const bucketNameIndex = urlParts.indexOf(this.BUCKET_NAME);
            if (bucketNameIndex === -1 || bucketNameIndex + 1 >= urlParts.length) {
                throw new Error('Invalid public URL format for deletion.');
            }
            
            const filePath = urlParts.slice(bucketNameIndex + 1).join('/');

            const { error } = await supabase.storage
                .from(this.BUCKET_NAME)
                .remove([filePath]);

            if (error) {
                console.error('Error deleting file:', error.message);
                return false;
            }
            return true;
        } catch (e: any) {
            console.error("Could not parse file path from URL:", e.message);
            return false;
        }
    }
}
