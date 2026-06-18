import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  tags: string[];
}

interface HomeProps {
  user: User | null;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1A1A2E',
    padding: '40px 24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#E2B714',
    marginBottom: '32px',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#16213E',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '2px solid transparent',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  },
  cardHover: {
    transform: 'scale(1.03)',
    borderColor: '#E2B714',
    boxShadow: '0 8px 24px rgba(226, 183, 20, 0.4)',
  },
  cardHidden: {
    opacity: 0,
    transform: 'translateY(20px)',
  },
  cardVisible: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: 'opacity 0.4s ease, transform 0.4s ease',
  },
  cover: {
    width: '100%',
    height: '320px',
    objectFit: 'cover',
    display: 'block',
  },
  cardBody: {
    padding: '16px',
  },
  bookTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#ffffff',
    margin: '0 0 8px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  author: {
    fontSize: '14px',
    color: '#8892B0',
    margin: '0 0 12px 0',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  stars: {
    display: 'flex',
    gap: '2px',
  },
  star: {
    fontSize: '16px',
    color: '#8892B0',
  },
  starActive: {
    fontSize: '16px',
    color: '#E2B714',
  },
  ratingValue: {
    fontSize: '14px',
    color: '#E2B714',
    fontWeight: 600,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  tag: {
    backgroundColor: 'rgba(226, 183, 20, 0.15)',
    color: '#E2B714',
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  loading: {
    textAlign: 'center',
    padding: '32px',
    color: '#8892B0',
    fontSize: '16px',
  },
  sentinel: {
    height: '1px',
  },
};

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} style={i <= Math.round(rating) ? styles.starActive : styles.star}>
        ★
      </span>
    );
  }
  return (
    <div style={styles.rating}>
      <div style={styles.stars}>{stars}</div>
      <span style={styles.ratingValue}>{rating.toFixed(1)}</span>
    </div>
  );
}

interface BookCardProps {
  book: Book;
  index: number;
  onClick: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, index, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = (index % 3) * 100;
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const cardStyle: React.CSSProperties = {
    ...styles.card,
    ...(isVisible ? styles.cardVisible : styles.cardHidden),
    ...(isHovered ? styles.cardHover : {}),
  };

  return (
    <div
      ref={cardRef}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={book.cover} alt={book.title} style={styles.cover} />
      <div style={styles.cardBody}>
        <h3 style={styles.bookTitle}>{book.title}</h3>
        <p style={styles.author}>{book.author}</p>
        <StarRating rating={book.rating} />
        <div style={styles.tags}>
          {book.tags.map((tag) => (
            <span key={tag} style={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({ user }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 6;

  const fetchBooks = useCallback(async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const params: Record<string, number> = { page: pageNum, pageSize: PAGE_SIZE };
      if (user) {
        params.userId = parseInt(user.id, 10);
      }
      const response = await axios.get('/api/recommendations', { params });
      const newBooks: Book[] = response.data.books || response.data || [];
      if (newBooks.length < PAGE_SIZE) {
        setHasMore(false);
      }
      setBooks((prev) => [...prev, ...newBooks]);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, user]);

  useEffect(() => {
    fetchBooks(1);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loading && books.length > 0) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchBooks(nextPage);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page, books.length, fetchBooks]);

  const handleCardClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{user ? '个性化推荐' : '热门推荐'}</h1>
      <div style={styles.grid}>
        {books.map((book, index) => (
          <BookCard
            key={book.id}
            book={book}
            index={index}
            onClick={() => handleCardClick(book.id)}
          />
        ))}
      </div>
      {loading && <div style={styles.loading}>加载中...</div>}
      <div ref={sentinelRef} style={styles.sentinel} />
    </div>
  );
};

export default Home;
