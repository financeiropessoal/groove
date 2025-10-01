import { PlatformTransaction } from "./types";

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

export interface Artist {
  id: string;
  name: string;
  email?: string;
  password?: string;
  phone?: string;
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
  technicalRequirements?: {
    space: string;
    power: string;
    providedByArtist: string[];
    providedByContractor: string[];
  };
  hospitalityRider?: string[];
  status: 'approved' | 'pending' | 'blocked';
}

export interface Venue {
  id: string;
  name:string;
  address: string;
  imageUrl: string;
  email?: string;
  password?: string;
  status?: 'active' | 'blocked';
  
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
}


export interface Booking {
  id: number;
  artistId: string;
  venueId: string;
  planId: number;
  date: string; // YYYY-MM-DD
  status: 'pending' | 'paid';
  payoutStatus: 'pending' | 'paid';
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
  status: 'pending' | 'accepted' | 'declined';
}