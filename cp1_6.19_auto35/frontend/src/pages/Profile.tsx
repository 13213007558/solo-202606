import { useState, useEffect } from 'react';
import axios from 'axios';
import { ReadingStats, MonthlyBooks, Book } from '../types';

const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function Profile() {
  const [stats, setStats] = useState<ReadingStats>({
    booksReadThisYear: 0,
    totalPages: 0,
    averageRating: 0,
    currentStreak: 0
  });
  const [monthlyBooks, setMonthlyBooks] = useState<MonthlyBooks>({});
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    const fetchMonthlyBooks = async () => {
      try {
        const res = await axios.get('/api/stats/monthly');
        setMonthlyBooks(res.data);
      } catch (error) {
        console.error('Failed to fetch monthly books:', error);
      }
    };

    fetchStats();
    fetchMonthlyBooks();
  }, []);

  const handleMonthClick = (monthKey: string) => {
    const books = monthlyBooks[monthKey] || [];
    if (books.length > 0) {
      setSelectedBooks(books);
      setSelectedMonth(monthKey);
    }
  };

  const getMonthDisplay = (monthKey: string) => {
    const parts = monthKey.split('-');
    const monthIndex = parseInt(parts[1]) - 1;
    return monthNames[monthIndex];
  };

  const renderStars = (rating?: number) => {
    if (!rating) return '';
    return '⭐'.repeat(rating);
  };

  const currentYear = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    return `${currentYear}-${month}`;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">个人主页</h1>
      </div>

      <div className="stats-panel">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.booksReadThisYear}</div>
            <div className="stat-label">本年度读书数量</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.totalPages}</div>
            <div className="stat-label">总阅读页数</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.averageRating}</div>
            <div className="stat-label">平均评分</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              <span className="streak-icon">🔥</span>
              {stats.currentStreak}
            </div>
            <div className="stat-label">连续阅读天数</div>
          </div>
        </div>
      </div>

      <div className="timeline-section">
        <h2 className="timeline-title">{currentYear}年阅读时间线</h2>
        <div className="timeline-scroll">
          {months.map((monthKey) => {
            const books = monthlyBooks[monthKey] || [];
            return (
              <div
                key={monthKey}
                className="month-block"
                onClick={() => handleMonthClick(monthKey)}
                style={{
                  opacity: books.length > 0 ? 1 : 0.5,
                  cursor: books.length > 0 ? 'pointer' : 'default'
                }}
              >
                <div className="month-name">{getMonthDisplay(monthKey)}</div>
                <div className="month-count">{books.length} 本</div>
                <div className="month-books-small">
                  {books.slice(0, 4).map((book) => (
                    <img
                      key={book.id}
                      src={book.coverUrl || 'https://via.placeholder.com/30x42?text=📖'}
                      alt={book.title}
                      className="month-book-thumb"
                    />
                  ))}
                  {books.length > 4 && (
                    <span style={{ fontSize: '0.75rem', color: '#7F8C8D', alignSelf: 'center' }}>
                      +{books.length - 4}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedMonth && (
        <div className="modal-overlay" onClick={() => setSelectedMonth(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {currentYear}年{getMonthDisplay(selectedMonth)}阅读详情
              </h2>
              <button className="modal-close" onClick={() => setSelectedMonth(null)}>
                ✕
              </button>
            </div>
            {selectedBooks.length > 0 ? (
              <div className="modal-books-grid">
                {selectedBooks.map((book) => (
                  <div key={book.id} className="modal-book-item">
                    <img
                      src={book.coverUrl || 'https://via.placeholder.com/100x140?text=📖'}
                      alt={book.title}
                      className="modal-book-cover"
                    />
                    <div className="modal-book-title">{book.title}</div>
                    <div className="modal-book-rating">{renderStars(book.rating)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#7F8C8D', padding: '2rem' }}>
                本月暂无已读书籍
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
