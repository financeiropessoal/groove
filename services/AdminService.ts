import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { ArtistService } from './ArtistService';
import { VenueService } from './VenueService';
import { PlatformTransaction } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { Artist } from '../data';

interface PlatformSettings {
    commission: {
        standard: number;
        pro: number;
    };
    paymentGateway: {
        transactionPercent: number;
        payoutFixed: number;
    };
}

let cachedSettings: PlatformSettings | null = null;

export class AdminService {

    static async getPlatformSettings(): Promise<PlatformSettings> {
        if (cachedSettings) {
            return cachedSettings;
        }
        const defaultSettings = { 
            commission: { standard: 0.10, pro: 0.05 },
            paymentGateway: { transactionPercent: 0.0499, payoutFixed: 3.67 }
        };

        if (!isSupabaseConfigured) return defaultSettings;

        const { data, error } = await supabase
            .from('platform_settings')
            .select('key, value')
            .in('key', ['commission_rate', 'commission_rate_pro', 'mp_transaction_fee_percent', 'mp_payout_fee_fixed']);

        if (error || !data) {
            console.warn("Could not fetch platform settings, using defaults.", error?.message);
            cachedSettings = defaultSettings;
            return defaultSettings;
        }

        const getValue = (key: string, defaultValue: number) => {
            const row = data.find(d => d.key === key);
            const value = parseFloat(row?.value);
            return isNaN(value) ? defaultValue : value;
        };
        
        cachedSettings = {
            commission: {
                standard: getValue('commission_rate', defaultSettings.commission.standard),
                pro: getValue('commission_rate_pro', defaultSettings.commission.pro),
            },
            paymentGateway: {
                transactionPercent: getValue('mp_transaction_fee_percent', defaultSettings.paymentGateway.transactionPercent),
                payoutFixed: getValue('mp_payout_fee_fixed', defaultSettings.paymentGateway.payoutFixed),
            }
        };
        
        return cachedSettings;
    }

    static invalidateSettingsCache() {
        cachedSettings = null;
    }

    static async getDashboardStats() {
        if (!isSupabaseConfigured) {
            return {
                totalArtists: 8,
                pendingArtists: 1,
                totalVenues: 2,
                totalGigs: 15,
                totalBookings: 10,
                grossRevenue: 12500,
                platformCommission: 1250,
            };
        }
        
        const settings = await this.getPlatformSettings();

        const [
            { count: totalArtists },
            { count: pendingArtists },
            { count: totalVenues },
            { count: totalGigs },
            { data: bookingsData, error: bookingsError }
        ] = await Promise.all([
            supabase.from('artists').select('*', { count: 'exact', head: true }),
            supabase.from('artists').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('venues').select('*', { count: 'exact', head: true }),
            supabase.from('gig_offers').select('*', { count: 'exact', head: true }),
            supabase.from('bookings').select('plan_id, payment, artists(is_pro, plans)').eq('status', 'paid')
        ]);
        
        let grossRevenue = 0;
        let platformCommission = 0;

        if (!bookingsError && bookingsData) {
            bookingsData.forEach((b: any) => {
                const plan = b.artists?.plans?.find((p: any) => p.id === b.plan_id);
                const price = plan ? plan.price : (b.payment || 0);
                grossRevenue += price;

                const isPro = b.artists?.is_pro || false;
                const rate = isPro ? settings.commission.pro : settings.commission.standard;
                platformCommission += price * rate;
            });
        }

        return {
            totalArtists: totalArtists || 0,
            pendingArtists: pendingArtists || 0,
            totalVenues: totalVenues || 0,
            totalGigs: totalGigs || 0,
            totalBookings: bookingsData?.length || 0,
            grossRevenue,
            platformCommission,
        };
    }
    
