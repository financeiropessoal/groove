import { Artist, Venue } from '../data';
import { Musician } from '../types';

export interface CompletenessResult {
    is_complete: boolean;
    missing_fields: string[];
}

export const ProfileCompletenessService = {

    checkArtistCompleteness(artist: Partial<Artist>): CompletenessResult {
        const missing_fields: string[] = [];

        if (!artist.bio || artist.bio.trim().length < 50) {
            missing_fields.push('Adicionar uma biografia com pelo menos 50 caracteres.');
        }
        if (!artist.imageUrl || artist.imageUrl.includes('1043471')) {
            missing_fields.push('Adicionar uma foto de perfil.');
        }
        if (!artist.youtubeVideoId) {
            missing_fields.push('Adicionar um vídeo de performance do YouTube.');
        }
        if (!artist.plans || artist.plans.length === 0) {
            missing_fields.push('Cadastrar pelo menos um pacote de show.');
        }

        return {
            is_complete: missing_fields.length === 0,
            missing_fields,
        };
    },

    checkVenueCompleteness(venue: Partial<Venue>): CompletenessResult {
        const missing_fields: string[] = [];

        if (!venue.description || venue.description.trim().length < 50) {
            missing_fields.push('Adicionar uma descrição com pelo menos 50 caracteres.');
        }
        if (!venue.imageUrl || venue.imageUrl.includes('1763075')) {
            missing_fields.push('Adicionar uma foto principal do local.');
        }
        if (!venue.address || venue.address.trim().length === 0) {
            missing_fields.push('Preencher o endereço do local.');
        }
         if (!venue.musicStyles || venue.musicStyles.length === 0) {
            missing_fields.push('Especificar os estilos musicais que o local costuma ter.');
        }

        return {
            is_complete: missing_fields.length === 0,
            missing_fields,
        };
    },
    
    checkMusicianCompleteness(musician: Partial<Musician>): CompletenessResult {
        const missing_fields: string[] = [];

        if (!musician.bio || musician.bio.trim().length < 30) {
            missing_fields.push('Adicionar uma biografia com pelo menos 30 caracteres.');
        }
        if (!musician.imageUrl || musician.imageUrl.includes('1043471')) {
            missing_fields.push('Adicionar uma foto de perfil.');
        }
        if (!musician.instrument) {
            missing_fields.push('Especificar seu instrumento principal.');
        }
        if (!musician.city) {
            missing_fields.push('Informar sua cidade de atuação.');
        }

        return {
            is_complete: missing_fields.length === 0,
            missing_fields,
        };
    }
};