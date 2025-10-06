import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { ArtistService } from './ArtistService';
import { VenueService } from './VenueService';
import { Artist, Venue, Booking } from '../data';
import { ManualGigService, ManualGig } from './ManualGigService';

interface CreateBookingPayload {
    artistId: string;
    venueId: string;
    planId: number;
    dates: string[];
}

export interface EnrichedBooking {
    id: number | string;
    artistId: string;
    venueId?: string | null;
    planId?: number | null;
    date: string;
    status?: 'pending' | 'paid';
    payoutStatus?: 'pending' | 'paid';
    artist?: Artist | null;
    venue?: Venue | null;
    venueName?: string;
    payment: number;
    startTime?: string;
    endTime?: string;
    isManual?: boolean;
    confirmation_pin?: string;
    artist_checked_in?: boolean;
    check_in_time?: string;
}


export class BookingService {
    static async createBooking(payload: CreateBookingPayload, transactionId?: string): Promise<boolean> {
        if (!isSupabaseConfigured) return new Promise(resolve => setTimeout(() => resolve(true), 1000));
        
        const artist = await ArtistService.getArtistById(payload.artistId, payload.venueId);
        if (!artist) return false;

        const plan = artist.plans?.find(p => p.id === payload.planId);
        if (!plan) return false;
        
        const confirmation_pin = Math.floor(1000 + Math.random() * 9000).toString();

        const bookingsToInsert = payload.dates.map(date => ({
            artist_id: payload.artistId,
            venue_id: payload.venueId,
            plan_id: payload.planId,
            date: date,
            status: 'paid', // Payment status is now 'paid' after simulated payment
            payout_status: 'pending', // Artist payout status is still pending
            confirmation_pin: confirmation_pin,
            artist_checked_in: false,
            payment_gateway_txn_id: transactionId, // Add the transaction ID
        }));

        const { error } = await supabase.from('bookings').insert(bookingsToInsert);

        if (error) {
            console.error('Error creating booking:', error);
            return false;
        }

        const newBookedDates = [...(artist.bookedDates || []), ...payload.dates];
        const { error: artistUpdateError } = await supabase
            .from('artists')
            .update({ booked_dates: newBookedDates })
            .eq('id', payload.artistId);
        
        if(artistUpdateError) {
             console.error('Error updating artist booked dates:', artistUpdateError);
             // In a real app, you'd handle this failure (e.g., rollback)
        }

        return true;
    }

    static async getBookingsForArtist(artistId: string): Promise<EnrichedBooking[]> {
        const platformBookings = await this.getPlatformBookingsForArtist(artistId);
        const manualGigs = await this.getManualGigsForArtist(artistId);

        const allGigs = [...platformBookings, ...manualGigs];
        allGigs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return allGigs;
    }

    static async getBookingsForVenue(venueId: string): Promise<EnrichedBooking[]> {
        if (!isSupabaseConfigured) {
            if (venueId === 'mock-venue-1') {
                 const today = new Date();
                 const pastDate = new Date(today);
                pastDate.setDate(today.getDate() - 15);

                const artist1 = await ArtistService.getArtistById('mock-artist-1');
                const artist2 = await ArtistService.getArtistById('mock-artist-2');

                return Promise.resolve([
                    {
                        id: 101, artistId: 'mock-artist-1', venueId: venueId, planId: 1, 
                        date: today.toISOString().split('T')[0], 
                        status: 'paid', payoutStatus: 'pending',
                        artist: artist1, payment: 800,
                        startTime: '20:00', endTime: '22:00', isManual: false,
                        confirmation_pin: Math.floor(1000 + Math.random() * 9000).toString(), artist_checked_in: false
                    },
                     {
                        id: 103, artistId: 'mock-artist-2', venueId: venueId, planId: null, 
                        date: pastDate.toISOString().split('T')[0], 
                        status: 'paid', payoutStatus: 'paid',
                        artist: artist2, payment: 1500, // from a direct offer maybe
                        startTime: '21:00', endTime: '00:00', isManual: false,
                        confirmation_pin: Math.floor(1000 + Math.random() * 9000).toString(), artist_checked_in: true
                    }
                ]);
            }
            return Promise.resolve([]);
        }

        const { data, error } = await supabase
            .from('bookings')
            .select('*, artists(*)') // a simple join is enough
            .eq('venue_id', venueId)
            .order('date', { ascending: false });

        if (error || !data) {
            console.error('Error fetching bookings for venue:', error?.message);
            return [];
        }

        return data.map((booking: any) => {
            const artist = booking.artists ? ArtistService.mapArtistFromDb(booking.artists) : null;
            const plan = artist?.plans?.find(p => p.id === booking.plan_id);
            // If it's a direct offer, booking.payment might be set. Otherwise, use plan price.
            const payment = booking.payment || plan?.price || 0;

            return {
                id: booking.id,
                artistId: booking.artist_id,
                venueId: booking.venue_id,
                planId: booking.plan_id,
                date: booking.date,
                status: booking.status,
                payoutStatus: booking.payout_status,
                artist: artist,
                payment: payment,
                startTime: booking.start_time,
                endTime: booking.end_time,
                isManual: false,
                confirmation_pin: booking.confirmation_pin,
                artist_checked_in: booking.artist_checked_in,
                check_in_time: booking.check_in_time
            };
        });
    }

