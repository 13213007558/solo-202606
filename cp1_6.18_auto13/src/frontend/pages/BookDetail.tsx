import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { marked } from "marked";
import StarRating from "../components/StarRating";
import { Book, Review, User } from "../types";

interface BookDetailProps {
  user: User | null;
  onLogin: () => void;
}

function BookDetail({ user, onLogin }: BookDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);

  const fetchBook = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await axios.get("/api/books/" + id);
      setBook(data);
    } catch (err) {
      console.error("Failed to fetch book:", err);
    }
  }, [id]);

  const fetchSimilarBooks = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await axios.get("/api/books/" + id + "/similar");
      setSimilarBooks(data.books.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch similar books:", err);
    }
  }, [id]);

  const fetchReviews = useCallback(async (pageNum: number) => {
    if (!id || loadingReviews) return;
    setLoadingReviews(true);
    try {
      const { data } = await axios.get("/api/reviews", {
        params: { bookId: id, page: pageNum, limit: 10 },
      });
      const newReviews = data.reviews;
      if (pageNum === 1) {
        setReviews(newReviews);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }
      setHasMoreReviews(newReviews.length === 10);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  }, [id, loadingReviews]);

  useEffect(() => {
    fetchBook();
    fetchSimilarBooks();
    fetchReviews(1);
  }, [fetchBook, fetchSimilarBooks, fetchReviews]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreReviews && !loadingReviews) {
          setReviewPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMoreReviews, loadingReviews]);

  useEffect(() => {
    if (reviewPage > 1) fetchReviews(reviewPage);
  }, [reviewPage, fetchReviews]);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    if (value.length > 0) {
      const allTags = book?.tags || [];
      const suggestions = allTags.filter(
        tag => tag.toLowerCase().includes(value.toLowerCase()) && !selectedTags.includes(tag)
      ).slice(0, 5);
      setTagSuggestions(suggestions);
      setShowTagSuggestions(true);
    } else {
      setTagSuggestions([]);
      setShowTagSuggestions(false);
    }
  };

  const addTag = (tag: string) => {
    if (selectedTags.length < 5 && !selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
    setTagInput("");
    setTagSuggestions([]);
    setShowTagSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onLogin();
      return;
    }
    if (!newContent.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post("/api/reviews", {
        bookId: id,
        rating: newRating,
        content: newContent,
        tags: selectedTags,
      });
      setReviews(prev => [data, ...prev]);
      setNewContent("");
      setNewRating(5);
      setSelectedTags([]);
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!book) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="book-detail-page">
      <div className="book-detail-main">
        <div className="book-header">
          <div className="book-cover-large">
            <img src={book.cover} alt={book.title} />
          </div>
          <div className="book-meta">
            <h1 className="book-title">{book.title}</h1>
            <p className="book-author">作者：{book.author}</p>
            <div className="book-rating-section">
              <StarRating rating={book.rating} size="lg" />
              <span className="rating-score">{book.rating.toFixed(1)}</span>
              <span className="review-count">{book.reviewCount} 条评价</span>
            </div>
            <div className="book-tags">
              {book.tags.map(tag => (
                <span key={tag} className="book-tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="book-description">
          <h2>简介</h2>
          <p>{book.description}</p>
        </div>

        <div className="review-form-section">
          <h2>写书评</h2>
          {user ? (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-row">
                <label>评分</label>
                <StarRating rating={newRating} interactive onRate={setNewRating} size="md" />
              </div>
              <div className="form-row">
                <label>标签</label>
                <div className="tag-input-container">
                  <div className="selected-tags">
                    {selectedTags.map(tag => (
                      <span key={tag} className="selected-tag">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)}>×</button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    onFocus={() => tagInput && setShowTagSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                    placeholder="添加标签（最多5个）"
                    className="tag-input"
                  />
                  {showTagSuggestions && tagSuggestions.length > 0 && (
                    <div className="tag-suggestions">
                      {tagSuggestions.map(tag => (
                        <div key={tag} className="tag-suggestion-item" onMouseDown={() => addTag(tag)}>
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <label>书评内容（支持 Markdown）</label>
                <div className="markdown-editor">
                  <textarea
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="写下你的书评..."
                    rows={6}
                  />
                  <div className="markdown-preview">
                    <h4>预览</h4>
                    <div className="preview-content" dangerouslySetInnerHTML={{ __html: marked(newContent) || "" }} />
                  </div>
                </div>
              </div>
              <button type="submit" className="submit-review-btn" disabled={submitting}>
                {submitting ? "提交中..." : "提交书评"}
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>请先登录后再写书评</p>
              <button onClick={onLogin} className="login-btn">去登录</button>
            </div>
          )}
        </div>

        <div className="reviews-section">
          <h2>热门书评</h2>
          <div className="reviews-list">
            {reviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="review-username">{review.username}</span>
                  <StarRating rating={review.rating} size="sm" />
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="review-tags">
                  {review.tags.map(tag => (
                    <span key={tag} className="review-tag">{tag}</span>
                  ))}
                </div>
                <div className="review-content" dangerouslySetInnerHTML={{ __html: marked(review.content) }} />
              </div>
            ))}
          </div>
          <div ref={loadMoreRef} className="load-more-reviews">
            {loadingReviews && <div className="loading-spinner">加载中...</div>}
            {!hasMoreReviews && reviews.length > 0 && <div className="no-more">没有更多评论了</div>}
          </div>
        </div>
      </div>

      <aside className="similar-books-sidebar">
        <h3>相似书籍</h3>
        <div className="similar-books-list">
          {similarBooks.map(similarBook => (
            <div
              key={similarBook.id}
              className="similar-book-item"
              onClick={() => navigate("/book/" + similarBook.id)}
              onMouseEnter={() => setHoveredBook(similarBook.id)}
              onMouseLeave={() => setHoveredBook(null)}
            >
              <img src={similarBook.cover} alt={similarBook.title} />
              <div className="similar-book-info">
                <p className="similar-book-title">{similarBook.title}</p>
                <StarRating rating={similarBook.rating} size="sm" />
              </div>
              {hoveredBook === similarBook.id && (
                <div className="book-tooltip">
                  <h4>{similarBook.title}</h4>
                  <p>{similarBook.author}</p>
                  <p className="tooltip-rating">评分：{similarBook.rating.toFixed(1)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default BookDetail;
