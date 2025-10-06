import React, { memo } from 'react';
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
      className="bg-gray-800 rounded-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
    >
      <div className="relative pb-[66.66%]"> {/* 3:2 aspect ratio */}
        <img src={venue.imageUrl} alt={venue.name} className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="font-bold text-white text-lg">{venue.name}</h3>
          <p className="text-sm text-gray-300"><i className="fas fa-map-marker-alt text-pink-400 mr-2"></i>{venue.address}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
                {venue.musicStyles?.slice(0, 2).map(style => (
                    <span key={style} className="text-xs font-semibold bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{style}</span>
                ))}
            </div>
            {venue.averageRating && venue.ratingCount && (
                <div className="flex-shrink-0 ml-2">
                     <StarRatingDisplay rating={venue.averageRating} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default memo(VenueCard);
