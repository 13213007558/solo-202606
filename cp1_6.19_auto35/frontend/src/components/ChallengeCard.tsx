import { useState, useEffect } from 'react';
import { Challenge, Book } from '../types';
import axios from 'axios';

interface ChallengeCardProps {
  challenge: Challenge;
  books: Book[];
  onUpdate?: () => void;
}

function ChallengeCard({ challenge, books, onUpdate }: ChallengeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [allBooks, setAllBooks] = useState<Book[]>(books);

  const completedCount = challenge.bookIds.length;
  const progress = Math.min((completedCount / challenge.targetBooks) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('/api/books');
        setAllBooks(res.data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      }
    };
    fetchBooks();
  }, []);

  const associatedBooks = allBooks.filter(b => challenge.bookIds.includes(b.id));
  const availableBooks = allBooks.filter(
    b => b.status === 'read' && !challenge.bookIds.includes(b.id)
  );

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;

  const handleAddBook = async (bookId: string) => {
    try {
      await axios.post(`/api/challenges/${challenge.id}/add-book`, { bookId });
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add book to challenge:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个挑战吗？')) {
      try {
        await axios.delete(`/api/challenges/${challenge.id}`);
        onUpdate?.();
      } catch (error) {
        console.error('Failed to delete challenge:', error);
      }
    }
  };

  return (
    <div 
      className={`challenge-card ${expanded ? 'expanded' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="challenge-header">
        <h3 className="challenge-title">{challenge.name}</h3>
        <button 
          className="btn btn-danger" 
          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
          onClick={handleDelete}
        >
          删除
        </button>
      </div>
      <p className="challenge-deadline">截止日期：{challenge.deadline}</p>
      
      <div className="progress-ring-container">
        <svg className="progress-ring" width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#ECF0F1"
            strokeWidth="10"
          />
          <circle
            className="progress-ring-circle"
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E67E22" />
              <stop offset="100%" stopColor="#D35400" />
            </linearGradient>
          </defs>
          <text
            x="70"
            y="70"
            className="progress-text"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {completedCount}/{challenge.targetBooks}
          </text>
        </svg>
      </div>

      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      {expanded && (
        <div className="books-list">
          <h4 className="books-list-title">已完成书籍</h4>
          {associatedBooks.length > 0 ? (
            <div className="books-grid-small">
              {associatedBooks.map((book) => (
                <img
                  key={book.id}
                  src={book.coverUrl || 'https://via.placeholder.com/50x70?text=📖'}
                  alt={book.title}
                  className="book-thumb"
                />
              ))}
            </div>
          ) : (
            <p style={{ color: '#7F8C8D', fontSize: '0.875rem' }}>暂无已完成书籍</p>
          )}

          {availableBooks.length > 0 && (
            <>
              <h4 className="books-list-title" style={{ marginTop: '1rem' }}>
                添加已读书籍到挑战
              </h4>
              <div className="books-grid-small">
                {availableBooks.map((book) => (
                  <img
                    key={book.id}
                    src={book.coverUrl || 'https://via.placeholder.com/50x70?text=📖'}
                    alt={`添加 ${book.title}`}
                    className="book-thumb"
                    style={{ cursor: 'pointer', opacity: 0.6, transition: 'all 0.3s' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddBook(book.id);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.6';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ChallengeCard;
