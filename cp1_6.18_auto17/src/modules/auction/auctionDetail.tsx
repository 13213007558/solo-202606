import { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { useWebSocket } from '../../hooks/useWebSocket';
import { SocketContext } from '../../App';

interface Bid {
  id: string;
  itemId: string;
  userId: string;
  username: string;
  amount: number;
  timestamp: number;
}

interface AuctionItem {
  id: string;
  name: string;
  description: string;
  images: string[];
  currentPrice: number;
  startPrice: number;
  endTime: number;
  status: string;
  ownerId: string;
  ownerName: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const calculateTimeLeft = (endTime: number): TimeLeft => {
  const total = endTime - Date.now();
  if (total <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, total };
};

const formatPrice = (price: number): string => price.toLocaleString('zh-CN');
const padZero = (num: number): string => num.toString().padStart(2, '0');
const formatTime = (ts: number): string => {
  const d = new Date(ts);
  return `${padZero(d.getHours())}:${padZero(d.getMinutes())}:${padZero(d.getSeconds())}`;
};

const FlipDigit = ({ value, urgent }: { value: string; urgent: boolean }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevRef = useRef(value);
  useEffect(() => {
    if (prevRef.current !== value) {
      setIsFlipping(true);
      const t = setTimeout(() => {
        setDisplayValue(value);
        setIsFlipping(false);
        prevRef.current = value;
      }, 300);
      return () => clearTimeout(t);
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

const HeartIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

interface BidItemProps {
  bid: Bid;
  isNewest: boolean;
  index: number;
}

const BidItem = ({ bid, isNewest, index }: BidItemProps) => {
  const { ref, inView } = useInView({
    rootMargin: '200px',
    initialInView: index < 20,
  });
  if (!inView) return <div ref={ref} className="bid-sentinel" />;
  return (
    <div ref={ref} className={`bid-item ${isNewest ? 'newest' : ''}`}>
      <div className="bid-user">
        <div className="bid-avatar">{bid.username.charAt(0).toUpperCase()}</div>
        <span className="bid-username">{bid.username}</span>
      </div>
      <div className="bid-amount-time">
        <span className="bid-amount">¥{formatPrice(bid.amount)}</span>
        <span className="bid-time">{formatTime(bid.timestamp)}</span>
      </div>
    </div>
  );
};

export default function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const socket = useContext(SocketContext);
  const { onMessage } = useWebSocket();
  const [item, setItem] = useState<AuctionItem | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bounceAnim, setBounceAnim] = useState(false);
  const [newestBidId, setNewestBidId] = useState<string | null>(null);
  const bidListRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [itemRes, bidsRes] = await Promise.all([
          axios.get(`/api/items/${id}`),
          axios.get(`/api/bids?itemId=${id}`),
        ]);
        setItem(itemRes.data);
        const sortedBids = (bidsRes.data || []).sort((a: Bid, b: Bid) => b.timestamp - a.timestamp);
        setBids(sortedBids);
        setBidAmount((itemRes.data.currentPrice + 10).toString());
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!item) return;
    setTimeLeft(calculateTimeLeft(item.endTime));
    const t = setInterval(() => setTimeLeft(calculateTimeLeft(item.endTime)), 1000);
    return () => clearInterval(t);
  }, [item]);

  useEffect(() => {
    if (!item?.images?.length) return;
    const t = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % item.images.length);
    }, 4000);
    return () => clearInterval(t);
  }, [item?.images?.length]);

  useEffect(() => {
    const cleanup = onMessage<Bid>('new-bid', (newBid) => {
      if (newBid.itemId !== id) return;
      setBids((prev) => {
        const exists = prev.find((b) => b.id === newBid.id);
        if (exists) return prev;
        return [newBid, ...prev];
      });
      setNewestBidId(newBid.id);
      setItem((prev) => prev ? { ...prev, currentPrice: newBid.amount } : prev);
      setTimeout(() => setNewestBidId(null), 2000);
    });
    return cleanup;
  }, [onMessage, id]);

  const handleBid = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }
    const amount = parseInt(bidAmount);
    if (!amount || amount <= (item?.currentPrice || 0)) {
      alert('出价必须高于当前价格');
      return;
    }
    setBidding(true);
    try {
      const res = await axios.post('/api/bids', {
        itemId: id,
        userId: user.id,
        username: user.username,
        amount,
      });
      const newBid: Bid = res.data;
      setBids((prev) => [newBid, ...prev]);
      setNewestBidId(newBid.id);
      setItem((prev) => prev ? { ...prev, currentPrice: amount } : prev);
      setBidAmount((amount + 10).toString());
      setTimeout(() => setNewestBidId(null), 2000);
      setTimeout(() => {
        if (bidListRef.current) bidListRef.current.scrollTop = 0;
      }, 100);
    } catch (err: any) {
      alert(err.response?.data?.error || '出价失败');
    } finally {
      setBidding(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }
    setBounceAnim(true);
    setTimeout(() => setBounceAnim(false), 600);
    setIsFavorite((prev) => !prev);
    try {
      await axios.post('/api/favorites', { userId: user.id, itemId: id });
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading" />
      </div>
    );
  }

  if (!item) {
    return <div className="container"><div className="empty-state">商品不存在</div></div>;
  }

  const isUrgent = timeLeft.total < 3600000 && timeLeft.total > 0;

  return (
    <div className="detail-container">
      <div className="detail-grid">
        <div style={{ position: 'relative' }}>
          <div className="carousel">
            {item.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${item.name} ${i + 1}`}
                className={`carousel-image ${i === carouselIndex ? 'active' : ''}`}
              />
            ))}
            <div className="carousel-dots">
              {item.images.map((_, i) => (
                <button
                  key={i}
                  className={`carousel-dot ${i === carouselIndex ? 'active' : ''}`}
                  onClick={() => setCarouselIndex(i)}
                />
              ))}
            </div>
          </div>
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''} ${bounceAnim ? 'bounce' : ''}`}
            onClick={toggleFavorite}
          >
            <HeartIcon />
          </button>
        </div>
        <div className="detail-info">
          <h1 className="detail-title">{item.name}</h1>
          <div className="detail-price">
            <div className="detail-price-label">当前出价</div>
            <div className="detail-price-value">¥{formatPrice(item.currentPrice)}</div>
          </div>
          <p className="detail-description">{item.description}</p>
          <div className="detail-countdown">
            <div className="detail-countdown-title">距拍卖结束</div>
            <div className="countdown-container">
              <div className="countdown-unit">
                <FlipDigit value={padZero(timeLeft.hours)} urgent={isUrgent} />
                <span className="countdown-label">HH</span>
              </div>
              <div className="countdown-unit">
                <FlipDigit value={padZero(timeLeft.minutes)} urgent={isUrgent} />
                <span className="countdown-label">MM</span>
              </div>
              <div className="countdown-unit">
                <FlipDigit value={padZero(timeLeft.seconds)} urgent={isUrgent} />
                <span className="countdown-label">SS</span>
              </div>
            </div>
          </div>
          <div className="bid-section">
            <div className="bid-input-group">
              <input
                type="number"
                className="bid-input"
                placeholder="输入出价金额"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={item.currentPrice + 1}
              />
              <button
                className="btn btn-primary"
                onClick={handleBid}
                disabled={bidding || timeLeft.total <= 0}
              >
                {bidding ? <span className="loading" /> : '立即出价'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bid-history-container">
        <h3 className="bid-history-title">出价历史（{bids.length}条）</h3>
        <div className="bid-list" ref={bidListRef}>
          {bids.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>暂无出价记录</div>
          ) : (
            bids.map((bid, idx) => (
              <BidItem
                key={bid.id}
                bid={bid}
                isNewest={bid.id === newestBidId}
                index={idx}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
