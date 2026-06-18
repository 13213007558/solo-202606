import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Book, ReadingStatus } from '../types';
import BookCard from '../components/BookCard';

function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    coverUrl: '',
    totalPages: '',
    status: 'unread' as ReadingStatus,
    startDate: '',
    endDate: '',
    rating: ''
  });

  const fetchBooks = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      
      const res = await axios.get('/api/books', { params });
      setBooks(res.data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/books', newBook);
      setNewBook({
        title: '',
        author: '',
        coverUrl: '',
        totalPages: '',
        status: 'unread',
        startDate: '',
        endDate: '',
        rating: ''
      });
      setShowAddModal(false);
      fetchBooks();
    } catch (error) {
      console.error('Failed to add book:', error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">我的书架</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + 添加书籍
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="搜索书名或作者..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="select-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">全部状态</option>
          <option value="unread">未读</option>
          <option value="reading">在读</option>
          <option value="read">已读</option>
        </select>
      </div>

      {books.length > 0 ? (
        <div className="grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onUpdate={fetchBooks} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <p>暂无书籍，点击上方按钮添加第一本书吧！</p>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">添加新书籍</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAddBook}>
              <div className="form-group">
                <label className="form-label">书名 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">作者 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">封面图片URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={newBook.coverUrl}
                  onChange={(e) => setNewBook({ ...newBook, coverUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">总页数 *</label>
                <input
                  type="number"
                  className="form-input"
                  value={newBook.totalPages}
                  onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">阅读状态</label>
                <select
                  className="form-input"
                  value={newBook.status}
                  onChange={(e) => setNewBook({ ...newBook, status: e.target.value as ReadingStatus })}
                >
                  <option value="unread">未读</option>
                  <option value="reading">在读</option>
                  <option value="read">已读</option>
                </select>
              </div>
              {(newBook.status === 'reading' || newBook.status === 'read') && (
                <div className="form-group">
                  <label className="form-label">开始阅读日期</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newBook.startDate}
                    onChange={(e) => setNewBook({ ...newBook, startDate: e.target.value })}
                  />
                </div>
              )}
              {newBook.status === 'read' && (
                <>
                  <div className="form-group">
                    <label className="form-label">阅读结束日期</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newBook.endDate}
                      onChange={(e) => setNewBook({ ...newBook, endDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">个人评分 (1-5星)</label>
                    <select
                      className="form-input"
                      value={newBook.rating}
                      onChange={(e) => setNewBook({ ...newBook, rating: e.target.value })}
                    >
                      <option value="">选择评分</option>
                      <option value="1">⭐ 1星</option>
                      <option value="2">⭐⭐ 2星</option>
                      <option value="3">⭐⭐⭐ 3星</option>
                      <option value="4">⭐⭐⭐⭐ 4星</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5星</option>
                    </select>
                  </div>
                </>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  添加书籍
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
