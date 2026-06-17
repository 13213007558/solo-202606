import { useState, useEffect, useRef } from 'react';
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
  return price.toLocaleString("zh-CN");
};

const padZero = (num: number): string => {
  return num.toString().padStart(2, "0");
};

const FlipDigit = ({ value, urgent }: { value: string; urgent: boolean }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
        prevValueRef.current = value;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <div className={`flip-digit ${isFlipping ? 'flipping' : ''} ${urgent ? 'urgent' : ''}`}>
      <div className="flip-digit-inner">
        <div className="flip-digit-front">{displayValue}</div>
        <div className="flip-digit-back">{value}</div>
      </div>
    </div>
  );
};

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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const isUrgent = timeLeft.total < 3600000 && timeLeft.total > 0;

  const handleClick = () => {
    navigate(`/auction/${id}`);
  };

  const hoursStr = padZero(timeLeft.hours);
  const minutesStr = padZero(timeLeft.minutes);
  const secondsStr = padZero(timeLeft.seconds);

  return (
    <div className="auction-card" onClick={handleClick}>
      <img src={coverImage} alt={name} className="auction-card-image" />
      <div className="auction-card-body">
        <h3 className="auction-card-name">{name}</h3>
        <p className="auction-card-description">{description}</p>
        <div className="auction-card-price">
          <span className="price-label">当前价</span>
          <span className="price-value">¥{formatPrice(currentPrice)}</span>
        </div>
        <div className="countdown-container">
          <div className="countdown-unit">
            <FlipDigit value={hoursStr} urgent={isUrgent} />
            <span className="countdown-label">HH</span>
          </div>
          <div className="countdown-unit">
            <FlipDigit value={minutesStr} urgent={isUrgent} />
            <span className="countdown-label">MM</span>
          </div>
          <div className="countdown-unit">
            <FlipDigit value={secondsStr} urgent={isUrgent} />
            <span className="countdown-label">SS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
