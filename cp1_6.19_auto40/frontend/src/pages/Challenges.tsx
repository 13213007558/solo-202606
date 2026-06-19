import { useState, useEffect } from 'react';
import axios from 'axios';
import ChallengeCard from '../components/ChallengeCard';
import { Challenge, Book } from '../types';

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    targetBooks: '',
    deadline: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [challengesRes, booksRes] = await Promise.all([
        axios.get<Challenge[]>('/api/challenges'),
        axios.get<Book[]>('/api/books')
      ]);
      setChallenges(challengesRes.data);
      setBooks(booksRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLoading(false);
    }
  };

  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/challenges', newChallenge);
      setNewChallenge({ name: '', targetBooks: '', deadline: '' });
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      console.error('Failed to add challenge:', err);
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
        <h1 className="page-title">读书挑战</h1>
        <p className="page-subtitle">参与有趣的挑战，保持阅读动力</p>
      </div>

      {challenges.length > 0 ? (
        <div className="challenges-grid">
          {challenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              allBooks={books}
              onUpdate={fetchData}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <p className="empty-state-text">还没有任何挑战</p>
          <p style={{ color: '#95a5a6' }}>点击右下角按钮创建你的第一个挑战</p>
        </div>
      )}

      <button className="add-book-btn" onClick={() => setShowAddModal(true)}>
        +
      </button>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">发起新挑战</h2>
            <form onSubmit={handleAddChallenge}>
              <div className="form-group">
                <label className="form-label">挑战名称 *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newChallenge.name}
                  onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                  placeholder="例如：30天读完3本书"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">目标书籍数量 *</label>
                <input
                  type="number"
                  className="form-input"
                  value={newChallenge.targetBooks}
                  onChange={(e) => setNewChallenge({ ...newChallenge, targetBooks: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">截止日期 *</label>
                <input
                  type="date"
                  className="form-input"
                  value={newChallenge.deadline}
                  onChange={(e) => setNewChallenge({ ...newChallenge, deadline: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn">
                  创建挑战
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
