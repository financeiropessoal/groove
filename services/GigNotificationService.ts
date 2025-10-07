
import { Artist, GigOffer } from '../types';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { ArtistService } from './ArtistService';
import { EmailService } from './EmailService';
import { VenueService } from './VenueService';

export class GigNotificationService {
  /**
   * Identifica artistas relevantes e os notifica sobre uma nova vaga de show.
   * @param gig A vaga de show que foi criada.
   */
  static async notifyRelevantArtists(gig: Omit<GigOffer, 'id' | 'status' | 'bookedByArtistId'>) {
    if (!isSupabaseConfigured) {
      console.log('Simulando envio de notificação de show, pois o Supabase não está configurado.');
      return;
    }

    // 1. Obter detalhes completos da vaga (precisamos do nome do local)
    const venue = await VenueService.getVenueById(gig.venueId);
    if (!venue) {
      console.error('Não foi possível enviar notificações: Local não encontrado.');
      return;
    }

    // 2. Obter todos os artistas aprovados
    const allArtists = await ArtistService.getAllArtists();
    
    // 3. Filtrar por artistas relevantes
    const relevantArtists = allArtists.filter(artist => {
      // Se a vaga não especificar um gênero, não notificamos ninguém para evitar spam.
      if (!gig.genre) return false; 
      
      const gigGenre = gig.genre.trim().toLowerCase();
      const artistPrimaryGenre = artist.genre.primary.toLowerCase();
      const artistSecondaryGenres = artist.genre.secondary.map(g => g.toLowerCase());
      
      // Notifica se o gênero principal do artista incluir o gênero da vaga (Ex: "MPB" inclui "MPB")
      // ou se algum dos gêneros secundários contiver o gênero da vaga.
      return artistPrimaryGenre.includes(gigGenre) || artistSecondaryGenres.some(g => g.includes(gigGenre));
    });

    if (relevantArtists.length === 0) {
      console.log('Nenhum artista relevante encontrado para notificar sobre esta vaga.');
      return;
    }

    // 4. Enviar e-mail para cada artista relevante
    console.log(`Encontrados ${relevantArtists.length} artistas para notificar sobre a nova vaga em ${venue.name}.`);

    for (const artist of relevantArtists) {
      if (artist.email) {
        const subject = `Nova Oportunidade de Show: ${venue.name} está procurando por você!`;
        const body = `
          <div style="font-family: sans-serif; line-height: 1.5;">
            <p>Olá ${artist.name},</p>
            <p>Uma nova vaga para show que combina com seu estilo foi publicada na Groove Music!</p>
            <br>
            <div style="background-color: #f3f4f6; border-left: 4px solid #ef4444; padding: 16px;">
              <p><strong>Local:</strong> ${venue.name}</p>
              <p><strong>Data:</strong> ${new Date(gig.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
              <p><strong>Cachê:</strong> R$ ${Number(gig.payment).toFixed(2).replace('.', ',')}</p>
              <p><strong>Gênero:</strong> ${gig.genre}</p>
            </div>
            <br>
            <p>Não perca tempo! Acesse a plataforma para ver mais detalhes e garantir essa data.</p>
            <p><a href="${window.location.origin}/#/open-gigs" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Ver Vagas Abertas</a></p>
            <br>
            <p>Atenciosamente,</p>
            <p><strong>Equipe Groove Music</strong></p>
          </div>
        `;
        // Executa o envio do e-mail em segundo plano para não bloquear a UI
        EmailService.sendEmail(artist.email, subject, body);
      }
    }
  }
}
