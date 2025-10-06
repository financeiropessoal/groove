// services/ModerationService.ts

export interface FlaggedContent {
    id: number;
    type: 'profile_bio' | 'profile_image' | 'chat_message' | 'repertoire_song';
    content: string;
    reason: string;
    user: {
        id: string;
        name: string;
        type: 'artist' | 'venue' | 'musician';
    };
    reporter?: {
        id: string;
        name: string;
    };
    timestamp: Date;
}

// Mock data to simulate flagged content
const mockFlaggedContent: FlaggedContent[] = [
    {
        id: 1,
        type: 'profile_bio',
        content: 'Contrate-me fora da plataforma pelo meu site: www.meusite-spam.com! É mais barato!',
        reason: 'Detecção automática de link externo na bio.',
        user: { id: 'mock-artist-4', name: 'DJ Solaris', type: 'artist' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
        id: 2,
        type: 'profile_image',
        content: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg', // A picture of a dog
        reason: 'Reportado por usuário: "Foto não profissional / meme".',
        user: { id: 'mock-venue-2', name: 'Rock House Pub', type: 'venue' },
        reporter: { id: 'mock-artist-1', name: 'Laura Diniz' },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
        id: 3,
        type: 'repertoire_song',
        content: 'Título: "Música com nome ofensivo", Artista: "Banda Teste"',
        reason: 'Detecção automática de palavra-chave inadequada.',
        user: { id: 'mock-artist-8', name: 'Rafa G.', type: 'artist' },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    }
];

export class ModerationService {
    
    /**
     * Fetches all content that has been flagged for review.
     * In a real app, this would query a 'flagged_content' table.
     */
    static async getFlaggedContent(): Promise<FlaggedContent[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return Promise.resolve(mockFlaggedContent.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
    }

    /**
     * Takes an action on a piece of flagged content.
     * @param flagId The ID of the flag to resolve.
     * @param action The action to take.
     */
    static async resolveFlag(flagId: number, action: 'ignore' | 'remove' | 'block'): Promise<boolean> {
        console.log(`[ModerationService] Resolving flag ID ${flagId} with action: ${action.toUpperCase()}`);
        
        // In a real app, you would perform the following:
        // 1. Find the flagged item by its ID.
        // 2. Based on the action:
        //    - 'ignore': Delete the flag record.
        //    - 'remove': Delete the flag record AND update the source content (e.g., set user's bio to null).
        //    - 'block': Delete the flag record AND update the user's status to 'blocked'.
        // 3. Potentially create a notification for the user whose content was moderated.

        // Simulate network delay and success
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Remove the item from our mock list for the demo
        const index = mockFlaggedContent.findIndex(item => item.id === flagId);
        if (index > -1) {
            mockFlaggedContent.splice(index, 1);
        }

        return Promise.resolve(true);
    }
}
