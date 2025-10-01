import React from 'react';

interface StarRatingDisplayProps {
  rating: number;
  totalStars?: number;
  size?: string;
}

const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({ rating, totalStars = 5, size = 'text-lg' }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = totalStars - fullStars - halfStar;

  return (
    <div className="flex items-center text-yellow-400">
      {[...Array(fullStars)].map((_, i) => (
        <i key={`full-${i}`} className={`fas fa-star ${size}`}></i>
      ))}
      {halfStar === 1 && <i key="half" className={`fas fa-star-half-alt ${size}`}></i>}
      {[...Array(emptyStars)].map((_, i) => (
        <i key={`empty-${i}`} className={`far fa-star ${size} text-gray-600`}></i>
      ))}
    </div>
  );
};

export default StarRatingDisplay;