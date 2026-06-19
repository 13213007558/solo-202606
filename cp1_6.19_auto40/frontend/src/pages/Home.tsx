import { useState, useEffect } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';
import { Book, ReadingStatus } from '../types';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | 'all'>('all');
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

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    let result = [...books];
    
    if (searchTerm) {
      result = result.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(book => book.status === statusFilter);
    }
    
    setFilteredBooks(result);
  }, [books, searchTerm, statusFilter]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get<Book[]>('/api/books');
      setBooks(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      setLoading(false);
    }
  };

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
    } catch (err) {
      console.error('Failed to add book:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">我的书架</h1>
        <p className="page-subtitle">管理你的藏书，追踪阅读进度</p>
      </div>

      <div className="filters">
        <input
          type="text"
          className="search-input"
          placeholder="搜索书名或作者..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReadingStatus | 'all')}
        >
          <option value="all">全部状态</option>
          <option value="unread">未读</option>
          <option value="reading">在读</option>
          <option value="finished">已读</option>
        </select>
      </div>

      {filteredBooks.length > 0 ? (
        <div className="books-grid">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} onUpdate={fetchBooks} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <p className="empty-state-text">
            {searchTerm || statusFilter !== 'all' ? '没有找到匹配的书籍' : '书架还是空的'}
          </p>
          <p style={{ color: '#95a5a6' }}>点击右下角按钮添加你的第一本书</p>
        </div>
      )}

      <button className="add-book-btn" onClick={() => setShowAddModal(true)}>
        +
      </button>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">添加书籍</h2>
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
                  <option value="finished">已读</option>
                </select>
              </div>
              {newBook.status !== 'unread' && (
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
              {newBook.status === 'finished' && (
                <>
                  <div className="form-group">
                    <label className="form-label">完成日期</label>
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
                      <option value="1">1星</option>
                      <option value="2">2星</option>
                      <option value="3">3星</option>
                      <option value="4">4星</option>
                      <option value="5">5星</option>
                    </select>
                  </div>
                </>
              )}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn">
                  添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
