export interface Socials {
  instagram?: string;
  spotify?: string;
  facebook?: string;
}

export interface ProfileCompleteness {
  is_complete: boolean;
  missing_fields: string[];
}

export interface Song {
  title: string;
  artist: string;
  duration?: string;
  previewUrl?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  source: string;
}

export interface Cost {
    description: string;
    value: number;
}

export interface Plan {
  id: number;
  name: string;
  priceCompany: number;
  priceIndividual: number;
  description: string;
  includes: string[];
  costs: Cost[];
}

export interface BandMember {
    id: string;
    name: string;
    instrument: string;
    email?: string;
}

export interface TechnicalRequirements {
    space: string;
    power: string;
    providedByArtist: string[];
    providedByContractor: string[];
}

export interface Artist {
  id: string;
  name: string;
  email: string;
  city: string;
  genre: {
    primary: string;
    secondary: string[];
  };
  imageUrl: string;
  youtubeVideoId?: string;
  bio: string;
  socials: Socials;
  bookedDates?: string[];
  gallery?: string[];
  plans?: Plan[];
  repertoire?: Song[];
  testimonials?: Testimonial[];
  hospitalityRider?: string[];
  technicalRequirements?: TechnicalRequirements;
  bandMembers?: BandMember[];
  status: 'pending' | 'approved' | 'blocked';
  is_pro?: boolean;
  profile_completeness?: ProfileCompleteness;
  is_freelancer?: boolean;
  freelancer_instruments?: string[];
  freelancer_rate?: number;
  freelancer_rate_unit?: string;
  is_featured?: boolean;
  quality_score?: number;
  quality_issues?: string[];
  pro_subscription_ends_at?: string;
  referred_by?: string | null;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  imageUrl: string;
  email: string;
  password?: string; // only for signup
  status?: 'active' | 'blocked';
  contractor_type: 'company' | 'individual';
  description?: string;
  musicStyles?: string[];
  capacity?: number;
  contact?: { name: string; phone: string; };
  website?: string;
  socials?: Socials;
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
    artist_id: string;
    venue_id: string;
    plan_id: number;
    date: string;
    status: 'pending' | 'paid';
    payout_status: 'pending' | 'paid';
    payment_gateway_txn_id?: string;
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
    status: 'pending' | 'paid';
    date: string;
}

export interface GigOffer {
    id: number;
    venueId: string;
    date: string;
    startTime: string;
    endTime: string;
    payment: number;
    notes: string;
    genre: string;
    status: 'open' | 'booked';
    bookedByArtistId?: string | null;
}

export interface DirectGigOffer {
    id: number;
    venueId: string;
    artistId: string;
    date: string;
    startTime: string;
    endTime: string;
    payment: number;
    message: string;
    status: 'pending' | 'accepted' | 'declined' | 'countered';
}

export interface Notification {
  id: string | number;
  type: 'booking' | 'payment' | 'reminder' | 'tip' | 'offer' | 'gig_booked';
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  timestamp: Date;
}

export interface SupportTicket {
  id: number;
  created_at: string;
  booking_id: number;
  reporter_id: string;
  reporter_type: 'artist' | 'venue';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  booking?: any;
  reporter?: { name: string; type: string };
}

export interface PlatformTransaction {
    id: number;
    description: string;
    type: 'income' | 'expense';
    category: string;
    value: number;
    status: 'pending' | 'paid';
    due_date: string;
    created_at: string;
    booking_id?: number;
}

export interface Rating {
  id: number;
  artistId: string;
  venueId: string;
  rating: number;
  comment: string;
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

export interface SpecialPrice {
    id: number;
    artist_id: string;
    venue_id: string;
    plan_id: number;
    special_price: number;
    venues?: Venue; // for enrichment
}

export interface PlatformBanner {
    id: number;
    desktop_image_url: string;
    mobile_image_url: string;
    link_url: string; // whatsapp number
    is_active: boolean;
}

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