    static async updateArtistStatus(artistId: string, status: 'approved' | 'pending' | 'blocked'): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase.from('artists').update({ status }).eq('id', artistId);
        if (error) {
            console.error("Error updating artist status:", error.message);
            return false;
        }
        return true;
    }

    static async toggleArtistFeature(artistId: string, isFeatured: boolean): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase.from('artists').update({ is_featured: isFeatured }).eq('id', artistId);
        if (error) {
            console.error("Error toggling artist feature status:", error.message);
            return false;
        }
        return true;
    }

    static async updateArtistProfileData(artistId: string, data: Partial<Artist>): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const dbPayload = ArtistService.mapArtistToDb(data);
        const { error } = await supabase.from('artists').update(dbPayload).eq('id', artistId);
        if (error) {
            console.error("Error updating artist profile data:", error.message);
            return false;
        }
        return true;
    }

    static async updateVenueStatus(venueId: string, status: 'active' | 'blocked'): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase.from('venues').update({ status }).eq('id', venueId);
        if (error) {
            console.error("Error updating venue status:", error.message);
            return false;
        }
        return true;
    }
    
    static async updatePlatformSettings(settings: { standardRate: number, proRate: number, transactionFee: number, payoutFee: number }): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        
        const { standardRate, proRate, transactionFee, payoutFee } = settings;

        const upsertData = [
            { key: 'commission_rate', value: (standardRate / 100).toFixed(4) },
            { key: 'commission_rate_pro', value: (proRate / 100).toFixed(4) },
            { key: 'mp_transaction_fee_percent', value: (transactionFee / 100).toFixed(4) },
            { key: 'mp_payout_fee_fixed', value: payoutFee.toFixed(2) }
        ];

        const { error } = await supabase
            .from('platform_settings')
            .upsert(upsertData, { onConflict: 'key' });

        if (error) {
            console.error("Error updating platform settings:", error.message);
            return false;
        }
        
        this.invalidateSettingsCache();
        return true;
    }
    
    static async getEnrichedBookings(): Promise<any[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('bookings')
            .select('*, artists(*), venues(name)')
            .order('date', { ascending: false });

        if (error || !data) {
            console.error("Error fetching all bookings:", error?.message);
            return [];
        }

        return data.map((b: any) => {
            const plan = b.artists?.plans?.find((p: any) => p.id === b.plan_id);
            return {
                id: b.id,
                artistId: b.artist_id,
                artistName: b.artists?.name || 'Artista Removido',
                venueId: b.venue_id,
                venueName: b.venues?.name || 'Local Removido',
                planId: b.plan_id,
                planName: plan?.name || 'Proposta Direta',
                planPrice: plan?.price || 0,
                date: b.date,
                payoutStatus: b.payout_status
            };
        });
    }
    
    static async updatePayoutStatus(bookingId: number, status: 'pending' | 'paid'): Promise<boolean> {
        if (!isSupabaseConfigured) return false;

        // First, delete any existing financial records for this booking to avoid duplicates
        const { error: deleteError } = await supabase
            .from('platform_finances')
            .delete()
            .eq('booking_id', bookingId);
        
        if (deleteError) {
            console.error("Failed to clear old financial records for booking:", deleteError.message);
            return false;
        }
        
        // Update the booking status itself
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ payout_status: status })
            .eq('id', bookingId);

        if (updateError) {
            console.error("Error updating payout status:", updateError.message);
            return false;
        }

        // If paid, create all related financial transactions
        if (status === 'paid') {
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .select('*, artists(*), venues(name)')
                .eq('id', bookingId)
                .single();
            
            if (bookingError || !booking) {
                console.error("Could not fetch booking details to create financial records.", bookingError?.message);
                return true; 
            }

            const plan = booking.artists?.plans?.find((p: any) => p.id === booking.plan_id);
            const planPrice = plan?.price || booking.payment || 0;
            
            if (planPrice > 0) {
                const settings = await this.getPlatformSettings();
                const isProArtist = booking.artists?.is_pro || false;
                
                // 1. Platform Commission (Income)
                const commissionRate = isProArtist ? settings.commission.pro : settings.commission.standard;
                const commissionValue = planPrice * commissionRate;

                // 2. Payment Gateway Transaction Fee (Expense)
                const transactionFeeValue = planPrice * settings.paymentGateway.transactionPercent;
                
                // 3. Payout Fee (Expense)
                const payoutFeeValue = settings.paymentGateway.payoutFixed;

                const transactionsToInsert: Omit<PlatformTransaction, 'id' | 'created_at'>[] = [
                    {
                        description: `Comissão - Show de ${booking.artists.name} em ${booking.venues.name}`,
                        type: 'income',
                        category: 'Comissão de Show',
                        value: commissionValue,
                        status: 'paid',
                        due_date: booking.date,
                        booking_id: booking.id,
                    },
                    {
                        description: `Taxa de Transação - Show #${booking.id}`,
                        type: 'expense',
                        category: 'Taxa de Gateway',
                        value: transactionFeeValue,
                        status: 'paid',
                        due_date: booking.date,
                        booking_id: booking.id,
                    },
                    {
                        description: `Taxa de Repasse - Show #${booking.id}`,
                        type: 'expense',
                        category: 'Taxa de Gateway',
                        value: payoutFeeValue,
                        status: 'paid',
                        due_date: booking.date,
                        booking_id: booking.id,
                    }
                ];

                const { error: transactionError } = await supabase
                    .from('platform_finances')
                    .insert(transactionsToInsert);
                
                if (transactionError) {
                    console.error("Failed to create financial transaction records:", transactionError.message);
                    // Attempt to roll back the payout status
                    await supabase.from('bookings').update({ payout_status: 'pending' }).eq('id', bookingId);
                    return false;
                }
            }
        }

        return true;
    }

    static async getPlatformFinances(): Promise<PlatformTransaction[]> {
        if (!isSupabaseConfigured) return [];
        
        const { data, error } = await supabase
            .from('platform_finances')
            .select('*')
            .order('due_date', { ascending: false });

        if (error) {
            console.error("Error fetching platform finances:", error.message);
            return [];
        }
        return data || [];
    }

    static async addPlatformTransaction(transaction: Omit<PlatformTransaction, 'id' | 'created_at'>): Promise<PlatformTransaction | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('platform_finances')
            .insert([transaction])
            .select()
            .single();
        if (error) {
            console.error("Error adding platform transaction:", error.message);
            return null;
        }
        return data;
    }

    static async updatePlatformTransaction(id: number, updates: Partial<Omit<PlatformTransaction, 'id' | 'created_at'>>): Promise<PlatformTransaction | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('platform_finances')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error("Error updating platform transaction:", error.message);
            return null;
        }
        return data;
    }

    static async deletePlatformTransaction(id: number): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('platform_finances')
            .delete()
            .eq('id', id);
        if (error) {
            console.error("Error deleting platform transaction:", error.message);
            return false;
        }
        return true;
    }

    static async generateProfileQualityScore(artist: Artist): Promise<{ score: number; issues: string[] }> {
        // FIX: Use `process.env.API_KEY` as per Gemini API guidelines and to resolve TypeScript error.
        const apiKey = process.env.API_KEY;
        if (!apiKey) return { score: 0, issues: ['API Key not configured.'] };

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            Analyze this artist profile data. Provide a quality score (0-100) and a list of actionable issues.
            - Bio should be at least 40 words and professional.
            - A YouTube Video ID must be present.
            - The image URL should not be a placeholder (e.g., pexels.com/photo/1043471/).
            
            Profile Data:
            {
              "name": "${artist.name}",
              "bio": "${artist.bio}",
              "imageUrl": "${artist.imageUrl}",
              "youtubeVideoId": "${artist.youtubeVideoId}"
            }

            Return ONLY a JSON object: { "score": number, "issues": string[] }
            Example issues: "A bio é muito curta.", "Falta um vídeo de performance do YouTube."
        `;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            issues: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });
            const result = JSON.parse(response.text);
            return result;
        } catch(e) {
            console.error("Error generating quality score:", e);
            return { score: 0, issues: ["Failed to analyze profile with AI."] };
        }
    }
    
    static async generateRejectionFeedback(artistName: string, issues: string[]): Promise<string> {
        // FIX: Use `process.env.API_KEY` as per Gemini API guidelines and to resolve TypeScript error.
        const apiKey = process.env.API_KEY;
        if (!apiKey) return "API Key not configured.";

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
            You are a helpful community manager for a music platform called Groove Music. 
            Write a polite and constructive rejection message for an artist whose profile was not approved. 
            Be friendly and offer clear guidance on how they can improve.

            Here are the specific issues found with their profile:
            ${issues.map(issue => `- ${issue}`).join('\n')}

            Start the message with 'Olá ${artistName},'. Explain that their profile needs a few adjustments. 
            List the issues as bullet points and explain WHY each is important (e.g., 'Um bom vídeo de performance é a melhor forma de mostrar seu talento aos contratantes.'). 
            End on a positive and encouraging note, inviting them to update their profile.
        `;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (e) {
            console.error("Error generating rejection feedback:", e);
            return "Could not generate AI feedback at this time.";
        }
    }
}
