import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUser, fetchActivityById } from '../api/events';
import type { User, Badge, JoinedEvent, Event } from '../api/events';
import { useAuth } from './main';

const ProgressRing: React.FC<{ hours: number; goal?: number }> = ({ hours, goal = 100 }) => {
  const [displayHours, setDisplayHours] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasAnimated = useRef(false);

  const radius = 80;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    hasAnimated.current = false;
    
    const targetProgress = Math.min((hours / goal) * 100, 100);
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progressRatio, 3);

      setDisplayHours(parseFloat((hours * easeOut).toFixed(1)));
      setProgress(targetProgress * easeOut);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    hasAnimated.current = true;
  }, [hours, goal]);

  return (
    <div className="progress-ring-container">
      <svg width="200" height="200" className="progress-ring">
        <circle
          className="ring-bg"
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#e8f5e9"
          strokeWidth={stroke}
        />
        <circle
          className="ring-progress"
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#2D6B3B"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2D6B3B" />
            <stop offset="100%" stopColor="#4CAF50" />
          </linearGradient>
        </defs>
      </svg>
      <div className="ring-content">
        <div className="ring-hours">{displayHours}</div>
        <div className="ring-label">志愿小时</div>
      </div>
    </div>
  );
};

const BadgeCard: React.FC<{ badge: Badge; onClick: () => void }> = ({ badge, onClick }) => {
  return (
    <div className="badge-card" onClick={onClick}>
      <div className="badge-inner">
        <div className="badge-front">
          <div className="badge-icon">{badge.icon}</div>
          <div className="badge-name">{badge.name}</div>
        </div>
        <div className="badge-back">
          <div className="badge-icon-back">{badge.icon}</div>
          <p className="badge-desc">{badge.description}</p>
        </div>
      </div>
    </div>
  );
};

const BadgeModal: React.FC<{ 
  badge: Badge | null; 
  onClose: () => void 
}> = ({ badge, onClose }) => {
  if (!badge) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="badge-modal-overlay" onClick={onClose}>
      <div className="badge-modal" onClick={e => e.stopPropagation()}>
        <div className="badge-modal-icon">{badge.icon}</div>
        <h3 className="badge-modal-title">{badge.name}</h3>
        <p className="badge-modal-desc">{badge.description}</p>
        <div className="badge-modal-date">
          获得时间：{formatDate(badge.earnedAt)}
        </div>
        <button className="badge-modal-close" onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  );
};

