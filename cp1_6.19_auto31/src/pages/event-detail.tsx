import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchActivityById, joinActivity, awardActivity } from '../api/events';
import type { Event } from '../api/events';
import { useAuth } from './main';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshNotifications } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardHours, setAwardHours] = useState(3);
  const [awardBadges, setAwardBadges] = useState(true);
  const [awarding, setAwarding] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchActivityById(id);
      setEvent(data);
    } catch (err) {
      console.error('加载活动详情失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!event) return;

    try {
      await joinActivity(event.id, user.id);
      loadEvent();
      refreshNotifications();
    } catch (err: any) {
      alert(err.response?.data?.error || '报名失败');
    }
  };

  const handleAward = async () => {
    if (!event || !user) return;
    
    setAwarding(true);
    try {
      const badges = awardBadges ? event.badges : [];
      await awardActivity(event.id, {
        hours: awardHours,
        badges,
        creatorId: user.id,
      });
      loadEvent();
      refreshNotifications();
      setShowAwardModal(false);
      alert('奖励发放成功！');
    } catch (err: any) {
      alert(err.response?.data?.error || '发放失败');
    } finally {
      setAwarding(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const isCreator = user && event?.creatorId === user.id;
  const hasJoined = user && event?.participants.some(p => p.userId === user.id);
  const isFull = event && event.currentParticipants >= event.maxParticipants;
  const isEnded = event?.status === 'ended';

  if (loading) {
    return (
      <div className="event-detail">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        <style>{detailStyles}</style>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-detail">
        <div className="empty-state">
          <p>活动不存在</p>
        </div>
        <style>{detailStyles}</style>
      </div>
    );
  }

  return (
    <div className="event-detail">
      <div className="detail-hero">
        <img src={event.image} alt={event.name} className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badges">
            {isEnded && <span className="hero-badge ended">已结束</span>}
            {!isEnded && isFull && <span className="hero-badge full">已满员</span>}
            {!isEnded && !isFull && <span className="hero-badge upcoming">报名中</span>}
          </div>
          <h1 className="hero-title">{event.name}</h1>
          <div className="hero-meta">
            <span className="hero-creator">
              发起者：{event.creatorName}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-main">
          <div className="detail-section">
            <h2 className="detail-section-title">活动详情</h2>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span className="info-icon">📅</span>
                <div>
                  <div className="info-label">活动日期</div>
                  <div className="info-value">{formatDate(event.dateTime)}</div>
                </div>
              </div>
              <div className="detail-info-item">
                <span className="info-icon">🕐</span>
                <div>
                  <div className="info-label">开始时间</div>
                  <div className="info-value">{formatTime(event.dateTime)}</div>
                </div>
              </div>
              <div className="detail-info-item">
                <span className="info-icon">📍</span>
                <div>
                  <div className="info-label">活动地点</div>
                  <div className="info-value">{event.location}</div>
                </div>
              </div>
              <div className="detail-info-item">
                <span className="info-icon">👥</span>
                <div>
                  <div className="info-label">参与人数</div>
                  <div className="info-value">{event.currentParticipants} / {event.maxParticipants}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2 className="detail-section-title">活动介绍</h2>
            <p className="detail-description">{event.description}</p>
          </div>

          {event.badges.length > 0 && (
            <div className="detail-section">
              <h2 className="detail-section-title">活动徽章</h2>
              <div className="event-badges">
                {event.badges.map((badge, index) => (
                  <div key={index} className="event-badge-item">
                    <span className="badge-icon">{badge.icon}</span>
                    <div className="badge-info">
                      <div className="badge-name">{badge.name}</div>
                      <div className="badge-desc">{badge.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">报名参与</h3>
            <div className="participation-progress">
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                />
              </div>
              <div className="progress-text">
                已报名 {event.currentParticipants} 人 / 上限 {event.maxParticipants} 人
              </div>
            </div>

            {user ? (
              <>
                {isEnded ? (
                  <button className="action-btn disabled" disabled>
                    活动已结束
                  </button>
                ) : hasJoined ? (
                  <button className="action-btn joined" disabled>
                    ✓ 已报名
                  </button>
                ) : isFull ? (
                  <button className="action-btn full" disabled>
                    已满员
                  </button>
                ) : (
                  <button className="action-btn primary" onClick={handleJoin}>
                    立即报名
                  </button>
                )}

                {isCreator && !isEnded && (
                  <button 
                    className="action-btn secondary"
                    onClick={() => setShowAwardModal(true)}
                  >
                    发放活动奖励
                  </button>
                )}
              </>
            ) : (
              <button className="action-btn primary" onClick={() => navigate('/login')}>
                登录后报名
              </button>
            )}
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">
              参与者 ({event.participants.length})
            </h3>
            {event.participants.length === 0 ? (
              <p className="empty-participants">暂无参与者</p>
            ) : (
              <div className="participants-list">
                {event.participants.map(p => (
                  <div key={p.userId} className="participant-item">
                    <span className="participant-avatar">{p.avatar}</span>
                    <span className="participant-name">{p.username}</span>
                    {p.hours !== undefined && p.hours > 0 && (
                      <span className="participant-hours">{p.hours}h</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAwardModal && (
        <div className="modal-overlay" onClick={() => setShowAwardModal(false)}>
          <div className="modal-content award-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>发放活动奖励</h2>
              <button className="close-btn" onClick={() => setShowAwardModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="award-hint">
                将向 {event.participants.length} 位参与者发放以下奖励
              </p>
              
              <div className="form-group">
                <label>志愿时长（小时）</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={awardHours}
                  onChange={e => setAwardHours(parseFloat(e.target.value) || 0)}
                />
              </div>

              {event.badges.length > 0 && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={awardBadges}
                      onChange={e => setAwardBadges(e.target.checked)}
                    />
                    发放活动徽章
                  </label>
                  <div className="badge-preview">
                    {event.badges.map((badge, index) => (
                      <span key={index} className="badge-preview-item">
                        {badge.icon} {badge.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowAwardModal(false)}
                >
                  取消
                </button>
                <button 
                  className="submit-btn" 
                  onClick={handleAward}
                  disabled={awarding}
                >
                  {awarding ? '发放中...' : '确认发放'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{detailStyles}</style>
    </div>
  );
};

const detailStyles = `
  .event-detail {
    width: 100%;
  }

  .detail-hero {
    position: relative;
    height: 340px;
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 28px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }

  .hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background: 
      linear-gradient(135deg, rgba(45, 107, 59, 0.4) 0%, rgba(212, 167, 106, 0.15) 50%, transparent 100%),
      linear-gradient(to bottom, transparent 25%, rgba(0, 0, 0, 0.78) 100%);
  }

  .hero-content {
    position: absolute;
    bottom: 24px;
    left: 24px;
    right: 24px;
    color: #fff;
  }

  .hero-badges {
    margin-bottom: 12px;
    display: flex;
    gap: 8px;
  }

  .hero-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .hero-badge.ended {
    background: #999;
  }

  .hero-badge.full {
    background: #e74c3c;
  }

  .hero-badge.upcoming {
    background: #2D6B3B;
  }

  .hero-title {
    font-size: 1.75rem;
    margin-bottom: 8px;
  }

  .hero-meta {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .detail-body {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }

  .detail-main {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .detail-section {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .detail-section-title {
    font-size: 1.1rem;
    color: #2D6B3B;
    margin-bottom: 16px;
    font-weight: 600;
  }

  .detail-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .detail-info-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .info-icon {
    font-size: 1.2rem;
    width: 36px;
    height: 36px;
    background: #e8f5e9;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .info-label {
    font-size: 0.8rem;
    color: #999;
    margin-bottom: 2px;
  }

  .info-value {
    font-size: 0.95rem;
    color: #333;
    font-weight: 500;
  }

  .detail-description {
    color: #555;
    line-height: 1.8;
    font-size: 0.95rem;
  }

  .event-badges {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .event-badge-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 16px;
    background: #f9f9f9;
    border-radius: 10px;
  }

  .event-badge-item .badge-icon {
    font-size: 1.5rem;
  }

  .event-badge-item .badge-info {
    flex: 1;
  }

  .event-badge-item .badge-name {
    font-size: 0.95rem;
    font-weight: 500;
    color: #333;
  }

  .event-badge-item .badge-desc {
    font-size: 0.8rem;
    color: #999;
  }

  .detail-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .sidebar-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .sidebar-title {
    font-size: 1rem;
    color: #2D6B3B;
    margin-bottom: 16px;
    font-weight: 600;
  }

  .participation-progress {
    margin-bottom: 16px;
  }

  .progress-bar-bg {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #2D6B3B, #4CAF50);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.8rem;
    color: #666;
    text-align: center;
  }

  .action-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 25px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 10px;
  }

  .action-btn:last-child {
    margin-bottom: 0;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #2D6B3B 0%, #1e4a29 100%);
    color: #fff;
  }

  .action-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(45, 107, 59, 0.4);
  }

  .action-btn.secondary {
    background: #fff;
    color: #2D6B3B;
    border: 2px solid #2D6B3B;
  }

  .action-btn.secondary:hover {
    background: #f0f9f0;
  }

  .action-btn.joined {
    background: #95a5a6;
    color: #fff;
    cursor: default;
  }

  .action-btn.full,
  .action-btn.disabled {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }

  .participants-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
  }

  .participant-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .participant-item:hover {
    background: #f5f5f5;
  }

  .participant-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e8f5e9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  .participant-name {
    flex: 1;
    font-size: 0.9rem;
    color: #333;
  }

  .participant-hours {
    font-size: 0.8rem;
    color: #2D6B3B;
    font-weight: 500;
    background: #e8f5e9;
    padding: 2px 8px;
    border-radius: 10px;
  }

  .empty-participants {
    text-align: center;
    color: #999;
    font-size: 0.85rem;
    padding: 20px;
  }

  .modal-overlay {
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

  .modal-content {
    background: #fff;
    border-radius: 16px;
    max-width: 480px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: scaleIn 0.2s ease;
  }

  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #eee;
  }

  .modal-header h2 {
    font-size: 1.25rem;
    color: #2D6B3B;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #999;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
  }

  .close-btn:hover {
    background: #f5f5f5;
  }

  .modal-body {
    padding: 24px;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    color: #333;
  }

  .form-group input[type="number"],
  .form-group input[type="text"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .form-group input:focus {
    border-color: #2D6B3B;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .badge-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .badge-preview-item {
    background: #e8f5e9;
    color: #2D6B3B;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.8rem;
  }

  .award-hint {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 20px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }

  .cancel-btn {
    padding: 10px 20px;
    border: 1px solid #ddd;
    background: #fff;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #666;
    transition: background 0.2s;
  }

  .cancel-btn:hover {
    background: #f5f5f5;
  }

  .submit-btn {
    padding: 10px 24px;
    background: linear-gradient(135deg, #2D6B3B 0%, #1e4a29 100%);
    color: #fff;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: transform 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    .detail-hero {
      height: 200px;
    }

    .hero-title {
      font-size: 1.25rem;
    }

    .detail-body {
      grid-template-columns: 1fr;
    }

    .detail-info-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default EventDetail;
