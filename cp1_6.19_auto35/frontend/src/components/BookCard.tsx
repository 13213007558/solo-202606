import { useState } from 'react';
import { Book } from '../types';
import axios from 'axios';

interface BookCardProps {
  book: Book;
  onUpdate?: () => void;
}

const statusLabels: Record<string, string> = {
  unread: '未读',
  reading: '在读',
  read: '已读'
};

function BookCard({ book, onUpdate }: BookCardProps) {
  const [bouncingStar, setBouncingStar] = useState<number | null>(null);

  const handleRating = async (rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBouncingStar(rating);
    
    try {
      await axios.put(`/api/books/${book.id}`, {
        ...book,
        rating,
        status: 'read'
      });
      
      setTimeout(() => setBouncingStar(null), 500);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update rating:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这本书吗？')) {
      try {
        await axios.delete(`/api/books/${book.id}`);
        onUpdate?.();
      } catch (error) {
        console.error('Failed to delete book:', error);
      }
    }
  };

  return (
    <div className="book-card">
      {book.coverUrl ? (
        <img src={book.coverUrl} alt={book.title} className="book-cover" />
      ) : (
        <div className="book-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
          📖
        </div>
      )}
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <span className={`status-badge status-${book.status}`}>
          {statusLabels[book.status]}
        </span>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${book.rating && book.rating >= star ? 'filled' : ''} ${bouncingStar === star ? 'bounce' : ''}`}
              onClick={(e) => handleRating(star, e)}
            >
              ★
            </span>
          ))}
        </div>
        <button 
          className="btn btn-danger" 
          style={{ marginTop: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          onClick={handleDelete}
        >
          删除
        </button>
      </div>
    </div>
  );
}

export default BookCard;
