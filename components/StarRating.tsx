import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => {
  return (
    <div>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            onClick={() => setRating(ratingValue)}
            className={`text-2xl ${ratingValue <= rating ? 'text-yellow-400' : 'text-gray-500'}`}
          >
            &#9733;
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
