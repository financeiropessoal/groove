import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { PlatformBanner } from '../types';
import { StorageService } from './StorageService';

export class BannerService {
    static BUCKET_NAME = 'media';
    static BANNER_ID = 1; // Assuming a single, global banner

    static async getActiveBanner(): Promise<PlatformBanner | null> {
        if (!isSupabaseConfigured) {
            // Mock data for demo
            return {
                id: 1,
                desktop_image_url: 'https://burn-ice.com.br/wp-content/uploads/2024/07/banner-coco.png',
                mobile_image_url: 'https://burn-ice.com.br/wp-content/uploads/2024/07/banner-coco.png',
                link_url: '5511987654321',
                is_active: true,
            };
        }

        const { data, error } = await supabase
            .from('platform_banners')
            .select('*')
            .eq('is_active', true)
            .eq('id', this.BANNER_ID)
            .maybeSingle();

        if (error) {
            console.error('Error fetching active banner:', error.message);
            return null;
        }
        return data;
    }

    static async getBannerSettings(): Promise<PlatformBanner | null> {
        if (!isSupabaseConfigured) return this.getActiveBanner(); // return mock for admin too

        const { data, error } = await supabase
            .from('platform_banners')
            .select('*')
            .eq('id', this.BANNER_ID)
            .maybeSingle();
        
        if (error) {
            console.error('Error fetching banner settings:', error.message);
            return null;
        }
        return data;
    }

    static async updateBanner(
        updates: Partial<Omit<PlatformBanner, 'id'>>,
        desktopFile?: File | null,
        mobileFile?: File | null
    ): Promise<PlatformBanner | null> {
        if (!isSupabaseConfigured) return null;
        
        const currentData = await this.getBannerSettings();
        const updatePayload = { ...updates };

        try {
            if (desktopFile) {
                const path = `banners/desktop_banner_${Date.now()}`;
                const url = await StorageService.uploadFile(desktopFile, path);
                if (url) {
                    updatePayload.desktop_image_url = url;
                } else {
                    throw new Error('Failed to upload desktop banner.');
                }
            }

            if (mobileFile) {
                const path = `banners/mobile_banner_${Date.now()}`;
                const url = await StorageService.uploadFile(mobileFile, path);
                if (url) {
                    updatePayload.mobile_image_url = url;
                } else {
                    throw new Error('Failed to upload mobile banner.');
                }
            }

            const { data, error } = await supabase
                .from('platform_banners')
                .upsert([{ id: this.BANNER_ID, ...currentData, ...updatePayload }], { onConflict: 'id' })
                .select()
                .single();

            if (error) throw error;
            
            return data;

        } catch (error: any) {
            console.error('Error updating banner:', error.message);
            return null;
        }
    }
}