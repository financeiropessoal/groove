import React from 'react';
import { Artist } from '../data';
import StarRatingDisplay from './StarRatingDisplay';

interface ArtistCardProps {
  artist: Artist;
  onSelect: (artist: Artist) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onSelect }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(artist);
    }
  };
  
  return (
    <div 
      onClick={() => onSelect(artist)}
      onKeyDown={handleKeyDown}
      className="w-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-gray-900 focus:ring-red-500 rounded-lg"
      aria-label={`Ver perfil de ${artist.name}`}
      role="button"
      tabIndex={0}
    >
      <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-xl w-full aspect-[2/3] flex flex-col justify-end text-white transition-transform duration-300 md:group-hover:scale-105">
        <img 
          src={artist.imageUrl} 
          alt={artist.name} 
          className="absolute inset-0 w-full h-full object-cover" 
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        <div className="relative p-4 z-10">
            <h3 className="text-xl md:text-2xl font-bold text-white flex items-center">
              {artist.name}
              {artist.status === 'approved' && (
                  <i 
                    className="fas fa-check-circle text-green-400 ml-2 text-lg"
                    title="Artista Verificado"
                  ></i>
              )}
            </h3>
            <p className="text-md text-red-400 font-semibold mt-1">{artist.genre.primary}</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ArtistCard);