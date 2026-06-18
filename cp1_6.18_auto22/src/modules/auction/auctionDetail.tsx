import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useSocket } from '../../App';

interface BidRecord {
  id: string;
  avatar: string;
  nickname: string;
  amount: number;
  timestamp: number;
}

interface AuctionDetailData {
  id: string;
  title: string;
  images: string[];
  currentPrice: number;
  startPrice: number;
  endTime: number;
  description: string;
  bidHistory: BidRecord[];
  isFavorite: boolean;
}

const ITEM_HEIGHT = 72;
const VISIBLE_COUNT = 20;

const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const socket = useSocket();

  const [detail, setDetail] = useState<AuctionDetailData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [bids, setBids] = useState<BidRecord[]>([]);
  const [error, setError] = useState('');
  const [bounceFav, setBounceFav] = useState(false);
  const bidListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch('/api/auctions/' + id)
      .then(res => res.json())
      .then((data: AuctionDetailData) => {
        setDetail(data);
        setBids(data.bidHistory);
        setIsFavorite(data.isFavorite);
        setBidAmount(String(data.currentPrice + 1));
      })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;
    const handler = (bid: BidRecord) => {
      setBids(prev => [...prev, bid]);
      setDetail(prev => prev ? { ...prev, currentPrice: bid.amount } : prev);
    };
    socket.on('new-bid', handler);
    return () => {
      socket.off('new-bid', handler);
    };
  }, [socket, id]);

  useEffect(() => {
    if (!detail?.images?.length) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % detail.images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [detail?.images?.length]);

  useEffect(() => {
    if (!detail?.endTime) return;
    const tick = () => {
      const diff = detail.endTime - Date.now();
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
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [detail?.endTime]);

  useEffect(() => {
    if (bidListRef.current && bids.length > 0) {
      bidListRef.current.scrollTop = bidListRef.current.scrollHeight;
    }
  }, [bids.length]);

  const handleFavorite = () => {
    setIsFavorite(prev => !prev);
    setBounceFav(true);
    setTimeout(() => setBounceFav(false), 500);
  };

  const handleSubmitBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!detail || isNaN(amount) || amount <= detail.currentPrice) {
      setError('出价必须高于当前最高价 ¥' + detail?.currentPrice.toLocaleString());
      return;
    }
    setError('');
    setIsSubmitting(true);
