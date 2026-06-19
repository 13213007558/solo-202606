import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { User, Stats, Booking, Exhibition } from '../types';
import './AdminDashboard.css';

interface Props {
  user: User | null;
}

const AdminDashboard = ({ user }: Props) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'exhibitions' | 'create'>('overview');
  const [selectedExhibition, setSelectedExhibition] = useState<string>('');
  
  const [newExhibition, setNewExhibition] = useState({
    name: '',
    startDate: '',
    endDate: '',
    capacity: 100,
    description: '',
    coverImage: '',
    images: ''
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [bookingPage, setBookingPage] = useState(1);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes, exhibitionsRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/bookings'),
        axios.get('/api/exhibitions')
      ]);
      
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
      setExhibitions(exhibitionsRes.data);
      
      if (exhibitionsRes.data.length > 0 && !selectedExhibition) {
        setSelectedExhibition(exhibitionsRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status });
      fetchData();
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  const handleCreateExhibition = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    
    if (!newExhibition.name.trim()) {
      setCreateError('请输入展览名称');
      return;
    }
    
    if (!newExhibition.startDate || !newExhibition.endDate) {
      setCreateError('请选择展期');
      return;
    }
    
    if (new Date(newExhibition.startDate) > new Date(newExhibition.endDate)) {
      setCreateError('开始日期不能晚于结束日期');
      return;
    }
    
    if (newExhibition.capacity < 1) {
      setCreateError('展厅容量至少为1');
      return;
    }
    
    if (!newExhibition.coverImage.trim()) {
      setCreateError('请输入封面图URL');
      return;
    }
    
    setCreating(true);
    
    try {
      const images = newExhibition.images
        ? newExhibition.images.split('\n').map(s => s.trim()).filter(Boolean)
        : [newExhibition.coverImage];
      
      await axios.post('/api/exhibitions', {
        ...newExhibition,
        images
      });
      
      setNewExhibition({
        name: '',
        startDate: '',
        endDate: '',
        capacity: 100,
        description: '',
        coverImage: '',
        images: ''
      });
      
      setActiveTab('exhibitions');
      fetchData();
    } catch (err: any) {
      setCreateError(err.response?.data?.error || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="status-badge status-confirmed">已确认</span>;
      case 'pending':
        return <span className="status-badge status-pending">待确认</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">已取消</span>;
      default:
        return <span className="status-badge">未知</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const ITEMS_PER_PAGE = 10;
  const totalBookingPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = bookings.slice((bookingPage - 1) * ITEMS_PER_PAGE, bookingPage * ITEMS_PER_PAGE);

  const selectedExhibitionStats = stats?.exhibitionStats.find(e => e.id === selectedExhibition);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">管理后台</h1>
        <p className="dashboard-subtitle">欢迎回来，{user.username}</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 数据概览
        </button>
        <button
          className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => { setActiveTab('bookings'); setBookingPage(1); }}
        >
          📋 预约管理
        </button>
        <button
          className={`admin-tab ${activeTab === 'exhibitions' ? 'active' : ''}`}
          onClick={() => setActiveTab('exhibitions')}
        >
          🖼️ 展览管理
        </button>
        <button
          className={`admin-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ 创建展览
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="overview-section">
          <div className="stats-cards">
            <div className="stat-card card">
              <div className="stat-card-icon icon-bookings">🎫</div>
              <div className="stat-card-content">
                <span className="stat-card-number">{stats.totalBookings}</span>
                <span className="stat-card-label">总预约数</span>
              </div>
            </div>
            
            <div className="stat-card card">
              <div className="stat-card-icon icon-visitors">👥</div>
              <div className="stat-card-content">
                <span className="stat-card-number">{stats.totalVisitors}</span>
                <span className="stat-card-label">总参观人数</span>
              </div>
            </div>
            
            <div className="stat-card card">
              <div className="stat-card-icon icon-exhibitions">🖼️</div>
              <div className="stat-card-content">
                <span className="stat-card-number">{stats.exhibitionStats.length}</span>
                <span className="stat-card-label">展览数量</span>
              </div>
            </div>
          </div>

          <div className="chart-section card">
            <div className="chart-header">
              <h2 className="chart-title">各日期剩余票数</h2>
              <select
                className="chart-select"
                value={selectedExhibition}
                onChange={(e) => setSelectedExhibition(e.target.value)}
              >
                {exhibitions.map(exh => (
                  <option key={exh.id} value={exh.id}>{exh.name}</option>
                ))}
              </select>
            </div>
            
            {selectedExhibitionStats && (
              <div className="bar-chart">
                {selectedExhibitionStats.dailyData.slice(0, 14).map((day, index) => {
                  const percentage = (day.remaining / day.capacity) * 100;
                  const isFull = day.remaining === 0;
                  
                  return (
                    <div key={index} className="bar-item">
                      <div className="bar-label">
                        {new Date(day.date).getMonth() + 1}/{new Date(day.date).getDate()}
                      </div>
                      <div className="bar-wrapper">
                        <div 
                          className={`bar-fill ${isFull ? 'full' : ''}`}
                          style={{ 
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, #3182CE ${100 - percentage}%, #FC8181 ${100 - percentage}%)`
                          }}
                        >
                          <span className="bar-value">{day.remaining}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#3182CE' }}></span>
                <span>充足</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#FC8181' }}></span>
                <span>紧张</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bookings-section card">
          <h2 className="section-title">预约列表</h2>
          
          <div className="bookings-table-wrapper">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>预约人</th>
                  <th>手机号</th>
                  <th>展览</th>
                  <th>日期</th>
                  <th>票数</th>
                  <th>验证码</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-row">暂无预约记录</td>
                  </tr>
                ) : (
                  paginatedBookings.map(booking => (
                    <tr key={booking.id}>
                      <td className="booking-name">{booking.name}</td>
                      <td>{booking.phone}</td>
                      <td className="booking-exhibition">{booking.exhibitionName}</td>
                      <td>{formatDate(booking.date)}</td>
                      <td>{booking.tickets} 张</td>
                      <td className="booking-code">{booking.verificationCode}</td>
                      <td>{getStatusBadge(booking.status)}</td>
                      <td className="booking-actions">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              className="action-btn confirm"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                            >
                              确认入场
                            </button>
                            <button
                              className="action-btn cancel"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            >
                              取消
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            className="action-btn cancel"
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                          >
                            标记取消
                          </button>
                        )}
                        {booking.status === 'cancelled' && (
                          <button
                            className="action-btn confirm"
                            onClick={() => handleUpdateBookingStatus(booking.id, 'pending')}
                          >
                            恢复
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {bookings.length > 0 && (
            <div className="pagination">
              <span className="pagination-info">
                第 {(bookingPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(bookingPage * ITEMS_PER_PAGE, bookings.length)} 条，共 {bookings.length} 条
              </span>
              <button
                className="pagination-btn"
                disabled={bookingPage === 1}
                onClick={() => setBookingPage(p => p - 1)}
              >
                上一页
              </button>
              <span className="pagination-page">{bookingPage} / {totalBookingPages}</span>
              <button
                className="pagination-btn"
                disabled={bookingPage >= totalBookingPages}
                onClick={() => setBookingPage(p => p + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'exhibitions' && (
        <div className="exhibitions-section">
          <div className="section-header">
            <h2 className="section-title">展览列表</h2>
            <button className="btn btn-primary" onClick={() => setActiveTab('create')}>
              + 创建展览
            </button>
          </div>
          
          <div className="exhibitions-list">
            {exhibitions.map(exh => (
              <div key={exh.id} className="exhibition-item card">
                <img src={exh.coverImage} alt={exh.name} className="exhibition-thumb" />
                <div className="exhibition-info">
                  <h3 className="exhibition-item-title">{exh.name}</h3>
                  <p className="exhibition-item-date">
                    {formatDate(exh.startDate)} - {formatDate(exh.endDate)}
                  </p>
                  <p className="exhibition-item-capacity">
                    容量：{exh.capacity} 人/天
                  </p>
                </div>
                <div className="exhibition-item-status">
                  <span className={`item-status status-${exh.status}`}>
                    {exh.status === 'upcoming' ? '即将开始' : 
                     exh.status === 'ongoing' ? '进行中' : '已结束'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="create-section card">
          <h2 className="section-title">创建新展览</h2>
          
          {createError && <div className="form-error-banner">{createError}</div>}
          
          <form onSubmit={handleCreateExhibition} className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">展览名称 *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入展览名称"
                  value={newExhibition.name}
                  onChange={(e) => setNewExhibition({ ...newExhibition, name: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">开始日期 *</label>
                <input
                  type="date"
                  className="form-input"
                  value={newExhibition.startDate}
                  onChange={(e) => setNewExhibition({ ...newExhibition, startDate: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">结束日期 *</label>
                <input
                  type="date"
                  className="form-input"
                  value={newExhibition.endDate}
                  onChange={(e) => setNewExhibition({ ...newExhibition, endDate: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">展厅容量 *</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  value={newExhibition.capacity}
                  onChange={(e) => setNewExhibition({ ...newExhibition, capacity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">封面图URL *</label>
              <input
                type="text"
                className="form-input"
                placeholder="请输入封面图URL"
                value={newExhibition.coverImage}
                onChange={(e) => setNewExhibition({ ...newExhibition, coverImage: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">展览图片 <span className="hint">（每行一个URL，可选）</span></label>
              <textarea
                className="form-input form-textarea"
                placeholder="每行输入一个图片URL"
                rows={4}
                value={newExhibition.images}
                onChange={(e) => setNewExhibition({ ...newExhibition, images: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">展览简介</label>
              <textarea
                className="form-input form-textarea"
                placeholder="请输入展览简介"
                rows={4}
                value={newExhibition.description}
                onChange={(e) => setNewExhibition({ ...newExhibition, description: e.target.value })}
              />
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveTab('exhibitions')}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? '创建中...' : '创建展览'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
