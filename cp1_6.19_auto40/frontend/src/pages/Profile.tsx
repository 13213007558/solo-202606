import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserStats, Book } from '../types';

const monthNames: { [key: string]: string } = {
  '01': '一月', '02': '二月', '03': '三月', '04': '四月',
  '05': '五月', '06': '六月', '07': '七月', '08': '八月',
  '09': '九月', '10': '十月', '11': '十一月', '12': '十二月'
};

export default function Profile() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get<UserStats>('/api/stats');
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setLoading(false);
    }
  };

  const getTimelineMonths = () => {
    if (!stats) return [];
    const months: string[] = [];
    const currentYear = new Date().getFullYear();
    
    for (let m = 1; m <= 12; m++) {
      const monthKey = `${currentYear}-${m.toString().padStart(2, '0')}`;
      months.push(monthKey);
    }
    
    return months;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p className="empty-state-text">暂无统计数据</p>
        </div>
      </div>
    );
  }

  const timelineMonths = getTimelineMonths();

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">个人主页</h1>
        <p className="page-subtitle">查看你的阅读统计和成就</p>
      </div>

      <div className="stats-panel">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{stats.booksThisYear}</div>
            <div className="stat-label">本年度已读</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📄</div>
            <div className="stat-value">{stats.totalPages}</div>
            <div className="stat-label">阅读页数</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.averageRating}</div>
            <div className="stat-label">平均评分</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{stats.streakDays}</div>
            <div className="stat-label">连续阅读天数</div>
          </div>
        </div>
      </div>

      <div className="timeline-section">
        <h2 className="timeline-title">阅读时间线</h2>
        <div className="timeline-scroll">
          {timelineMonths.map(monthKey => {
            const [year, month] = monthKey.split('-');
            const books = stats.monthlyBooks[monthKey] || [];
            
            return (
              <div
                key={monthKey}
                className="timeline-month"
                onClick={() => books.length > 0 && setSelectedMonth(monthKey)}
              >
                <div className="month-label">
                  {monthNames[month]}
                </div>
                <div className="month-books">
                  {books.length > 0 ? (
                    books.slice(0, 4).map((book: Book) => (
                      <div key={book.id} className="month-book-cover" title={book.title}>
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} />
                        ) : (
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '1rem'
                          }}>📖</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '6px',
                      background: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#bdc3c7',
                      fontSize: '1.5rem'
                    }}>
                      —
                    </div>
                  )}
                </div>
                {books.length > 0 && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#E67E22', 
                    textAlign: 'center', 
                    marginTop: '0.5rem',
                    fontWeight: '600'
                  }}>
                    {books.length} 本
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedMonth && stats.monthlyBooks[selectedMonth] && (
        <div className="modal-overlay" onClick={() => setSelectedMonth(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {monthNames[selectedMonth.split('-')[1]]} 阅读详情
            </h2>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
              本月共阅读 {stats.monthlyBooks[selectedMonth].length} 本书
            </p>
            <div className="modal-book-list">
              {stats.monthlyBooks[selectedMonth].map((book: Book) => (
                <div key={book.id} className="modal-book-item">
                  <div className="modal-book-cover">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '2rem',
                        background: '#f5f5f5'
                      }}>📖</div>
                    )}
                  </div>
                  <div className="modal-book-title" title={book.title}>
                    {book.title}
                  </div>
                  {book.rating && (
                    <div style={{ color: '#f1c40f', fontSize: '0.75rem' }}>
                      {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setSelectedMonth(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
