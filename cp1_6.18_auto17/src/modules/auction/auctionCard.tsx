import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuctionCardProps {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  currentPrice: number;
  endTime: number;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const calculateTimeLeft = (endTime: number): TimeLeft => {
  const total = endTime - Date.now();
  if (total <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, total };
};

const formatPrice = (price: number): string => {
  if (price <= 0) return '暂无出价';
  return '¥' + price.toLocaleString('zh-CN');
};

const padZero = (num: number): string => {
  return num.toString().padStart(2, '0');
};

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    className={`heart-icon ${filled ? 'filled' : ''}`}
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function AuctionCard({
  id,
  name,
  description,
  coverImage,
  currentPrice,
  endTime,
}: AuctionCardProps) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(endTime));
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(endTime));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const isEnded = timeLeft.total <= 0;

  const handleCardClick = useCallback(() => {
    if (!isEnded) {
      navigate(`/auction/${id}`);
    }
  }, [id, isEnded, navigate]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited((prev) => !prev);
  }, []);

  const countdownText = `${padZero(timeLeft.hours)}:${padZero(timeLeft.minutes)}:${padZero(timeLeft.seconds)}`;

  return (
    <div
      className={`auction-card ${isEnded ? 'auction-card-ended' : ''}`}
      onClick={handleCardClick}
    >
      {isEnded && (
        <div className="auction-card-ended-badge">
          已结束
        </div>
      )}
      <img src={coverImage} alt={name} className="auction-card-image" />
      <div className="auction-card-body">
        <h3 className="auction-card-name">{name}</h3>
        <p className="auction-card-description">{description}</p>
        <div className="auction-card-price">
          <span className="price-label">当前价</span>
          <span className="price-value">{formatPrice(currentPrice)}</span>
        </div>
        <div className="auction-card-footer">
          <div className="auction-card-countdown">
            <span className="countdown-text-label">剩余时间</span>
            <span className={`countdown-text-value ${isEnded ? 'ended' : ''}`}>
              {isEnded ? '已结束' : countdownText}
            </span>
          </div>
          <button
            type="button"
            className={`card-favorite-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorited ? '取消收藏' : '收藏'}
          >
            <HeartIcon filled={isFavorited} />
          </button>
        </div>
      </div>
    </div>
  );
}
