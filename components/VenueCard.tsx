import React from 'react';
import { Venue } from '../data';
import StarRatingDisplay from './StarRatingDisplay';

interface VenueCardProps {
  venue: Venue;
  onSelect: (venue: Venue) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(venue)} 
      className="block bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row transform transition-all duration-300 hover:scale-[1.02] hover:shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 cursor-pointer"
      aria-label={`Ver detalhes de ${venue.name}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(venue)}
    >
      <img src={venue.imageUrl} alt={venue.name} className="w-full md:w-1/3 h-48 md:h-auto object-cover" loading="lazy" />
      <div className="p-6 flex flex-col justify-between flex-grow">
        <div>
            <h3 className="text-2xl font-bold text-white">{venue.name}</h3>
            <p className="text-md text-gray-400 mt-1"><i className="fas fa-map-marker-alt mr-2"></i>{venue.address}</p>
             {venue.averageRating && typeof venue.averageRating === 'number' && venue.ratingCount ? (
                <div className="flex items-center gap-2 mt-2">
                    <StarRatingDisplay rating={venue.averageRating} />
                    <span className="text-sm font-semibold text-white">{venue.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({venue.ratingCount} avaliações)</span>
                </div>
            ) : null}
        </div>
        {venue.musicStyles && venue.musicStyles.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-red-500">Estilos em destaque:</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {venue.musicStyles.slice(0, 3).map((style) => (
                <span key={style} className="bg-gray-700 text-gray-200 text-sm font-medium px-3 py-1 rounded-full">{style}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(VenueCard);