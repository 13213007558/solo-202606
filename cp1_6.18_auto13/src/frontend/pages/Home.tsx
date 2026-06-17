import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StarRating from '../components/StarRating';
import { Book, User } from '../types';

interface HomeProps {
  user: User | null;
  onLogin: () => void;
}

function Home({ user, onLogin }: HomeProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const fetchBooks = useCallback(async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.get('/api/recommendations', {
        params: { page: pageNum, limit: 12 },
      });
      const newBooks = response.data.books;
      if (pageNum === 1) {
        setBooks(newBooks);
      } else {
        setBooks(prev => [...prev, ...newBooks]);
      }
      setHasMore(newBooks.length === 12);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchBooks(1);
  }, []);

  const handleCardVisible = useCallback((bookId: string) => {
    setVisibleCards(prev => {
      if (prev.has(bookId)) return prev;
      const newSet = new Set(prev);
      newSet.add(bookId);
      return newSet;
    });
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const bookId = entry.target.getAttribute("data-book-id");
          if (bookId && entry.isIntersecting) {
            handleCardVisible(bookId);
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );
    const observer = observerRef.current;
    cardRefs.current.forEach(card => {
      if (card) observer.observe(card);
    });
    return () => {
      observer.disconnect();
    };
  }, [books, handleCardVisible]);


  useEffect(() => {
    const loadObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) {
      loadObserver.observe(loadMoreRef.current);
    }
    return () => {
      loadObserver.disconnect();
    };
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchBooks(page);
    }
  }, [page, fetchBooks]);

  const setCardRef = (bookId: string) => (el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(bookId, el);
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    } else {
      cardRefs.current.delete(bookId);
    }
  };

  const handleCardClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };


  return (
    <div className="home-page">
      <div className="page-header">
        <h1>推荐书籍</h1>
        <p>发现你的下一本好书</p>
      </div>

      <div className="waterfall-container">
        {books.map((book, index) => (
          <div
            key={book.id}
            ref={setCardRef(book.id)}
            data-book-id={book.id}
            className={`book-card ${visibleCards.has(book.id) ? "is-visible" : ""}`}
            style={{ animationDelay: `${(index % 12) * 0.1}s` }}
            onClick={() => handleCardClick(book.id)}
          >
            <div className="book-cover">
              <img src={book.cover} alt={book.title} />
            </div>
            <div className="book-info">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">{book.author}</p>


              <div className="book-rating">
                <StarRating rating={book.rating} size="sm" />
                <span className="rating-count">{book.reviewCount} 条评价</span>
              </div>
              <div className="book-tags">
                {book.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="book-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div ref={loadMoreRef} className="load-more">
        {loading && <div className="loading-spinner">加载中...</div>}
        {!hasMore && books.length > 0 && (
          <div className="no-more">没有更多了</div>
        )}
      </div>
    </div>
  );
}

export default Home;

