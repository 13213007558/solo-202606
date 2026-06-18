import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Stats, User, Booking } from '../types';

interface AdminPanelProps {
  user: User | null;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'exhibitions' | 'bookings'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/stats');
      setStats(res.data);
      if (!selectedExhibitionId && res.data.exhibitionStats.length > 0) {
        setSelectedExhibitionId(res.data.exhibitionStats[0].id);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/status`, { status });
      fetchStats();
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const selectedExhibition = stats?.exhibitionStats.find(e => e.id === selectedExhibitionId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'rgba(72, 187, 120, 0.15)', color: '#48BB78', label: '已确认' };
      case 'pending':
        return { bg: 'rgba(236, 201, 75, 0.15)', color: '#ECC94B', label: '待确认' };
      case 'cancelled':
        return { bg: 'rgba(245, 101, 101, 0.15)', color: '#F56565', label: '已取消' };
      default:
        return { bg: 'rgba(160, 174, 192, 0.15)', color: '#A0AEC0', label: status };
    }
  };

  const getBarColor = (remaining: number, capacity: number) => {
    const ratio = capacity > 0 ? remaining / capacity : 0;
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    
    const h1 = 210, s1 = 75, l1 = 60;
    const h2 = 0, s2 = 85, l2 = 65;
    
    const h = h1 + (h2 - h1) * (1 - clampedRatio);
    const s = s1 + (s2 - s1) * (1 - clampedRatio);
    const l = l1 + (l2 - l1) * (1 - clampedRatio);
    
    const lOffset = Math.min(10, l * 0.15);
    const color1 = `hsl(${h}, ${s}%, ${l}%)`;
    const color2 = `hsl(${h}, ${s}%, ${Math.min(100, l + lOffset)}%)`;
    
    return `linear-gradient(to right, ${color1}, ${color2})`;
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        padding: '60px 0',
        color: 'var(--text-secondary)',
      }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>
            管理后台
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}>
            {user.museumName} · 欢迎回来，{user.username}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--accent-amber)',
            color: '#1A202C',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
        >
          + 创建新展览
        </button>
      </div>

      {/* 标签导航 */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        backgroundColor: 'var(--bg-secondary)',
        padding: '6px',
        borderRadius: '10px',
        width: 'fit-content',
      }}>
        {[
          { key: 'overview', label: '数据概览' },
          { key: 'exhibitions', label: '展览管理' },
          { key: 'bookings', label: '预约管理' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeTab === tab.key ? 'var(--accent-amber)' : 'transparent',
              color: activeTab === tab.key ? '#1A202C' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: activeTab === tab.key ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 数据概览 */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* 统计卡片 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: 'var(--accent-amber)',
                marginBottom: '8px',
              }}>
                {stats.totalBookings}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}>
                总预约人次
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: 'var(--accent-teal)',
                marginBottom: '8px',
              }}>
                {stats.totalExhibitions}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}>
                展览总数
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#48BB78',
                marginBottom: '8px',
              }}>
                {stats.bookingList.filter(b => b.status === 'confirmed').length}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}>
                已确认预约
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#ECC94B',
                marginBottom: '8px',
              }}>
                {stats.bookingList.filter(b => b.status === 'pending').length}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}>
                待确认预约
              </div>
            </div>
          </div>

          {/* 展览选择器和剩余票数图表 */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                每日剩余票数
              </h3>
              <select
                value={selectedExhibitionId || ''}
                onChange={(e) => setSelectedExhibitionId(e.target.value)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {stats.exhibitionStats.map(exh => (
                  <option key={exh.id} value={exh.id}>
                    {exh.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedExhibition && (
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '8px',
              }}>
                {selectedExhibition.dateStats.slice(0, 30).map((day, idx) => {
                  const ratio = day.capacity > 0 ? (day.remaining / day.capacity) * 100 : 0;
                  return (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '10px',
                    }}>
                      <div style={{
                        width: '100px',
                        flexShrink: 0,
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}>
                        {day.date.slice(5)}
                      </div>
                      <div style={{
                        flex: 1,
                        height: '28px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${ratio}%`,
                            background: getBarColor(day.remaining, day.capacity),
                            borderRadius: '6px',
                            transition: 'width 0.5s ease',
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '12px',
                          color: ratio > 30 ? 'white' : 'var(--text-primary)',
                          fontWeight: '500',
                        }}>
                          {day.remaining}/{day.capacity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 展览管理 */}
      {activeTab === 'exhibitions' && stats && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}>
              展览列表
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    展览名称
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    展期
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    容量
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    总预约
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    状态
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.exhibitionStats.map(exh => {
                  const statusConfig = (() => {
                    switch (exh.status) {
                      case 'upcoming':
                        return { color: '#4299E1', bg: 'rgba(66, 153, 225, 0.15)', label: '即将开始' };
                      case 'ongoing':
                        return { color: '#48BB78', bg: 'rgba(72, 187, 120, 0.15)', label: '进行中' };
                      case 'ended':
                        return { color: '#A0AEC0', bg: 'rgba(160, 174, 192, 0.15)', label: '已结束' };
                      default:
                        return { color: '#A0AEC0', bg: 'rgba(160, 174, 192, 0.15)', label: exh.status };
                    }
                  })();
                  return (
                    <tr key={exh.id} style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.2s',
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        fontWeight: '500',
                      }}>
                        {exh.name}
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                      }}>
                        {stats.exhibitionStats.find(e => e.id === exh.id)?.dateStats[0]?.date} - {stats.exhibitionStats.find(e => e.id === exh.id)?.dateStats.slice(-1)[0]?.date}
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                      }}>
                        {exh.capacity}人/天
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '14px',
                        color: 'var(--accent-teal)',
                        fontWeight: '600',
                      }}>
                        {exh.totalVisitors}
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: statusConfig.bg,
                          color: statusConfig.color,
                        }}>
                          {statusConfig.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 预约管理 */}
      {activeTab === 'bookings' && stats && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}>
              预约列表
            </h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    预约人
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    展览
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    日期
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    票数
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    状态
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)',
                  }}>
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.bookingList.map((booking: Booking) => {
                  const statusConfig = getStatusColor(booking.status);
                  return (
                    <tr key={booking.id} style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.2s',
                    }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                      }}>
                        <div style={{ fontWeight: '500' }}>{booking.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {booking.phone}
                        </div>
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        maxWidth: '180px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {booking.exhibitionName}
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                      }}>
                        {booking.date}
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                        fontWeight: '500',
                      }}>
                        {booking.count} 张
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: statusConfig.bg,
                          color: statusConfig.color,
                        }}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: 'rgba(72, 187, 120, 0.15)',
                                  color: '#48BB78',
                                  border: '1px solid #48BB78',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = '#48BB78';
                                  e.currentTarget.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(72, 187, 120, 0.15)';
                                  e.currentTarget.style.color = '#48BB78';
                                }}
                              >
                                确认入场
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: 'rgba(245, 101, 101, 0.15)',
                                  color: '#F56565',
                                  border: '1px solid #F56565',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = '#F56565';
                                  e.currentTarget.style.color = 'white';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(245, 101, 101, 0.15)';
                                  e.currentTarget.style.color = '#F56565';
                                }}
                              >
                                取消
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: 'rgba(245, 101, 101, 0.15)',
                                color: '#F56565',
                                border: '1px solid #F56565',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#F56565';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(245, 101, 101, 0.15)';
                                e.currentTarget.style.color = '#F56565';
                              }}
                            >
                              标记取消
                            </button>
                          )}
                          {booking.status === 'cancelled' && (
                            <span style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                            }}>
                              —
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 创建展览弹窗 */}
      {showCreateModal && (
        <CreateExhibitionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchStats();
          }}
        />
      )}
    </div>
  );
}

function CreateExhibitionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    capacity: 100,
    description: '',
    coverImage: '',
    images: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('请输入展览名称');
      return;
    }
    if (!formData.startDate) {
      setError('请选择开始日期');
      return;
    }
    if (!formData.endDate) {
      setError('请选择结束日期');
      return;
    }
    if (formData.startDate > formData.endDate) {
      setError('结束日期不能早于开始日期');
      return;
    }
    if (!formData.description.trim()) {
      setError('请输入展览简介');
      return;
    }
    if (!formData.coverImage.trim()) {
      setError('请输入封面图URL');
      return;
    }

    try {
      setSubmitting(true);
      const images = formData.images
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      if (images.length === 0 && formData.coverImage) {
        images.push(formData.coverImage);
      }

      await axios.post('/api/exhibitions', {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        capacity: formData.capacity,
        description: formData.description,
        coverImage: formData.coverImage,
        images: images.length > 0 ? images : [formData.coverImage],
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || '创建失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
          }}>
            创建新展览
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              fontWeight: '500',
            }}>
              展览名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入展览名称"
              style={{
                width: '100%',
                padding: '12px 14px',
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                fontWeight: '500',
              }}>
                开始日期 *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                fontWeight: '500',
              }}>
                结束日期 *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              fontWeight: '500',
            }}>
              展厅容量（人/天）
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 100 })}
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              fontWeight: '500',
            }}>
              展览简介 *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入展览简介"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              fontWeight: '500',
            }}>
              封面图URL *
            </label>
            <input
              type="text"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="请输入封面图片URL"
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              fontWeight: '500',
            }}>
              轮播图片URL（每行一张，可选）
            </label>
            <textarea
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              placeholder="每行输入一张图片URL&#10;https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(245, 101, 101, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              color: 'var(--danger)',
              fontSize: '13px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'var(--accent-amber)',
                color: '#1A202C',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {submitting ? '创建中...' : '创建展览'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
