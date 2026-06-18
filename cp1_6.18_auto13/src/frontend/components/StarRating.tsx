import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

function StarRating({ rating, interactive = false, onRate, size = 'md' }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [bounceIndex, setBounceIndex] = useState<number | null>(null);

  const sizeMap = {
    sm: '0.875rem',
    md: '1.25rem',
    lg: '1.75rem',
  };

  const handleClick = (index: number) => {
    if (!interactive || !onRate) return;
    setBounceIndex(index);
    onRate(index + 1);
    setTimeout(() => setBounceIndex(null), 400);
  };

  const displayRating = hoverRating > 0 ? hoverRating : rating;

  return (
    <div className='stars'>
      {[0, 1, 2, 3, 4].map(index => {
        const isActive = index < displayRating;
        const isBouncing = bounceIndex === index;
        return (
          <span
            key={index}
            className={`rating-star ${isActive ? 'active' : ''} ${isBouncing ? 'bouncing' : ''} ${interactive ? 'interactive' : ''}`}
            style={{ fontSize: sizeMap[size], cursor: interactive ? 'pointer' : undefined }}
            onClick={() => handleClick(index)}
            onMouseEnter={() => interactive && setHoverRating(index + 1)}
            onMouseLeave={() => interactive && setHoverRating(0)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;

