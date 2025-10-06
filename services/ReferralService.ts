import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { Referral } from '../types';

export interface ReferralStats {
    totalReferrals: number;
    proConversions: number;
    referrals: Referral[];
}

export class ReferralService {
    static async getReferralStats(artistId: string): Promise<ReferralStats> {
        const defaultStats: ReferralStats = {
            totalReferrals: 0,
            proConversions: 0,
            referrals: [],
        };
        
        if (!isSupabaseConfigured) {
            // Mock data for demo mode
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                totalReferrals: 2,
                proConversions: 1,
                referrals: [
                    { name: 'Artista Indicado 1 (PRO)', status: 'Virou PRO', date: new Date(Date.now() - 86400000).toLocaleDateString('pt-BR') },
                    { name: 'Artista Indicado 2', status: 'Cadastrado', date: new Date().toLocaleDateString('pt-BR') },
                ]
            };
        }

        const { data, error } = await supabase
            .from('artists')
            .select('name, created_at, is_pro, pro_subscription_ends_at')
            .eq('referred_by', artistId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching referral stats:', error.message);
            return defaultStats;
        }

        const referrals: Referral[] = data.map(row => {
            const endDate = row.pro_subscription_ends_at ? new Date(row.pro_subscription_ends_at) : null;
            const isCurrentlyPro = (endDate && endDate > new Date()) || row.is_pro;

            return {
                name: row.name,
                date: new Date(row.created_at).toLocaleDateString('pt-BR'),
                status: isCurrentlyPro ? 'Virou PRO' : 'Cadastrado',
            };
        });
        
        const proConversions = referrals.filter(r => r.status === 'Virou PRO').length;

        return {
            totalReferrals: referrals.length,
            proConversions: proConversions,
            referrals: referrals,
        };
    }

    // In a real application, this would be a Supabase Edge Function triggered by a webhook
    // from the payment provider (e.g., Stripe) after a successful subscription.
    static async grantReferralReward(newProArtistId: string) {
        if (!isSupabaseConfigured) {
            console.log(`[SIMULATION] Granting referral reward for new PRO artist: ${newProArtistId}`);
            return;
        }

        // 1. Find the new PRO artist and see who referred them
        const { data: newProArtist, error: findError } = await supabase
            .from('artists')
            .select('referred_by')
            .eq('id', newProArtistId)
            .single();

        if (findError || !newProArtist || !newProArtist.referred_by) {
            console.log('New PRO artist was not referred or not found. No reward to grant.');
            return;
        }

        const referrerId = newProArtist.referred_by;

        // 2. Find the referring artist
        const { data: referrer, error: referrerError } = await supabase
            .from('artists')
            .select('pro_subscription_ends_at')
            .eq('id', referrerId)
            .single();

        if (referrerError || !referrer) {
            console.error(`Could not find referring artist with ID: ${referrerId}`);
            return;
        }

        // 3. Calculate the new subscription end date
        const now = new Date();
        const currentEndDate = referrer.pro_subscription_ends_at ? new Date(referrer.pro_subscription_ends_at) : now;
        
        // If subscription is already expired, start from today. Otherwise, extend it.
        const startDate = currentEndDate > now ? currentEndDate : now;
        
        const newEndDate = new Date(startDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);

        // 4. Update the referring artist's profile
        const { error: updateError } = await supabase
            .from('artists')
            .update({ 
                pro_subscription_ends_at: newEndDate.toISOString(),
                is_pro: true // Ensure they are marked as PRO
            })
            .eq('id', referrerId);
        
        if (updateError) {
            console.error(`Failed to grant referral reward to artist ${referrerId}:`, updateError.message);
        } else {
            console.log(`Successfully granted 1 month of PRO to artist ${referrerId}. New end date: ${newEndDate.toISOString()}`);
        }
    }
}
