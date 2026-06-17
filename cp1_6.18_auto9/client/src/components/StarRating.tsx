import React, { useState, useEffect } from 'react';

interface StarRatingProps {
  rating: number;
  onChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    onChange(index);
  };

  const getFillColor = (index: number) => {
    const activeRating = hoverRating || rating;
    if (index <= activeRating) {
      return hoverRating > 0 && index <= hoverRating
        ? 'var(--star-hover)'
        : 'var(--star-color)';
    }
    return '#e5e7eb';
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="star"
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(index)}
        >
          <svg
            viewBox="0 0 24 24"
            fill={getFillColor(index)}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default StarRating;
