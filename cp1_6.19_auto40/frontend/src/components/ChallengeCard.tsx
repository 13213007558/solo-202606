import { useState, useEffect } from 'react';
import axios from 'axios';
import { Challenge, Book } from '../types';

interface ChallengeCardProps {
  challenge: Challenge;
  allBooks: Book[];
  onUpdate?: () => void;
}

export default function ChallengeCard({ challenge, allBooks, onUpdate }: ChallengeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const progress = challenge.targetBooks > 0
    ? Math.min((challenge.completedBookIds.length / challenge.targetBooks) * 100, 100)
    : 0;

  const associatedBooks = allBooks.filter(b => challenge.bookIds.includes(b.id));
  const completedBooks = allBooks.filter(b => challenge.completedBookIds.includes(b.id));

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  const handleCompleteBook = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.post(`/api/challenges/${challenge.id}/complete`, { bookId });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to complete book:', err);
    }
  };

  const handleAddBook = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.post(`/api/challenges/${challenge.id}/books`, { bookId });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to add book:', err);
    }
  };

  const availableBooks = allBooks.filter(b => 
    !challenge.bookIds.includes(b.id) && b.status !== 'unread'
  );

  return (
    <div 
      className="challenge-card"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="challenge-header">
        <h3 className="challenge-title">{challenge.name}</h3>
        <div className="progress-ring-container">
          <svg className="progress-ring" width="80" height="80">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E67E22" />
                <stop offset="100%" stopColor="#f39c12" />
              </linearGradient>
            </defs>
            <circle
              className="progress-ring-circle-bg"
              cx="40"
              cy="40"
              r="36"
            />
            <circle
              className="progress-ring-circle"
              cx="40"
              cy="40"
              r="36"
              style={{ strokeDashoffset }}
            />
          </svg>
          <span className="progress-ring-text">
            {Math.round(animatedProgress)}%
          </span>
        </div>
      </div>
      
      <p style={{ color: '#7f8c8d', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        已完成 {completedBooks.length} / {challenge.targetBooks} 本书
      </p>
      <p style={{ color: '#95a5a6', fontSize: '0.75rem' }}>
        截止日期: {challenge.deadline}
      </p>

      {associatedBooks.length > 0 && (
        <div className="challenge-books">
          <p style={{ fontSize: '0.875rem', color: '#2C3E50', marginBottom: '0.5rem', fontWeight: '500' }}>
            关联书籍:
          </p>
          <div className="challenge-book-list">
            {associatedBooks.map(book => (
              <div 
                key={book.id} 
                className="challenge-book-item"
                title={book.title}
              >
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
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ecf0f1' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
            已完成的书籍:
          </p>
          {completedBooks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {completedBooks.map(book => (
                <div key={book.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.5rem',
                  background: '#e8f8f5',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>✓</span>
                  <span style={{ fontSize: '0.875rem' }}>{book.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#95a5a6' }}>还没有完成任何书籍</p>
          )}

          {availableBooks.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                添加到挑战:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {availableBooks.slice(0, 5).map(book => (
                  <button
                    key={book.id}
                    onClick={(e) => handleAddBook(book.id, e)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      background: '#fff8f0',
                      border: '1px solid #E67E22',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      color: '#E67E22',
                      cursor: 'pointer'
                    }}
                  >
                    + {book.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {associatedBooks.filter(b => !challenge.completedBookIds.includes(b.id)).length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                标记为完成:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {associatedBooks
                  .filter(b => !challenge.completedBookIds.includes(b.id))
                  .map(book => (
                    <button
                      key={book.id}
                      onClick={(e) => handleCompleteBook(book.id, e)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        background: '#27ae60',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ {book.title}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
