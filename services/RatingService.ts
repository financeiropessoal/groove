import { Rating } from '../types';

// Mock data to simulate existing ratings
const mockRatings: { [artistId: string]: Rating[] } = {
  'mock-artist-1': [
    { id: 1, artistId: 'mock-artist-1', venueId: 'mock-venue-1', rating: 5, comment: 'Performance incrível, super profissional. Recomendo!' },
    { id: 2, artistId: 'mock-artist-1', venueId: 'mock-venue-2', rating: 4, comment: 'Muito bom, animou a galera. Apenas um pequeno atraso na chegada.' },
  ],
  'mock-artist-2': [
    { id: 3, artistId: 'mock-artist-2', venueId: 'mock-venue-1', rating: 5, comment: 'Rock de primeira qualidade!' },
  ],
};


export class RatingService {
  static async getRatingsForArtist(artistId: string): Promise<Rating[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockRatings[artistId] || [];
  }

  static async submitRating(rating: Omit<Rating, 'id'>): Promise<boolean> {
    console.log('Submitting rating:', rating);
    
    // Simulate adding the rating to our mock data
    if (!mockRatings[rating.artistId]) {
      mockRatings[rating.artistId] = [];
    }
    mockRatings[rating.artistId].unshift({ id: Date.now(), ...rating });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }
}
