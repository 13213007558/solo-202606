import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Exhibition, Booking, DailyRemaining } from '../types';
import TicketCard from '../components/TicketCard';
import './ExhibitionDetail.css';

const ExhibitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tickets: 1
  });
  const [formError, setFormError] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const fetchExhibition = useCallback(async () => {
    if (!id) return;
    try {
      const res = await axios.get(`/api/exhibitions/${id}`);
      setExhibition(res.data);
      
      if (!selectedDate && res.data.dailyRemaining?.length) {
        const today = new Date().toISOString().split('T')[0];
        const available = res.data.dailyRemaining.find((d: DailyRemaining) => d.date >= today && !d.isFull);
        if (available) {
          setSelectedDate(available.date);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [id, selectedDate]);

  useEffect(() => {
    fetchExhibition();
  }, [fetchExhibition]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchExhibition();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchExhibition]);

  useEffect(() => {
    if (!exhibition) return;
    
    const targetDate = new Date(exhibition.startDate);
    targetDate.setHours(9, 0, 0, 0);
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance < 0) {
        const endDate = new Date(exhibition.endDate).getTime();
        if (now > endDate) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          setCountdown({ days: -1, hours: 0, minutes: 0, seconds: 0 });
        }
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(timer);
  }, [exhibition]);

  useEffect(() => {
    if (!exhibition?.images?.length) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (exhibition.images?.length || 1));
    }, 4000);
    
    return () => clearInterval(timer);
  }, [exhibition?.images?.length]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!selectedDate) {
      setFormError('请选择参观日期');
      return;
    }
    
    if (!formData.name.trim()) {
      setFormError('请输入姓名');
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      setFormError('请输入正确的手机号');
      return;
    }
    
    if (formData.tickets < 1 || formData.tickets > 3) {
      setFormError('每人限购1-3张票');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const res = await axios.post('/api/bookings', {
        exhibitionId: id,
        name: formData.name.trim(),
        phone: formData.phone,
        date: selectedDate,
        tickets: formData.tickets
      });
      
      setBooking(res.data);
      setTimeout(() => setShowTicket(true), 100);
    } catch (err: any) {
      setFormError(err.response?.data?.error || '预约失败');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCalendarDays = () => {
    if (!exhibition?.dailyRemaining) return null;
    
    const days: JSX.Element[] = [];
    const today = new Date().toISOString().split('T')[0];
    
    exhibition.dailyRemaining.forEach((day: DailyRemaining) => {
      const isPast = day.date < today;
      const isSelected = day.date === selectedDate;
      const isDisabled = isPast || day.isFull || exhibition.status === 'ended';
      
      const dateObj = new Date(day.date);
      const dayNum = dateObj.getDate();
      const dayOfWeek = dateObj.getDay();
      const isToday = day.date === today;
      
      days.push(
        <button
          key={day.date}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''} ${isToday ? 'today' : ''} ${day.isFull ? 'full' : ''}`}
          disabled={isDisabled}
          onClick={() => !isDisabled && setSelectedDate(day.date)}
        >
          <span className="day-number">{dayNum}</span>
          <span className="day-week">{'日一二三四五六'[dayOfWeek]}</span>
          {!day.isFull && !isPast && (
            <div className="day-progress-bar">
              <div
                className="day-progress-fill"
                style={{
                  width: `${(day.remaining / exhibition.capacity) * 100}%`,
                  backgroundColor: day.remaining / exhibition.capacity > 0.5
                    ? "#38B2AC"
                    : day.remaining / exhibition.capacity > 0.2
                      ? "#ECC94B"
                      : "#FC8181"
                }}
              ></div>
            </div>
          )}
          {day.isFull && <span className="full-dot"></span>}
          {!day.isFull && !isPast && (
            <span className="remaining-count">剩{day.remaining}</span>
          )}
        </button>
      );
    });
    
    return days;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div className="page-container">
        <div className="error-box card">
          <p className="error-text">{error || '展览不存在'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (booking && showTicket) {
    return (
      <div className="page-container">
        <div className="ticket-success-section">
          <div className="success-icon">✓</div>
          <h2 className="success-title">预约成功！</h2>
          <p className="success-subtitle">请保存好您的电子门票，入场时出示</p>
          
          <div className="ticket-display">
            <TicketCard 
              booking={booking} 
              exhibition={exhibition} 
              visible={showTicket} 
            />
          </div>
          
          <div className="success-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              返回首页
            </button>
            <button className="btn btn-primary" onClick={() => {
              setBooking(null);
              setShowTicket(false);
              setFormData({ name: '', phone: '', tickets: 1 });
            }}>
              继续预约
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container detail-page">
      <div className="detail-carousel">
        <div className="carousel-container">
          {exhibition.images?.map((img, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <img src={img} alt={`${exhibition.name} ${index + 1}`} />
            </div>
          ))}
        </div>
        
        <div className="carousel-dots">
          {exhibition.images?.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        
        <button className="carousel-nav prev" onClick={() => setCurrentSlide((prev) => (prev - 1 + (exhibition.images?.length || 1)) % (exhibition.images?.length || 1))}>
          ‹
        </button>
        <button className="carousel-nav next" onClick={() => setCurrentSlide((prev) => (prev + 1) % (exhibition.images?.length || 1))}>
          ›
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-main">
          <div className="detail-header">
            <h1 className="detail-title">{exhibition.name}</h1>
            <span className={`detail-status status-${exhibition.status}`}>
              {exhibition.status === 'upcoming' ? '即将开始' : 
               exhibition.status === 'ongoing' ? '进行中' : '已结束'}
            </span>
          </div>
          
          <div className="detail-meta">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>{formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">👥</span>
              <span>每天 {exhibition.capacity} 人</span>
            </div>
          </div>

          {countdown.days >= 0 && exhibition.status === 'upcoming' && (
            <div className="countdown-section card">
              <h3 className="countdown-title">距离展览开始还有</h3>
              <div className="countdown-timer">
                <div className="countdown-item">
                  <span className="countdown-number">{countdown.days}</span>
                  <span className="countdown-label">天</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-number">{countdown.hours}</span>
                  <span className="countdown-label">时</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-number">{countdown.minutes}</span>
                  <span className="countdown-label">分</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-number">{countdown.seconds}</span>
                  <span className="countdown-label">秒</span>
                </div>
              </div>
            </div>
          )}

          <div className="detail-description card">
            <h2 className="section-title">展览介绍</h2>
            <p className="description-text">{exhibition.description}</p>
          </div>

          <div className="date-picker-section card">
            <h2 className="section-title">选择参观日期</h2>
            <div className="calendar-grid">
              {renderCalendarDays()}
            </div>
            {selectedDate && (
              <div className="selected-date-info">
                已选择：<span className="highlight">{formatDate(selectedDate)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="booking-form card">
            <h2 className="section-title">立即预约</h2>
            
            {formError && <div className="form-error-banner">{formError}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">姓名</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入您的姓名"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">手机号</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="请输入手机号"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">预约人数 <span className="hint">（每人限购3张）</span></label>
                <div className="ticket-counter">
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => setFormData({ ...formData, tickets: Math.max(1, formData.tickets - 1) })}
                  >
                    −
                  </button>
                  <span className="counter-value">{formData.tickets}</span>
                  <button
                    type="button"
                    className="counter-btn"
                    onClick={() => setFormData({ ...formData, tickets: Math.min(3, formData.tickets + 1) })}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={submitting || exhibition.status === 'ended'}
              >
                {submitting ? '提交中...' : exhibition.status === 'ended' ? '展览已结束' : '提交预约'}
              </button>
            </form>
            
            <p className="form-tip">
              💡 预约成功后将生成专属电子门票
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionDetail;