const CountdownCard: React.FC<{ event: Event }> = ({ event }) => {
  const navigate = useNavigate();
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const eventDate = new Date(event.dateTime).getTime();
    const now = Date.now();
    const diff = Math.max(0, eventDate - now);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setDaysLeft(days);
  }, [event.dateTime]);

  const getBackgroundColor = () => {
    const ratio = Math.min(daysLeft / 30, 1);
    const green = Math.floor(107 + (47 * (1 - ratio)));
    const red = Math.floor(45 + (160 * (1 - ratio)));
    return `rgb(${red}, ${green}, 59)`;
  };

  return (
    <div 
      className="countdown-card" 
      style={{ background: `linear-gradient(135deg, ${getBackgroundColor()} 0%, #2D6B3B 100%)` }}
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="countdown-days">
        <span className="days-number">{daysLeft}</span>
        <span className="days-label">天后开始</span>
      </div>
      <div className="countdown-info">
        <h4 className="countdown-title">{event.name}</h4>
        <p className="countdown-location">📍 {event.location}</p>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [user, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [joinedEvents, setJoinedEvents] = useState<Map<string, Event>>(new Map());

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }
    loadUserData();
  }, [authUser?.id]);

  const loadUserData = async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      const data = await fetchUser(authUser.id);
      setProfileUser(data);

      const eventMap = new Map<string, Event>();
      const upcomingEvents = data.joinedEvents.filter(
        e => new Date(e.eventDate) > new Date()
      );
      
      for (const je of upcomingEvents.slice(0, 3)) {
        try {
          const event = await fetchActivityById(je.eventId);
          eventMap.set(je.eventId, event);
        } catch (e) {
          console.error('获取活动详情失败', e);
        }
      }
      setJoinedEvents(eventMap);
    } catch (err) {
      console.error('加载用户数据失败', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedJoinedEvents = user?.joinedEvents
    .slice()
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()) || [];

  const upcomingCountdowns = Array.from(joinedEvents.values()).sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        <style>{profileStyles}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="empty-state">
          <p>请先登录</p>
        </div>
        <style>{profileStyles}</style>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{user.avatar}</div>
        <div className="profile-info">
          <h1 className="profile-name">{user.username}</h1>
          <p className="profile-bio">🌿 环保志愿者 · 让地球更美好</p>
        </div>
      </div>

      {upcomingCountdowns.length > 0 && (
        <div className="profile-section">
          <h2 className="section-title">⏰ 即将开始的活动</h2>
          <div className="countdown-grid">
            {upcomingCountdowns.map(event => (
              <CountdownCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      <div className="profile-stats">
        <div className="stat-card progress-stat">
          <h2 className="section-title">总志愿时长</h2>
          <ProgressRing hours={user.totalHours} goal={100} />
        </div>

        <div className="stat-card">
          <h2 className="section-title">获得徽章</h2>
          <div className="stat-number">{user.badges.length}</div>
          <div className="stat-label">枚徽章</div>
        </div>

        <div className="stat-card">
          <h2 className="section-title">参与活动</h2>
          <div className="stat-number">{user.joinedEvents.length}</div>
          <div className="stat-label">场活动</div>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="section-title">🏅 我的徽章</h2>
        {user.badges.length === 0 ? (
          <div className="empty-badges">
            <div className="empty-icon">🎖️</div>
            <p>暂无徽章，参与活动获取专属徽章吧！</p>
          </div>
        ) : (
          <div className="badges-grid">
            {user.badges.map(badge => (
              <BadgeCard 
                key={badge.id} 
                badge={badge} 
                onClick={() => setSelectedBadge(badge)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="profile-section">
        <h2 className="section-title">📋 参与活动记录</h2>
        {sortedJoinedEvents.length === 0 ? (
          <div className="empty-activities">
            <div className="empty-icon">📅</div>
            <p>还没有参与过活动，快去报名吧！</p>
          </div>
        ) : (
          <div className="activity-list">
            {sortedJoinedEvents.map(activity => (
              <div 
                key={activity.eventId} 
                className="activity-item"
                onClick={() => navigate(`/event/${activity.eventId}`)}
              >
                <div className="activity-icon">🌿</div>
                <div className="activity-info">
                  <h4 className="activity-name">{activity.eventName}</h4>
                  <p className="activity-date">
                    {new Date(activity.eventDate).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="activity-hours">
                  <span className="hours-number">{activity.hours}</span>
                  <span className="hours-unit">小时</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BadgeModal 
        badge={selectedBadge} 
        onClose={() => setSelectedBadge(null)} 
      />

      <style>{profileStyles}</style>
    </div>
  );
};

const profileStyles = `
  .profile-page {
    width: 100%;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 32px;
    padding: 24px;
    background: linear-gradient(135deg, #2D6B3B 0%, #1e4a29 100%);
    border-radius: 16px;
    color: #fff;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
  }

  .profile-name {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  .profile-bio {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .profile-stats {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 20px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    text-align: center;
  }

  .stat-card.progress-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .section-title {
    font-size: 1rem;
    color: #333;
    margin-bottom: 16px;
    font-weight: 600;
  }

  .progress-ring-container {
    position: relative;
    width: 200px;
    height: 200px;
  }

  .progress-ring {
    transform: rotate(-90deg);
  }

  .ring-content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .ring-hours {
    font-size: 2rem;
    font-weight: 700;
    color: #2D6B3B;
  }

  .ring-label {
    font-size: 0.85rem;
    color: #666;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2D6B3B;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #666;
  }

  .profile-section {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 24px;
  }

  .countdown-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .countdown-card {
    border-radius: 12px;
    padding: 20px;
    color: #fff;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .countdown-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .countdown-days {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;
  }

  .days-number {
    font-size: 2.5rem;
    font-weight: 700;
  }

  .days-label {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .countdown-title {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .countdown-location {
    font-size: 0.8rem;
    opacity: 0.9;
  }

  .badges-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .badge-card {
    aspect-ratio: 1;
    cursor: pointer;
    perspective: 1000px;
  }

  .badge-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }

  .badge-card:hover .badge-inner {
    transform: rotateY(180deg);
  }

  .badge-front,
  .badge-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px;
  }

  .badge-front {
    background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e9 100%);
    border: 2px solid #c8e6c9;
  }

  .badge-back {
    background: linear-gradient(135deg, #2D6B3B 0%, #1e4a29 100%);
    transform: rotateY(180deg);
    color: #fff;
  }

  .badge-icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .badge-icon-back {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }

  .badge-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: #2D6B3B;
    text-align: center;
  }

  .badge-desc {
    font-size: 0.7rem;
    text-align: center;
    line-height: 1.4;
  }

  .empty-badges,
  .empty-activities {
    text-align: center;
    padding: 40px 20px;
    color: #999;
  }

  .empty-icon {
    font-size: 2.5rem;
    margin-bottom: 12px;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .activity-item:hover {
    background: #f0f9f0;
  }

  .activity-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #e8f5e9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .activity-info {
    flex: 1;
  }

  .activity-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 2px;
  }

  .activity-date {
    font-size: 0.8rem;
    color: #999;
  }

  .activity-hours {
    text-align: right;
    flex-shrink: 0;
  }

  .hours-number {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2D6B3B;
  }

  .hours-unit {
    font-size: 0.75rem;
    color: #999;
    margin-left: 2px;
  }

  .badge-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
    padding: 20px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .badge-modal {
    background: #fff;
    border-radius: 20px;
    padding: 32px;
    max-width: 360px;
    width: 100%;
    text-align: center;
    animation: scaleIn 0.25s ease;
  }

  @keyframes scaleIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .badge-modal-icon {
    font-size: 4rem;
    margin-bottom: 16px;
  }

  .badge-modal-title {
    font-size: 1.25rem;
    color: #2D6B3B;
    margin-bottom: 12px;
  }

  .badge-modal-desc {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
  }

  .badge-modal-date {
    font-size: 0.8rem;
    color: #999;
    margin-bottom: 24px;
  }

  .badge-modal-close {
    background: linear-gradient(135deg, #2D6B3B 0%, #1e4a29 100%);
    color: #fff;
    border: none;
    padding: 10px 32px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: transform 0.2s;
  }

  .badge-modal-close:hover {
    transform: translateY(-1px);
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    gap: 16px;
    color: #666;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e0e0e0;
    border-top-color: #2D6B3B;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #999;
  }

  @media (max-width: 768px) {
    .profile-header {
      padding: 20px;
    }

    .profile-avatar {
      width: 60px;
      height: 60px;
      font-size: 2rem;
    }

    .profile-name {
      font-size: 1.25rem;
    }

    .profile-stats {
      grid-template-columns: 1fr;
    }

    .badges-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .countdown-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .profile-stats {
      grid-template-columns: 1fr 1fr;
    }

    .stat-card.progress-stat {
      grid-column: span 2;
    }

    .badges-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
`;

export default Profile;