    private static async getPlatformBookingsForArtist(artistId: string): Promise<EnrichedBooking[]> {
        if (!isSupabaseConfigured) {
            if (artistId === 'mock-artist-id-12345') {
                const today = new Date();
                const upcomingDate = new Date(today);
                // upcomingDate.setDate(today.getDate() + 10); // Changed to today
                const pastDate = new Date(today);
                pastDate.setDate(today.getDate() - 5);

                return Promise.resolve([
                    {
                        id: 101, artistId, venueId: 'mock-venue-1', planId: 1, 
                        date: upcomingDate.toISOString().split('T')[0], 
                        status: 'paid', payoutStatus: 'pending',
                        venueName: 'Bar da Esquina', payment: 800,
                        startTime: '20:00', endTime: '22:00', isManual: false,
                        confirmation_pin: Math.floor(1000 + Math.random() * 9000).toString(), artist_checked_in: false
                    },
                    {
                        id: 102, artistId, venueId: 'mock-venue-2', planId: 2, 
                        date: pastDate.toISOString().split('T')[0], 
                        status: 'paid', payoutStatus: 'paid',
                        venueName: 'Rock House Pub', payment: 2200,
                        startTime: '21:00', endTime: '00:00', isManual: false,
                        confirmation_pin: Math.floor(1000 + Math.random() * 9000).toString(), artist_checked_in: true, check_in_time: pastDate.toISOString()
                    }
                ]);
            }
            return Promise.resolve([]);
        }

        const { data, error } = await supabase
            .from('bookings')
            .select('*, venues (name)')
            .eq('artist_id', artistId)
            .order('date', { ascending: false });

        if (error || !data) {
            console.error('Error fetching bookings for artist:', error?.message);
            return [];
        }

        const artist = await ArtistService.getArtistById(artistId);

        return data.map((booking: any) => {
            const plan = artist?.plans?.find(p => p.id === booking.plan_id);
            const payment = plan ? plan.price : booking.payment || 0;

            return {
                id: booking.id,
                artistId: booking.artist_id,
                venueId: booking.venue_id,
                planId: booking.plan_id,
                date: booking.date,
                status: booking.status,
                payoutStatus: booking.payout_status,
                venueName: booking.venues?.name || 'Local Desconhecido',
                payment: payment,
                startTime: booking.start_time,
                endTime: booking.end_time,
                isManual: false,
                confirmation_pin: booking.confirmation_pin,
                artist_checked_in: booking.artist_checked_in,
                check_in_time: booking.check_in_time
            };
        });
    }

     private static async getManualGigsForArtist(artistId: string): Promise<EnrichedBooking[]> {
        if (!isSupabaseConfigured) return [];
        const manualGigs = await ManualGigService.getManualGigs(artistId);
        
        return manualGigs.map(gig => ({
            id: `manual_${gig.id}`,
            artistId: gig.artist_id,
            date: gig.date,
            venueName: gig.event_name,
            payment: gig.payment || 0,
            startTime: gig.start_time,
            endTime: gig.end_time,
            isManual: true,
            payoutStatus: 'paid', // Assume manual gigs are paid
        }));
    }

    static async getTodaysBookingForVenue(venueId: string): Promise<EnrichedBooking | null> {
        if (!isSupabaseConfigured) {
             // For demo mode, let's assume there's always a show today at mock-venue-1
            if (venueId === 'mock-venue-1') {
                return this.getEnrichedBookingById(101); // Get the mock booking for today
            }
            return null;
        }

        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
            .from('bookings')
            .select('*, artists(*)') // a simple join is enough
            .eq('venue_id', venueId)
            .eq('date', today)
            .maybeSingle();
        
        if (error || !data) {
            if(error) console.error(`Error fetching today's booking for venue ${venueId}:`, error.message);
            return null;
        }

        const artist = data.artists ? ArtistService.mapArtistFromDb(data.artists) : null;
        const plan = artist?.plans?.find(p => p.id === data.plan_id);
        const payment = data.payment || plan?.price || 0;

        return {
            id: data.id,
            artistId: data.artist_id,
            venueId: data.venue_id,
            planId: data.plan_id,
            date: data.date,
            status: data.status,
            payoutStatus: data.payout_status,
            artist: artist,
            payment: payment,
            startTime: data.start_time,
            endTime: data.end_time,
            isManual: false,
            confirmation_pin: data.confirmation_pin,
            artist_checked_in: data.artist_checked_in,
            check_in_time: data.check_in_time
        };
    }

