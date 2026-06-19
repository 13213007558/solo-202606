import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onUpdate?: () => void;
}

const statusLabels: Record<string, string> = {
  unread: '未读',
  reading: '在读',
  finished: '已读'
};

export default function BookCard({ book, onUpdate }: BookCardProps) {
  const navigate = useNavigate();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.rating-stars')) {
      e.stopPropagation();
      return;
    }
    navigate(`/book/${book.id}`);
  };

  const handleRatingClick = async (rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.put(`/api/books/${book.id}`, {
        ...book,
        rating
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update rating:', err);
    }
  };

  const progress = book.status === 'reading' && book.currentPage
    ? (book.currentPage / book.totalPages) * 100
    : book.status === 'finished'
    ? 100
    : 0;

  return (
    <div className="book-card" onClick={handleClick}>
      <div className="book-cover">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} loading="lazy" />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#95a5a6',
            fontSize: '2rem'
          }}>
            📖
          </div>
        )}
      </div>
      <h3 className="book-title" title={book.title}>{book.title}</h3>
      <p className="book-author">{book.author}</p>
      <span className={`status-tag status-${book.status}`}>
        {statusLabels[book.status]}
      </span>
      
      {(book.status === 'reading' || book.status === 'finished') && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {book.status === 'finished' && (
        <div 
          className="rating-stars"
          onClick={(e) => e.stopPropagation()}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${(hoveredRating || book.rating || 0) >= star ? 'filled' : ''}`}
              onClick={(e) => handleRatingClick(star, e)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
            >
              ★
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
