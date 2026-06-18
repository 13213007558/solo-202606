import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import TicketCard from '../components/TicketCard';
import type { Exhibition, Booking, DateStat } from '../types';

export default function ExhibitionDetail() {
  const { id } = useParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', count: 1 });
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [countdown, setCountdown] = useState(10);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!booking) {
      fetchExhibition();
      
      intervalRef.current = setInterval(() => {
        fetchExhibition();
      }, 10000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [id, booking]);

  useEffect(() => {
    if (booking && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [booking]);

  useEffect(() => {
    if (exhibition?.images && exhibition.images.length > 1) {
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % (exhibition.images?.length || 1));
      }, 4000);
    }
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [exhibition?.images?.length]);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchExhibition = async () => {
    try {
      const res = await axios.get(`/api/exhibitions/${id}`);
      setExhibition(res.data);
      setLastUpdated(new Date());
      setCountdown(10);
      if (!selectedDate && res.data.dateStats?.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const available = res.data.dateStats.find((d: DateStat) => 
          d.date >= today && d.remaining > 0
        );
        if (available) {
          setSelectedDate(available.date);
          setCurrentMonth(new Date(available.date));
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '加载展览信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!booking) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 10));
      }, 1000);
    }
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [booking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim()) {
      setError('请输入姓名');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (formData.count < 1 || formData.count > 3) {
      setError('每人限购1-3张票');
      return;
    }
    if (!selectedDate) {
      setError('请选择预约日期');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post('/api/bookings', {
        exhibitionId: id,
        name: formData.name,
        phone: formData.phone,
        date: selectedDate,
        count: formData.count,
      });
      setBooking(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || '预约失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const getDateInfo = (date: string) => {
    return exhibition?.dateStats?.find(d => d.date === date);
  };

  const isDateInRange = (date: string) => {
    if (!exhibition) return false;
    return date >= exhibition.startDate && date <= exhibition.endDate;
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} style={{ visibility: 'hidden' }} />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateInfo = getDateInfo(dateStr);
      const inRange = isDateInRange(dateStr);
      const isFull = dateInfo && dateInfo.remaining <= 0;
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isPast = dateStr < new Date().toISOString().split('T')[0];
      const disabled = !inRange || isFull || isPast;

      days.push(
        <button
          key={day}
          onClick={() => !disabled && setSelectedDate(dateStr)}
          disabled={disabled}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: isSelected ? '2px solid var(--accent-amber)' : '2px solid transparent',
            backgroundColor: isSelected ? 'rgba(214, 158, 46, 0.15)' : 'transparent',
            color: disabled ? 'var(--bg-tertiary)' : isFull ? 'var(--danger)' : 'var(--text-primary)',
            fontSize: '14px',
            position: 'relative',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            fontWeight: isToday ? 'bold' : 'normal',
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
          onMouseOver={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }
          }}
          onMouseOut={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = isSelected ? 'rgba(214, 158, 46, 0.15)' : 'transparent';
            }
          }}
        >
          {day}
          {isFull && inRange && (
            <div style={{
              position: 'absolute',
              bottom: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#F56565',
              boxShadow: '0 0 4px rgba(245, 101, 101, 0.6)',
            }} />
          )}
          {isToday && (
            <div style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-teal)',
            }} />
          )}
        </button>
      );
    }
    
    return days;
  };

  if (loading) {
    return (
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '60px 0',
        color: 'var(--text-secondary)',
      }}>
        加载中...
      </div>
    );
  }

  if (error && !exhibition) {
    return (
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '60px 0',
        color: 'var(--danger)',
      }}>
        {error}
      </div>
    );
  }

  if (!exhibition) return null;

  if (booking) {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 0' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '12px',
          }}>
            🎉
          </div>
          <h2 style={{
            fontSize: '24px',
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            预约成功！
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
          }}>
            请保存好您的电子门票，入场时出示
          </p>
        </div>
        <TicketCard
          booking={booking}
          exhibitionName={exhibition.name}
          exhibitionImage={exhibition.coverImage}
          isVisible={true}
        />
        <button
          onClick={() => setBooking(null)}
          style={{
            width: '100%',
            marginTop: '24px',
            padding: '12px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-amber)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          返回详情页
        </button>
      </div>
    );
  }

  const selectedDateInfo = getDateInfo(selectedDate);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* 轮播图 */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '24px',
        backgroundColor: 'var(--bg-secondary)',
      }}>
        {exhibition.images?.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`${exhibition.name} - ${idx + 1}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: currentSlide === idx ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
            }}
          />
        ))}
        
        {/* 轮播指示器 */}
        {exhibition.images && exhibition.images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
          }}>
            {exhibition.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: currentSlide === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: currentSlide === idx ? 'var(--accent-amber)' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
        )}

        {/* 左右切换按钮 */}
        {exhibition.images && exhibition.images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide(prev => (prev - 1 + (exhibition.images?.length || 1)) % (exhibition.images?.length || 1))}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)';
              }}
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % (exhibition.images?.length || 1))}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)';
              }}
            >
              ›
            </button>
          </>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
      }}>
        {/* 左侧：展览信息 */}
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            marginBottom: '12px',
          }}>
            {exhibition.name}
          </h1>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: 'var(--accent-amber)',
            }}>
              <span>📅</span>
              <span>
                {new Date(exhibition.startDate).toLocaleDateString('zh-CN')} - {new Date(exhibition.endDate).toLocaleDateString('zh-CN')}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: 'var(--accent-teal)',
            }}>
              <span>👥</span>
              <span>容量 {exhibition.capacity} 人/天</span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: 0,
              }}>
                展览介绍
              </h3>
              {!booking && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: countdown <= 3 ? 'var(--accent-amber)' : 'var(--success)',
                    animation: 'pulse 1s infinite',
                  }} />
                  <span>{countdown}秒后自动刷新</span>
                  {lastUpdated && (
                    <span style={{ color: 'var(--accent-teal)' }}>
                      · 更新于 {lastUpdated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>
              )}
            </div>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              margin: 0,
            }}>
              {exhibition.description}
            </p>
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>

          {/* 日期选择器 */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                选择日期
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ‹
                </button>
                <span style={{
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  minWidth: '100px',
                  textAlign: 'center',
                }}>
                  {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ›
                </button>
              </div>
            </div>

            {/* 星期标题 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '8px',
            }}>
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  padding: '8px',
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* 日期格子 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
            }}>
              {renderCalendar()}
            </div>

            {/* 图例 */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F56565' }} />
                <span>已满</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-teal)' }} />
                <span>今天</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--accent-amber)' }} />
                <span>已选</span>
              </div>
            </div>

            {selectedDate && selectedDateInfo && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                  {selectedDate}
                </span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: selectedDateInfo.remaining > 0 ? 'var(--success)' : 'var(--danger)',
                }}>
                  剩余 {selectedDateInfo.remaining} 张
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：预约表单 */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          padding: '24px',
          height: 'fit-content',
          position: 'sticky',
          top: '80px',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            marginBottom: '20px',
          }}>
            立即预约
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}>
                姓名
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入您的姓名"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-amber)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}>
                手机号
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入手机号"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-amber)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-color)';
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}>
                预约人数 <span style={{ color: 'var(--accent-amber)' }}>（每人限购3张）</span>
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, count: Math.max(1, formData.count - 1) })}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-amber)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="3"
                  step="1"
                  value={formData.count}
                  onChange={(e) => {
                    const val = Math.min(3, Math.max(1, parseInt(e.target.value) || 1));
                    setFormData({ ...formData, count: val });
                  }}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onBlur={(e) => {
                    const val = Math.min(3, Math.max(1, parseInt(e.target.value) || 1));
                    setFormData({ ...formData, count: val });
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    textAlign: 'center',
                    outline: 'none',
                    fontWeight: 'bold',
                    appearance: 'textfield',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, count: Math.min(3, formData.count + 1) })}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-amber)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(245, 101, 101, 0.1)',
                border: '1px solid var(--danger)',
                borderRadius: '8px',
                color: 'var(--danger)',
                fontSize: '13px',
                marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedDate || selectedDateInfo?.remaining === 0}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'var(--accent-amber)',
                color: '#1A202C',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting || !selectedDate || selectedDateInfo?.remaining === 0 ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {submitting ? '提交中...' : '确认预约'}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
          }}>
            <p>• 预约成功后将生成电子门票</p>
            <p>• 请在展览当天凭验证码入场</p>
            <p>• 如需取消请提前24小时联系客服</p>
          </div>
        </div>
      </div>

      {/* 响应式样式 */}
      <style>{`
        @media (min-width: 768px) {
          .detail-container {
            grid-template-columns: 1fr 350px !important;
          }
        }
        @media (max-width: 640px) {
          .carousel {
            padding-top: 66.67% !important;
            margin-left: -24px;
            margin-right: -24px;
            border-radius: 0 !important;
            width: calc(100% + 48px);
          }
        }
      `}</style>
    </div>
  );
}
