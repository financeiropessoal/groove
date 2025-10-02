import React, { useState, memo } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex justify-center space-x-2">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            className={`text-4xl transition-colors duration-200 ${
              starValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-600'
            }`}
            onClick={() => onRatingChange(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Avaliar com ${starValue} estrela${starValue > 1 ? 's' : ''}`}
          >
            &#9733;
          </button>
        );
      })}
    </div>
  );
};

export default memo(StarRating);