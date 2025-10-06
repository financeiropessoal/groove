// services/AnalyticsService.ts
import { Artist } from '../data';
import { SearchAnalyticsData, GenreTrend, KeywordTrend, ArtistAppearance, ProfileViewTrend, VenueActivity } from '../types';
import { ArtistService } from './ArtistService';
import { VenueService } from './VenueService';

// FIX: Add AnalyticsData interface for admin analytics.
export interface AnalyticsData {
    userGrowth: { month: string; artists: number; venues: number }[];
    bookingsByMonth: { month: string; bookings: number }[];
    topArtistsByViews: { id: string; name: string; imageUrl: string; views: number }[];
    topArtistsByBookings: { id: string; name: string; imageUrl: string; bookingCount: number }[];
    genreDistribution: { genre: string; count: number }[];
}

export class AnalyticsService {
    
    // FIX: Add getAnalytics method for the admin dashboard.
    /**
     * Simulates fetching platform-wide analytics for the admin dashboard.
     */
    static async getAnalytics(): Promise<AnalyticsData> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data generation
        const userGrowth = [
            { month: 'Jan', artists: 2, venues: 1 },
            { month: 'Fev', artists: 3, venues: 2 },
            { month: 'Mar', artists: 5, venues: 2 },
            { month: 'Abr', artists: 6, venues: 3 },
            { month: 'Mai', artists: 8, venues: 4 },
            { month: 'Jun', artists: 10, venues: 5 },
        ];

        const bookingsByMonth = [
            { month: 'Jan', bookings: 12 },
            { month: 'Fev', bookings: 15 },
            { month: 'Mar', bookings: 22 },
            { month: 'Abr', bookings: 25 },
            { month: 'Mai', bookings: 31 },
            { month: 'Jun', bookings: 28 },
        ];

        const artists = await ArtistService.getAllArtistsForAdmin();

        const topArtistsByViews = [...artists]
            .sort(() => 0.5 - Math.random()) // shuffle
            .slice(0, 5)
            .map((artist, index) => ({
                id: artist.id,
                name: artist.name,
                imageUrl: artist.imageUrl,
                views: 1000 - (index * 150) + Math.floor(Math.random() * 100), // decreasing views
            }));

        const topArtistsByBookings = [...artists]
            .sort(() => 0.5 - Math.random()) // shuffle
            .slice(0, 5)
            .map((artist, index) => ({
                id: artist.id,
                name: artist.name,
                imageUrl: artist.imageUrl,
                bookingCount: 20 - (index * 3) + Math.floor(Math.random() * 3), // decreasing bookings
            }));
            
        const genreDistributionMap = new Map<string, number>();
        artists.forEach(artist => {
            const genre = artist.genre?.primary;
            if (genre) {
                genreDistributionMap.set(genre, (genreDistributionMap.get(genre) || 0) + 1);
            }
        });

        const genreDistribution = Array.from(genreDistributionMap, ([genre, count]) => ({ genre, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);


        return {
            userGrowth,
            bookingsByMonth,
            topArtistsByViews,
            topArtistsByBookings,
            genreDistribution,
        };
    }

    /**
     * Simulates fetching and computing search analytics for a specific artist.
     * In a real app, this would involve complex queries on search logs and clickstream data.
     */
    static async getSearchAnalytics(artistId: string): Promise<SearchAnalyticsData> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data generation
        const searchAppearances = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
        const profileClicks = Math.floor(searchAppearances * (Math.random() * (0.4 - 0.1) + 0.1)); // 10-40% click rate
        const conversionRate = searchAppearances > 0 ? (profileClicks / searchAppearances) * 100 : 0;
        const averageConversionRate = 18.5;

        const genreTrends: GenreTrend[] = [
            { genre: 'MPB', searches: 180 },
            { genre: 'Rock', searches: 155 },
            { genre: 'Samba', searches: 120 },
            { genre: 'Pop', searches: 95 },
            { genre: 'Forró', searches: 70 },
        ];

        const keywordTrends: KeywordTrend[] = [
            { term: 'Voz e Violão', searches: 98 },
            { term: 'Anos 80', searches: 75 },
            { term: 'Festa de casamento', searches: 62 },
            { term: 'Rock Clássico', searches: 55 },
        ];

        const hottestDates: string[] = [
            new Date(new Date().getFullYear(), 11, 24).toISOString().split('T')[0], // Christmas Eve
            new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0], // New Year's Eve
            new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0], // 2 weeks from now
        ];
        
        // Personalize the data for the current artist
        const artist = await ArtistService.getArtistById(artistId);
        const yourTopKeywords: ArtistAppearance[] = [];
        if (artist) {
            yourTopKeywords.push({
                term: artist.genre.primary,
                appearances: Math.floor(searchAppearances * 0.4) // 40% of appearances from primary genre
            });
            if (artist.genre.secondary[0]) {
                 yourTopKeywords.push({
                    term: artist.genre.secondary[0],
                    appearances: Math.floor(searchAppearances * 0.15)
                });
            }
        }
        yourTopKeywords.push({ term: 'Voz e Violão', appearances: Math.floor(searchAppearances * 0.1) });

        // NEW MOCK DATA
        const profileViewTrend: ProfileViewTrend[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            profileViewTrend.push({
                date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                views: Math.floor(Math.random() * 15) + (i > 20 ? 2 : 5), // simulate some trend
            });
        }
        
        const mockVenues = await VenueService.getAllVenues();
        const mostActiveVenues: VenueActivity[] = mockVenues.slice(0, 4).map((venue, index) => ({
            id: venue.id,
            name: venue.name,
            imageUrl: venue.imageUrl,
            activityScore: 100 - (index * 15),
        }));

        const aiInsights: string[] = [
            "O termo 'Voz e Violão' está em alta. Considere criar um pacote com este nome se você oferece este formato.",
            `Seu gênero principal, ${artist?.genre.primary || 'MPB'}, é o mais buscado na plataforma. Ótimo!`,
            `Sua taxa de cliques (${conversionRate.toFixed(1)}%) está ${conversionRate > averageConversionRate ? 'acima' : 'um pouco abaixo'} da média para artistas do seu gênero (${averageConversionRate.toFixed(1)}%). ${conversionRate < averageConversionRate ? "Tente atualizar sua foto de perfil para uma mais profissional e chamativa para atrair mais contratantes." : "Continue com o ótimo trabalho no seu material de divulgação!"}`
        ];

        return {
            searchAppearances,
            profileClicks,
            genreTrends,
            keywordTrends,
            hottestDates,
            yourTopKeywords: yourTopKeywords.sort((a, b) => b.appearances - a.appearances),
            profileViewTrend,
            mostActiveVenues,
            platformBenchmark: {
                averageConversionRate: averageConversionRate
            },
            aiInsights,
        };
    }
}