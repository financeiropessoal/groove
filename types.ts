export interface Notification {
  id: string;
  type: 'booking' | 'reminder' | 'payment' | 'tip' | 'offer' | 'gig_booked';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  timestamp: Date;
}

export interface Rating {
  id: number;
  gig_id: number; // Foreign key to gig_offers
  rating: number; // 1-5
  comment?: string;
  rater_id: string; // auth.uid() of the user giving the rating
  rater_type: 'artist' | 'venue';
  ratee_id: string; // The user ID of the one being rated
  ratee_type: 'artist' | 'venue';
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
  created_at: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  value: number;
  status: 'pending' | 'paid';
  due_date?: string;
  booking_id?: number;
}