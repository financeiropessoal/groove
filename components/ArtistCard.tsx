import React, { memo } from 'react';
import { Artist } from '../data';

interface ArtistCardProps {
  artist: Artist;
  onSelect: (artist: Artist) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(artist)} 
      className="bg-gray-800 rounded-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
    >
      <div className="relative pb-[125%]"> {/* 4:5 aspect ratio */}
        <img src={artist.imageUrl} alt={artist.name} className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3 w-full">
          <h3 className="font-bold text-white truncate">{artist.name}</h3>
          <p className="text-sm text-pink-400 truncate">{artist.genre.primary}</p>
        </div>
        {artist.is_featured && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                <i className="fas fa-star text-xs mr-1"></i>
                Destaque
            </div>
        )}
      </div>
    </div>
  );
};

export default memo(ArtistCard);