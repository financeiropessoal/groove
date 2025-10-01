import { Artist, Venue, GigOffer } from '../data';
import { ArtistService } from './ArtistService';
import { GigService } from './GigService';
import { VenueService } from './VenueService';

export type ActivityType = 'NEW_ARTIST' | 'ARTIST_APPROVED' | 'NEW_VENUE' | 'NEW_GIG_OFFER' | 'GIG_BOOKED';

export interface Activity {
    id: number;
    type: ActivityType;
    timestamp: Date;
    details: {
        artistName?: string;
        venueName?: string;
        genre?: string;
    };
}

export class ActivityService {
    /**
     * Simulates fetching a list of recent activities on the platform.
     */
    static async getRecentActivities(): Promise<Activity[]> {
        // NOTE: The original implementation used a broken import for mock data.
        // This has been updated to fetch live data from other services to simulate activities.
        const artists: Artist[] = await ArtistService.getAllArtistsForAdmin();
        const venues: Venue[] = await VenueService.getAllVenues();

        const allGigsPromises = venues.map(v => GigService.getGigsForVenue(v.id));
        const allGigsNested = await Promise.all(allGigsPromises);
        const gigOffers: (GigOffer & { artist?: Artist | undefined; })[] = allGigsNested.flat();


        const activities: Activity[] = [];
        const now = new Date();

        // Activity 1: A new artist is pending approval
        const pendingArtist = artists.find(a => a.status === 'pending');
        if (pendingArtist) {
            activities.push({
                id: 1,
                type: 'NEW_ARTIST',
                timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
                details: { artistName: pendingArtist.name }
            });
        }

        // Activity 2: A recently approved artist
        const recentlyApproved = artists.find(a => a.status === 'approved');
        if (recentlyApproved) {
            activities.push({
                id: 2,
                type: 'ARTIST_APPROVED',
                timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
                details: { artistName: recentlyApproved.name }
            });
        }
        
        // Activity 3: A venue published a new gig offer
        const firstOffer = gigOffers.find(g => g.status === 'open');
        if (firstOffer) {
            const venue = venues.find(v => v.id === firstOffer.venueId);
            activities.push({
                id: 3,
                type: 'NEW_GIG_OFFER',
                timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
                details: { venueName: venue?.name, genre: firstOffer.genre }
            });
        }

        // Activity 4: An artist booked a gig
        const bookedGig = gigOffers.find(g => g.status === 'booked');
        if (bookedGig) {
            const venue = venues.find(v => v.id === bookedGig.venueId);
            const artist = artists.find(a => a.id === bookedGig.bookedByArtistId);
             activities.push({
                id: 4,
                type: 'GIG_BOOKED',
                timestamp: new Date(now.getTime() - 22 * 60 * 60 * 1000), // 22 hours ago
                details: { artistName: artist?.name, venueName: venue?.name }
            });
        }

        // Activity 5: A venue signed up
        const firstVenue = venues[0];
         if(firstVenue) {
            activities.push({
                id: 5,
                type: 'NEW_VENUE',
                timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                details: { venueName: firstVenue.name }
            });
         }

        // Sort activities by most recent first
        const sortedActivities = activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        // Simulate network delay from original implementation
        await new Promise(resolve => setTimeout(resolve, 400));

        return sortedActivities;
    }
}