    static async getEnrichedBookingById(bookingId: number | string): Promise<EnrichedBooking | null> {
        if (typeof bookingId === 'string' && bookingId.startsWith('manual_')) {
            const manualGigId = parseInt(bookingId.replace('manual_', ''), 10);
            const gig = await ManualGigService.getManualGigById(manualGigId);
            if (!gig) return null;
            return {
                id: `manual_${gig.id}`,
                artistId: gig.artist_id,
                date: gig.date,
                venueName: gig.event_name,
                payment: gig.payment || 0,
                startTime: gig.start_time,
                endTime: gig.end_time,
                isManual: true
            };
        }

        if (!isSupabaseConfigured) {
            const numericBookingId = Number(bookingId);
            const today = new Date();
            const pastDate = new Date();
            pastDate.setDate(today.getDate() - 15);
    
            const mockBookings: {[key: number]: Partial<EnrichedBooking>} = {
                101: {
                    id: 101, artistId: 'mock-artist-1', venueId: 'mock-venue-1', planId: 1, 
                    date: today.toISOString().split('T')[0], 
                    status: 'paid', payoutStatus: 'pending',
                    payment: 800,
                    startTime: '20:00', endTime: '22:00', isManual: false,
                    confirmation_pin: Math.floor(1000 + Math.random() * 9000).toString(), artist_checked_in: false
                },
                103: {
                    id: 103, artistId: 'mock-artist-2', venueId: 'mock-venue-1', planId: null, 
                    date: pastDate.toISOString().split('T')[0], 
                    status: 'paid', payoutStatus: 'paid',
                    payment: 1500,
                    startTime: '21:00', endTime: '00:00', isManual: false,
                    confirmation_pin: Math.floor(1000 + Math.random() * 9000).toString(), artist_checked_in: true,
                    check_in_time: pastDate.toISOString()
                }
            };
    
            const bookingData = mockBookings[numericBookingId];
            if (!bookingData) return null;
    
            const [artist, venue] = await Promise.all([
                ArtistService.getArtistById(bookingData.artistId!),
                VenueService.getVenueById(bookingData.venueId!)
            ]);
    
            return {
                ...bookingData,
                artist,
                venue,
                venueName: venue?.name,
            } as EnrichedBooking;
        };


        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

        if (error || !data) {
            console.error('Error fetching booking:', error?.message);
            return null;
        }

        const [artist, venue] = await Promise.all([
            ArtistService.getArtistById(data.artist_id),
            VenueService.getVenueById(data.venue_id)
        ]);
        
        const plan = artist?.plans?.find(p => p.id === data.plan_id);
        const payment = plan?.price || data.payment || 0; // handle direct offers too

        return {
            ...data,
            artist,
            venue,
            venueName: venue?.name,
            payment,
            startTime: data.start_time,
            endTime: data.end_time,
            isManual: false,
            confirmation_pin: data.confirmation_pin,
            artist_checked_in: data.artist_checked_in,
            check_in_time: data.check_in_time
        };
    }

    static async confirmArtistPresence(bookingId: number, pin: string, artistId: string): Promise<{success: boolean, message: string}> {
        if (!isSupabaseConfigured) {
            // Find the mock booking to check its PIN
            const booking = await this.getEnrichedBookingById(bookingId);
            if (booking?.confirmation_pin === pin) return { success: true, message: 'Presença confirmada!'}
            return { success: false, message: 'PIN incorreto.'}
        };

        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('confirmation_pin, artist_id')
            .eq('id', bookingId)
            .single();

        if (fetchError || !booking) {
            return { success: false, message: 'Reserva não encontrada.' };
        }
        
        if (booking.artist_id !== artistId) {
            return { success: false, message: 'Você não tem permissão para confirmar esta presença.'};
        }

        if (booking.confirmation_pin !== pin) {
            return { success: false, message: 'PIN incorreto. Tente novamente.'};
        }

        const { error: updateError } = await supabase
            .from('bookings')
            .update({ artist_checked_in: true, check_in_time: new Date().toISOString() })
            .eq('id', bookingId);
        
        if (updateError) {
            console.error("Error confirming presence:", updateError);
            return { success: false, message: 'Erro ao salvar a confirmação.'};
        }
        
        return { success: true, message: 'Presença confirmada!'};
    }
}