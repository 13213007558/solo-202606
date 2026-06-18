import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useSocket } from '../../contexts/SocketContext';

interface BidRecord {
  id: string;
  avatar: string;
  nickname: string;
  amount: number;
  time: string;
}

interface AuctionDetail {
  id: string;
  title: string;
  images: string[];
  currentPrice: number;
  startPrice: number;
  endTime: string;
  description: string;
  bidHistory: BidRecord[];
  isFavorite: boolean;
}

const ITEM_HEIGHT = 72;
const VISIBLE_COUNT = 20;

const AuctionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const socket = useSocket();

  const [detail, setDetail] = useState<AuctionDetail | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [bids, setBids] = useState<BidRecord[]>([]);
  const [scrollTop, setScrollTop] = useState(0);
  const bidListRef = useRef<HTMLDivElement>(null);
  const [bounceFav, setBounceFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/auctions/${id}`)
      .then(res => res.json())
      .then((data: AuctionDetail) => {
        setDetail(data);
        setBids(data.bidHistory);
        setIsFavorite(data.isFavorite);
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
    return () => { socket.off('new-bid', handler); };
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
      const diff = new Date(detail.endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
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
