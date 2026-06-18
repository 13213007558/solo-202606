import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import type { Donation } from '../types';

interface Props {
  activityId: string;
  onNewDonation?: (donation: Donation) => void;
}

type ViewMode = 'grid' | 'masonry';

function getCardTierClass(amount: number): string {
  if (amount >= 100) return 'donation-card-tier-100';
  if (amount >= 50) return 'donation-card-tier-50';
  if (amount >= 10) return 'donation-card-tier-10';
  return 'donation-card-tier-default';
}

function DonationCard({ donation, isNew, viewMode }: { donation: Donation; isNew: boolean; viewMode: ViewMode }) {
  const tierClass = getCardTierClass(donation.amount);
  const style: React.CSSProperties = isNew ? {} : { animation: 'none', opacity: 1, transform: 'none' };

  return (
    <div
      className={`donation-card ${tierClass}`}
      style={style}
    >
      <div className="donor-header">
        <div className="donor-avatar">
          <img src={donation.avatar} alt={donation.userName} />
        </div>
        <div className="donor-info-card">
          <div className="donor-name">{donation.userName}</div>
          <div className="donation-amount">¥{donation.amount}</div>
        </div>
      </div>
      {donation.message && (
        <div className={`donation-message ${viewMode === 'grid' ? 'donation-message-truncated' : ''}`}>
          {donation.message}
        </div>
      )}
    </div>
  );
}

function DonationWall({ activityId, onNewDonation }: Props) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const newIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    newIdsRef.current = new Set();

    axios.get(`/api/activity/${activityId}/donations`)
      .then((res) => {
        if (mounted) {
          setDonations(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    const socket = io({ transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-activity', activityId);
    });

    socket.on('new-donation', (donation: Donation) => {
      if (!mounted) return;
      newIdsRef.current.add(donation.id);
      setDonations((prev) => {
        if (prev.some((d) => d.id === donation.id)) return prev;
        return [donation, ...prev];
      });
      onNewDonation?.(donation);

      setTimeout(() => {
        newIdsRef.current.delete(donation.id);
      }, 700);
    });

    return () => {
      mounted = false;
      socket.emit('leave-activity', activityId);
      socket.disconnect();
    };
  }, [activityId, onNewDonation]);

  const wallClass = viewMode === 'grid' ? 'donation-wall-grid' : 'donation-wall-masonry';

  return (
    <div className="wall-section">
      <div className="wall-header">
        <h3 className="section-title">💖 爱心墙 ({donations.length})</h3>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            网格视图
          </button>
          <button
            className={`view-btn ${viewMode === 'masonry' ? 'active' : ''}`}
            onClick={() => setViewMode('masonry')}
          >
            瀑布流
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-wall">
          <div className="empty-wall-icon">⏳</div>
          <div className="empty-wall-text">加载中...</div>
        </div>
      ) : donations.length === 0 ? (
        <div className="empty-wall">
          <div className="empty-wall-icon">🌱</div>
          <div className="empty-wall-text">还没有捐赠，快来成为第一个献爱心的人吧！</div>
        </div>
      ) : (
        <div className={wallClass}>
          {donations.map((donation) => (
            <DonationCard
              key={donation.id}
              donation={donation}
              isNew={newIdsRef.current.has(donation.id)}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DonationWall;
