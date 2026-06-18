import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './auctionCard.css';

interface AuctionItem {
  id: string;
  name: string;
  description: string;
  startPrice: number;
  currentPrice: number;
  endTime: number;
  images: string[];
  status: 'pending' | 'active' | 'ended';
  creatorName: string;
  creatorId: string;
  createdAt: number;
}

interface FlipDigitProps {
  value: number;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setPrevValue(prevValueRef.current);
      setIsFlipping(true);
      prevValueRef.current = value;

      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [value]);

  const formatValue = (v: number) => v.toString().padStart(2, '0');

  return (
    <div className="flip-digit-wrapper">
      <div className="flip-digit-card">
        <div className="flip-digit-top">
          <span>{formatValue(displayValue)}</span>
        </div>
        <div className="flip-digit-bottom">
          <span>{formatValue(prevValue)}</span>
        </div>
        <div className={`flip-digit-front-top ${isFlipping ? 'flipping' : ''}`}>
          <span>{formatValue(prevValue)}</span>
        </div>
        <div className={`flip-digit-front-bottom ${isFlipping ? 'flipping' : ''}`}>
          <span>{formatValue(displayValue)}</span>
        </div>
      </div>
    </div>
  );
};

interface AuctionCardProps {
  item: AuctionItem;
}

const AuctionCard: React.FC<AuctionCardProps> = ({ item }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLeaving, setIsLeaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = item.endTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [item.endTime]);

  const handleClick = () => {
    setIsLeaving(true);
    setTimeout(() => {
      navigate(`/item/${item.id}`);
    }, 300);
  };

  const isMyAuction = user && item.creatorId === user.id;

  return (
    <div
      className={`auction-card ${isLeaving ? 'card-leaving' : ''}`}
      onClick={handleClick}
    >
      <div className="auction-card-image-container">
        <img
          src={item.images[0] || ''}
          alt={item.name}
          className="auction-card-image"
        />
        {isMyAuction && (
          <div className="my-auction-badge">我的拍卖品</div>
        )}
      </div>
      <div className="auction-card-content">
        <h3 className="auction-card-title">{item.name}</h3>
        <div className="auction-card-price">
          <span className="current-price-label">当前出价</span>
          <span className="current-price-value">¥{item.currentPrice}</span>
        </div>
        <div className="countdown-container">
          <div className="flip-digit-group">
            <FlipDigit value={timeLeft.days} />
            <span className="flip-digit-label">天</span>
          </div>
          <div className="flip-digit-separator">:</div>
          <div className="flip-digit-group">
            <FlipDigit value={timeLeft.hours} />
            <span className="flip-digit-label">时</span>
          </div>
          <div className="flip-digit-separator">:</div>
          <div className="flip-digit-group">
            <FlipDigit value={timeLeft.minutes} />
            <span className="flip-digit-label">分</span>
          </div>
          <div className="flip-digit-separator">:</div>
          <div className="flip-digit-group">
            <FlipDigit value={timeLeft.seconds} />
            <span className="flip-digit-label">秒</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
