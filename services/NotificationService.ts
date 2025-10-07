
import { Notification } from '../types';
import { DirectOfferService } from './DirectOfferService';
import { GigService } from './GigService';

export class NotificationServiceManager {

  /**
   * Simulates fetching notifications for an artist.
   * In a real app, this would come from a 'notifications' table.
   */
  // FIX: Changed artistId type from number to string to match the data model.
  async getArtistNotifications(artistId: string): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const now = new Date();

    // Check for pending direct offers
    const pendingOffers = await DirectOfferService.getPendingOffersForArtist(artistId);
    if (pendingOffers.length > 0) {
      notifications.push({
        id: `offer-${pendingOffers[0].id}`,
        type: 'offer',
        title: 'Nova Proposta',
        message: `Você tem ${pendingOffers.length} nova${pendingOffers.length > 1 ? 's' : ''} proposta${pendingOffers.length > 1 ? 's' : ''} de show!`,
        link: '/direct-offers',
        isRead: false,
        timestamp: new Date(now.getTime() - 10 * 60 * 1000) // 10 mins ago
      });
    }

    // Add a generic reminder if no other notifications
    if (notifications.length === 0) {
         notifications.push({
            id: 'reminder-1',
            type: 'reminder',
            title: 'Lembrete',
            message: 'Mantenha seu perfil atualizado para atrair mais contratantes.',
            link: '/edit-profile',
            isRead: false,
            timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        });
    }
    
    return notifications.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Simulates fetching notifications for a venue.
   */
  // FIX: Changed venueId type from number to string to match the data model.
  async getVenueNotifications(venueId: string): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const now = new Date();

    // Check for recently booked gigs
    const venueGigs = await GigService.getGigsForVenue(venueId);
    const recentlyBooked = venueGigs.filter(g => 
        g.status === 'booked' && 
        new Date(g.date) > new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // Booked in last 3 days
    );

    if (recentlyBooked.length > 0) {
        const latest = recentlyBooked[0];
        notifications.push({
            id: `gigbooked-${latest.id}`,
            type: 'gig_booked',
            title: 'Vaga Preenchida',
            message: `O artista ${latest.artist?.name || ''} reservou sua vaga para ${new Date(latest.date).toLocaleDateString('pt-BR')}.`,
            link: '/sent-offers',
            isRead: false,
            timestamp: new Date(now.getTime() - 30 * 60 * 1000) // 30 mins ago
        });
    }

    if (notifications.length === 0) {
         notifications.push({
            id: 'tip-1',
            type: 'tip',
            title: 'Dica',
            message: 'Navegue pelos artistas e envie propostas diretas para garantir seu talento favorito.',
            link: '/artists',
            isRead: false,
            timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        });
    }

    return notifications.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const NotificationService = new NotificationServiceManager();
