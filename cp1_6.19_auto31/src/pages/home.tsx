import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchActivities, createActivity, joinActivity } from '../api/events';
import type { Event } from '../api/events';
import { useAuth } from './main';

const CircularProgress: React.FC<{ current: number; max: number; size?: number }> = ({ 
  current, 
  max, 
  size = 48 
}) => {
  const percentage = Math.min((current / max) * 100, 100);
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isFull = current >= max;

  return (
    <svg width={size} height={size} className="circular-progress">
      <circle
        className="progress-bg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e0e0e0"
        strokeWidth="3"
      />
      <circle
        className="progress-bar"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isFull ? '#e74c3c' : '#2D6B3B'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2 + 4}
        textAnchor="middle"
        fontSize="11"
        fontWeight="500"
        fill="#333"
      >
        {current}/{max}
      </text>
    </svg>
  );
};

const EventCard: React.FC<{ event: Event; onJoin?: () => void }> = ({ event, onJoin }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFull = event.currentParticipants >= event.maxParticipants;
  const isDatePassed = new Date(event.dateTime) < new Date();
  const isEnded = event.status === 'ended' || isDatePassed;
  const isDisabled = isFull || isEnded;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const hasJoined = user && event.participants.some(p => p.userId === user.id);

  return (
    <div 
      className={`event-card ${isDisabled ? 'disabled' : ''}`}
      onClick={() => navigate(`/event/${event.id}`)}
    >
      <div className="card-image">
        <img src={event.image} alt={event.name} loading="lazy" />
        <div className="card-image-overlay" />
        {isEnded && <div className="card-badge ended">已结束</div>}
        {isFull && !isEnded && <div className="card-badge full">已满员</div>}
        <div className="card-creator">
          <span className="creator-avatar">{event.creatorName.charAt(0)}</span>
          <span className="creator-name">{event.creatorName}</span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{event.name}</h3>
        
        <div className="card-info">
          <div className="info-item">
            <span className="info-icon">📅</span>
            <span>{formatDate(event.dateTime)}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🕐</span>
            <span>{formatTime(event.dateTime)}</span>
          </div>
          <div className="info-item">
            <span className="info-icon">📍</span>
            <span>{event.location}</span>
          </div>
        </div>

        <p className="card-description">{event.description}</p>

        <div className="card-footer">
          <div className="progress-section">
            <CircularProgress current={event.currentParticipants} max={event.maxParticipants} />
            <span className="progress-label">参与人数</span>
          </div>
          
          {user && !isEnded && (
            <button 
              className={`join-btn ${hasJoined ? 'joined' : ''} ${isFull ? 'full' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!hasJoined && !isFull && onJoin) {
                  onJoin();
                }
              }}
              disabled={hasJoined || isFull}
            >
              {hasJoined ? '已报名' : isFull ? '已满员' : '立即报名'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateEventModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  onCreated: () => void;
}> = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    dateTime: '',
    description: '',
    maxParticipants: 20,
    badges: [{ name: '', icon: '🌿', description: '' }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const validBadges = formData.badges.filter(b => b.name.trim());
      await createActivity({
        name: formData.name,
        location: formData.location,
        dateTime: formData.dateTime,
        description: formData.description,
        maxParticipants: formData.maxParticipants,
        creatorId: user.id,
        creatorName: user.username,
        badges: validBadges.length > 0 ? validBadges : undefined,
      });
      onCreated();
      onClose();
      setFormData({
        name: '',
        location: '',
        dateTime: '',
        description: '',
        maxParticipants: 20,
        badges: [{ name: '', icon: '🌿', description: '' }],
      });
    } catch (err: any) {
      setError(err.response?.data?.error || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const addBadge = () => {
    setFormData(prev => ({
      ...prev,
      badges: [...prev.badges, { name: '', icon: '🌿', description: '' }]
    }));
  };

  const updateBadge = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      badges: prev.badges.map((b, i) => i === index ? { ...b, [field]: value } : b)
    }));
  };

  const removeBadge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      badges: prev.badges.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-event-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>创建环保活动</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>活动名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="如：春季植树活动"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>活动地点 *</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="如：城市森林公园"
                required
              />
            </div>
            <div className="form-group">
              <label>招募人数上限 *</label>
              <input
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={e => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>活动时间 *</label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={e => setFormData(prev => ({ ...prev, dateTime: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>活动描述 *</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="请详细描述活动内容、注意事项等..."
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <div className="badge-section-header">
              <label>活动徽章（可选）</label>
              <button type="button" className="add-badge-btn" onClick={addBadge}>
                + 添加徽章
              </button>
            </div>
            {formData.badges.map((badge, index) => (
              <div key={index} className="badge-input-row">
                <input
                  type="text"
                  placeholder="徽章名称"
                  value={badge.name}
                  onChange={e => updateBadge(index, 'name', e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="text"
                  placeholder="图标emoji"
                  value={badge.icon}
                  onChange={e => updateBadge(index, 'icon', e.target.value)}
                  style={{ flex: 1, maxWidth: 80 }}
                />
                <input
                  type="text"
                  placeholder="徽章描述"
                  value={badge.description}
                  onChange={e => updateBadge(index, 'description', e.target.value)}
                  style={{ flex: 3 }}
                />
                {formData.badges.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-badge-btn"
                    onClick={() => removeBadge(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? '创建中...' : '创建活动'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, refreshNotifications } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, [filterStatus]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await fetchActivities(
        filterStatus === 'all' ? undefined : filterStatus,
        searchQuery || undefined
      );
      setEvents(data);
    } catch (err) {
      console.error('加载活动失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadEvents();
  };

  const handleJoin = async (eventId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await joinActivity(eventId, user.id);
      loadEvents();
      refreshNotifications();
    } catch (err: any) {
      alert(err.response?.data?.error || '报名失败');
    }
  };

  const handleCreateClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowCreateModal(true);
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    const keyword = searchQuery.toLowerCase();
    return events.filter(
      e => e.name.toLowerCase().includes(keyword) || e.location.toLowerCase().includes(keyword)
    );
  }, [events, searchQuery]);

  return (
    <div className="home-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">🌍 环保活动墙</h1>
          <p className="page-subtitle">发现身边的环保活动，一起守护我们的地球</p>
        </div>
        <button className="create-event-btn" onClick={handleCreateClick}>
          <span>+</span> 创建活动
        </button>
      </div>

      <div className="filter-bar">
        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="搜索活动名称或地点..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        <div className="filter-tabs">
          {[
            { value: 'all', label: '全部' },
            { value: 'upcoming', label: '即将开始' },
            { value: 'ended', label: '已结束' },
          ].map(tab => (
            <button
              key={tab.value}
              className={`filter-tab ${filterStatus === tab.value ? 'active' : ''}`}
              onClick={() => setFilterStatus(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载活动中...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌱</div>
          <p>暂无活动，快来创建第一个环保活动吧！</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onJoin={() => handleJoin(event.id)}
            />
          ))}
        </div>
      )}

      <CreateEventModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onCreated={loadEvents}
      />

      <style>{`
        .home-page {
          width: 100%;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 1.75rem;
          color: #2D6B3B;
          margin-bottom: 4px;
        }

        .page-subtitle {
          color: #666;
          font-size: 0.95rem;
        }

        .create-event-btn {
          background: linear-gradient(135deg, #2D6B3B 0%, #1e4a29 100%);
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .create-event-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(45, 107, 59, 0.4);
        }

        .create-event-btn span {
          font-size: 1.2rem;
          font-weight: 300;
        }

        .filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          border-radius: 25px;
          padding: 4px 4px 4px 16px;
          flex: 1;
          max-width: 360px;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          padding: 8px 0;
          font-size: 0.9rem;
        }

        .search-box button {
          background: #2D6B3B;
          color: #fff;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .filter-tabs {
          display: flex;
          gap: 4px;
          background: #f5f5f5;
          padding: 4px;
          border-radius: 20px;
        }

        .filter-tab {
          padding: 8px 16px;
          border: none;
          background: transparent;
          border-radius: 16px;
          cursor: pointer;
          font-size: 0.85rem;
          color: #666;
          transition: all 0.2s;
        }

        .filter-tab.active {
          background: #fff;
          color: #2D6B3B;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .event-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .event-card.disabled {
          opacity: 0.55;
          filter: grayscale(70%);
          cursor: default;
        }

        .event-card.disabled .card-image img {
          filter: grayscale(100%) brightness(0.8);
        }

        .event-card.disabled:hover {
          transform: none;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .card-image {
          position: relative;
          height: 180px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.4));
        }

        .card-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #fff;
        }

        .card-badge.ended {
          background: #999;
        }

        .card-badge.full {
          background: #e74c3c;
        }

        .card-creator {
          position: absolute;
          bottom: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-size: 0.8rem;
        }

        .creator-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #D4A76A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .card-content {
          padding: 16px;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #222;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #666;
        }

        .info-icon {
          font-size: 0.9rem;
        }

        .card-description {
          font-size: 0.85rem;
          color: #888;
          line-height: 1.5;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .progress-label {
          font-size: 0.7rem;
          color: #999;
        }

        .circular-progress {
          display: block;
        }

        .join-btn {
          background: linear-gradient(135deg, #2D6B3B 0%, #1e4a29 100%);
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .join-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(45, 107, 59, 0.4);
        }

        .join-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .join-btn.joined {
          background: #95a5a6;
        }

        .join-btn.full {
          background: #e74c3c;
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
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 16px;
          color: #999;
        }

        .empty-icon {
          font-size: 3rem;
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
          max-width: 560px;
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
          margin-bottom: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #2D6B3B;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .error-message {
          background: #fef0f0;
          color: #e74c3c;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        .badge-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .add-badge-btn {
          background: none;
          border: none;
          color: #2D6B3B;
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 500;
        }

        .badge-input-row {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
          align-items: center;
        }

        .badge-input-row input {
          padding: 8px 10px;
          font-size: 0.85rem;
        }

        .remove-badge-btn {
          background: #fef0f0;
          color: #e74c3c;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
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

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .page-title {
            font-size: 1.4rem;
          }

          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .filter-tabs {
            justify-content: center;
          }

          .events-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .form-row {
            flex-direction: column;
            gap: 0;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .events-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
