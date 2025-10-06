// FIX: Removed circular self-import and added missing type definitions. All types are now defined and exported from this file.

export interface Song {
  title: string;
  artist: string;
  duration?: string;
  previewUrl?: string;
}

export interface Notification {
  id: string | number;
  type: 'booking' | 'payment' | 'reminder' | 'tip' | 'offer' | 'gig_booked' | string;
  title?: string;
  message: string;
  link?: string;
  isRead: boolean;
  timestamp: Date;
}

export interface PlatformTransaction {
  id: number;
  created_at: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  value: number;
  status: 'pending' | 'paid';
  due_date?: string;
  booking_id?: number;
}

export interface Rating {
  id: number;
  artistId: string;
  venueId: string;
  rating: number;
  comment?: string;
}

export interface PublicRating {
  id: number;
  artistId: string;
  venueId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  venueName?: string; 
}


export interface SupportTicket {
  id: number;
  created_at?: string;
  booking_id?: number;
  reporter_id?: string;
  reporter_type?: 'artist' | 'venue';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  booking?: any; // Enriched data
  reporter?: { name: string; type: 'artist' | 'venue' }; // Enriched data
}

export interface ProfileCompleteness {
  is_complete: boolean;
  missing_fields: string[];
}

export interface Musician {
  id: string;
  name: string;
  email?: string;
  password?: string;
  instrument: string;
  city: string;
  bio: string;
  imageUrl: string;
  youtubeVideoId?: string;
  phone?: string;
  socials?: {
    instagram?: string;
    facebook?: string;
  };
  styles?: string[];
  gallery?: string[];
  repertoire?: Song[];
  status: 'approved' | 'pending' | 'blocked';
  profile_completeness: ProfileCompleteness;
}


export interface CostItem {
  id: number;
  description: string;
  value: number;
  status: 'pending' | 'paid';
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  description: string;
  includes: string[];
  costs?: CostItem[];
}

export interface Testimonial {
  quote: string;
  author: string;
  source: string;
}

export interface BandMember {
  id: string; // Could be a musician's user ID or a temp ID for non-registered members
  name: string;
  instrument: string;
  email?: string;
  phone?: string;
}

export interface Artist {
  id: string;
  name: string;
  email?: string;
  password?: string;
  phone?: string;
  city: string;
  genre: {
    primary: string;
    secondary: string[];
  };
  imageUrl: string;
  youtubeVideoId: string;
  bio: string;
  socials: {
    instagram?: string;
    spotify?: string;
    facebook?: string;
  };
  bookedDates?: string[];
  gallery?: string[];
  plans?: Plan[];
  repertoire?: Song[];
  testimonials?: Testimonial[];
  hospitalityRider?: string[];
  bandMembers?: BandMember[];
  status: 'approved' | 'pending' | 'blocked';
  is_pro?: boolean;
  pro_subscription_ends_at?: string; // For referral rewards
  referred_by?: string; // ID of the artist who referred this one
  averageRating?: number;
  ratingCount?: number;
  is_featured?: boolean;
  quality_score?: number;
  quality_issues?: string[];
  profile_completeness?: ProfileCompleteness;
}

export interface Venue {
  id: string;
  name:string;
  address: string;
  city: string;
  imageUrl: string;
  email?: string;
  password?: string;
  status?: 'active' | 'blocked';
  contractor_type?: 'company' | 'individual';
  
  // New fields for detail page
  description?: string;
  musicStyles?: string[];
  capacity?: number;
  contact?: {
    name: string;
    phone: string;
  };
  website?: string;
  socials?: {
    instagram?: string;
  };
  
  proposalInfo?: {
    structure: { title: string; details: string[] };
    audience: { title: string; details: string[] };
  };
  
  photos?: string[];
  equipment?: string[];
  averageRating?: number;
  ratingCount?: number;
  profile_completeness?: ProfileCompleteness;
}


export interface Booking {
  id: number;
  artistId: string;
  venueId: string;
  planId: number;
  date: string; // YYYY-MM-DD
  status: 'pending' | 'paid';
  payoutStatus: 'pending' | 'paid';
  confirmation_pin?: string;
  artist_checked_in?: boolean;
  check_in_time?: string;
}

export interface PersonalTransaction {
  id: number;
  type: 'income' | 'expense';
  description: string;
  category: string;
  value: number;
  status: 'pending' | 'paid'; // 'paid' can mean paid expense or received income
  date: string; // YYYY-MM-DD
}

export interface GigOffer {
  id: number;
  venueId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  payment: number;
  notes?: string;
  genre?: string;
  status: 'open' | 'booked';
  bookedByArtistId?: string | null;
}

export interface DirectGigOffer {
  id: number;
  venueId: string;
  artistId: string; // The artist this is offered to
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  payment: number;
  message: string; // Personalized message from venue
  status: 'pending' | 'accepted' | 'declined' | 'countered';
}

export interface SpecialPrice {
  id: number;
  artist_id: string;
  venue_id: string;
  plan_id: number;
  special_price: number;
  venues: Venue; // Enriched data
}

export interface PlatformBanner {
    id: number;
    desktop_image_url: string | null;
    mobile_image_url: string | null;
    link_url: string | null;
    is_active: boolean;
}

// Referral Types
export interface Referral {
    name: string;
    status: 'Cadastrado' | 'Virou PRO';
    date: string;
}

// Analytics Types
export interface GenreTrend {
    genre: string;
    searches: number;
}

export interface KeywordTrend {
    term: string;
    searches: number;
}

export interface ArtistAppearance {
    term: string;
    appearances: number;
}

export interface ProfileViewTrend {
    date: string;
    views: number;
}

export interface VenueActivity {
    id: string;
    name: string;
    imageUrl: string;
    activityScore: number;
}

export interface SearchAnalyticsData {
    searchAppearances: number;
    profileClicks: number;
    genreTrends: GenreTrend[];
    keywordTrends: KeywordTrend[];
    hottestDates: string[];
    yourTopKeywords: ArtistAppearance[];
    profileViewTrend: ProfileViewTrend[];
    mostActiveVenues: VenueActivity[];
    platformBenchmark: {
        averageConversionRate: number;
    };
    aiInsights: string[];
}