import { useState, useEffect, useRef } from 'react';
import { Challenge, Book } from '../types';
import axios from 'axios';

interface ChallengeCardProps {
  challenge: Challenge;
  books: Book[];
  onUpdate?: () => void;
}

function ChallengeCard({ challenge, books, onUpdate }: ChallengeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [allBooks, setAllBooks] = useState<Book[]>(books);
  const animationRef = useRef<number | null>(null);

  const completedCount = challenge.bookIds.length;
  const progress = Math.min((completedCount / challenge.targetBooks) * 100, 100);

  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;
    const endValue = progress;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progressRatio);
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setAnimatedProgress(currentValue);

      if (progressRatio < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    const startDelay = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(startDelay);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
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

  const allRelevantBooks = [...associatedBooks, ...availableBooks];

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

  const handleToggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
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

      <div className="challenge-books-summary">
        <div className="books-row">
          {associatedBooks.length > 0 ? (
            associatedBooks.slice(0, 3).map((book) => (
              <div key={book.id} className="book-item-row">
              <img
                src={book.coverUrl || 'https://via.placeholder.com/40x56?text=📖'}
                alt={book.title}
                className="book-thumb-small"
              />
              <span className="status-icon completed" title="已完成">✓</span>
            </div>
            ))
          ) : (
            <p style={{ color: '#7F8C8D', fontSize: '0.8rem', margin: 0 }}>暂无已完成书籍</p>
          )}
          {associatedBooks.length > 3 && (
            <div className="book-item-row">
              <span className="more-count">+{associatedBooks.length - 3}</span>
            </div>
          )}
        </div>
      </div>

      <button
        className="btn btn-details"
        onClick={handleToggleDetails}
      >
        {showDetails ? '收起详情' : '查看详情'}
      </button>

      {showDetails && (
        <div className="books-list">
          <h4 className="books-list-title">挑战书籍清单</h4>
          {allRelevantBooks.length > 0 ? (
            <div className="books-list-vertical">
              {allRelevantBooks.map((book) => {
                const isCompleted = challenge.bookIds.includes(book.id);
                return (
                  <div key={book.id} className="book-item-vertical">
                    <img
                      src={book.coverUrl || 'https://via.placeholder.com/50x70?text=📖'}
                      alt={book.title}
                      className="book-thumb"
                    />
                    <div className="book-info">
                      <p className="book-title-small">{book.title}</p>
                      <p className="book-author-small">{book.author}</p>
                    </div>
                    {!isCompleted && availableBooks.some(b => b.id === book.id) ? (
                      <button
                        className="btn-add-book"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddBook(book.id);
                        }}
                      >
                        添加
                      </button>
                    ) : (
                      <span className="status-icon-large completed-icon">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#7F8C8D', fontSize: '0.875rem' }}>暂无书籍</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ChallengeCard;
