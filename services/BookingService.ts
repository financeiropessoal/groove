import { isSupabaseConfigured, supabase } from '../supabaseClient';

// An enriched booking includes details from other tables
export interface EnrichedBooking {
  id: number;
  artistId: string;
  venueId: string;
  venueName: string;
  planId: number;
  planName: string;
  planPrice: number;
  date: string;
  status: 'pending' | 'paid';
  payoutStatus: 'pending' | 'paid';
}

export class BookingService {

  static async createBooking(bookingData: { artistId: string, venueId: string, planId: number, dates: string[] }): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    const bookingsToInsert = bookingData.dates.map(date => ({
      artist_id: bookingData.artistId,
      venue_id: bookingData.venueId,
      plan_id: bookingData.planId,
      date: date,
      status: 'paid', // Assuming payment is confirmed at this stage
      payout_status: 'pending'
    }));

    const { error } = await supabase.from('bookings').insert(bookingsToInsert);
    if (error) {
      console.error('Error creating booking:', error.message);
      return false;
    }
    
    // Also update artist's booked dates
    const { data: artist, error: artistError } = await supabase
        .from('artists')
        .select('booked_dates')
        .eq('id', bookingData.artistId)
        .single();
    
    if (artistError) {
        console.error('Failed to fetch artist for updating booked dates', artistError.message);
        // The booking was created, but dates were not updated. This is a partial success/failure state.
        return true; 
    }
    
    const existingDates = new Set(artist.booked_dates || []);
    bookingData.dates.forEach(d => existingDates.add(d));

    const { error: updateError } = await supabase
      .from('artists')
      .update({ booked_dates: Array.from(existingDates) })
      .eq('id', bookingData.artistId);
      
    if(updateError) {
        console.error("Failed to update artist's booked dates", updateError.message);
    }

    return true;
  }

  static async getEnrichedBookingsForArtist(artistId: string): Promise<EnrichedBooking[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        artist_id,
        venue_id,
        plan_id,
        date,
        status,
        payout_status,
        venues ( name ),
        artists ( plans )
      `)
      .eq('artist_id', artistId);

    if (error) {
      console.error('Error fetching enriched bookings for artist:', error.message);
      return [];
    }

    return data.map((b: any) => {
      const plan = b.artists?.plans?.find((p: any) => p.id === b.plan_id);
      return {
        id: b.id,
        artistId: b.artist_id,
        venueId: b.venue_id,
        venueName: b.venues?.name || 'Local Desconhecido',
        planId: b.plan_id,
        planName: plan?.name || 'Proposta Direta',
        planPrice: plan?.price || 0, // In a real app we'd get price from offer
        date: b.date,
        status: b.status,
        payoutStatus: b.payout_status
      };
    });
  }

  static async getArtistRevenueLast30Days(artistId: string): Promise<number> {
    if (!isSupabaseConfigured) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateString = thirtyDaysAgo.toISOString().split('T')[0];

    const bookings = await this.getEnrichedBookingsForArtist(artistId);

    return bookings
      .filter(b => b.payoutStatus === 'paid' && b.date >= dateString)
      .reduce((sum, b) => sum + b.planPrice, 0);
  }
}
