import React from 'react';

interface StarRatingDisplayProps {
  rating: number;
}

const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <span key={ratingValue} className={`text-sm ${ratingValue <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'}`}>
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

export default StarRatingDisplay;
