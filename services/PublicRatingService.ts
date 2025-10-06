import { PublicRating } from '../types';
import { VenueService } from './VenueService';

// Mock data
const mockPublicRatings: { [artistId: string]: PublicRating[] } = {
  'mock-artist-1': [
    { id: 101, artistId: 'mock-artist-1', venueId: 'mock-venue-1', rating: 5, comment: 'Que showzaço! A energia foi incrível!', createdAt: new Date().toISOString() },
    { id: 102, artistId: 'mock-artist-1', venueId: 'mock-venue-1', rating: 4, comment: 'Gostei muito, mas o som estava um pouco alto.', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 103, artistId: 'mock-artist-1', venueId: 'mock-venue-2', rating: 5, comment: 'Voz linda!', createdAt: new Date(Date.now() - 86400000).toISOString() },
  ]
};

export class PublicRatingService {
  static async getRatingsForArtist(artistId: string): Promise<PublicRating[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const ratings = mockPublicRatings[artistId] || [];

    // Enrich with venue names
    const enrichedRatings = await Promise.all(ratings.map(async (rating) => {
        const venue = await VenueService.getVenueById(rating.venueId);
        return {
            ...rating,
            venueName: venue?.name || 'Local desconhecido',
        };
    }));
    
    return enrichedRatings;
  }

  static async submitRating(ratingData: Omit<PublicRating, 'id' | 'createdAt' | 'venueName'>): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newRating: PublicRating = {
      ...ratingData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    if (!mockPublicRatings[ratingData.artistId]) {
      mockPublicRatings[ratingData.artistId] = [];
    }
    mockPublicRatings[ratingData.artistId].unshift(newRating);
    console.log('New public rating submitted:', newRating);
    return true;
  }
}
