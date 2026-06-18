import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Challenge, Book } from '../types';
import ChallengeCard from '../components/ChallengeCard';

function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    name: '',
    targetBooks: '',
    deadline: ''
  });

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await axios.get('/api/challenges');
      setChallenges(res.data);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await axios.get('/api/books');
      setBooks(res.data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
    fetchBooks();
  }, [fetchChallenges, fetchBooks]);

  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/challenges', newChallenge);
      setNewChallenge({
        name: '',
        targetBooks: '',
        deadline: ''
      });
      setShowAddModal(false);
      fetchChallenges();
    } catch (error) {
      console.error('Failed to add challenge:', error);
    }
  };

  const presetChallenges = [
    { name: '30天读完3本书', targetBooks: 3, deadline: getFutureDate(30) },
    { name: '挑战1000页', targetBooks: 5, deadline: getFutureDate(90) },
    { name: '每月读一本书', targetBooks: 12, deadline: getFutureDate(365) },
    { name: '2026年度阅读计划', targetBooks: 24, deadline: '2026-12-31' }
  ];

  function getFutureDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  const handlePresetChallenge = (preset: typeof presetChallenges[0]) => {
    setNewChallenge({
      ...preset,
      targetBooks: preset.targetBooks.toString()
    });
    setShowAddModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">读书挑战</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + 发起新挑战
        </button>
      </div>

      {challenges.length > 0 ? (
        <div className="grid">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              books={books}
              onUpdate={() => {
                fetchChallenges();
                fetchBooks();
              }}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <p>暂无挑战，选择下方预置挑战或发起自定义挑战吧！</p>
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
          推荐挑战
        </h2>
        <div className="grid">
          {presetChallenges.map((preset, index) => (
            <div
              key={index}
              className="challenge-card"
              onClick={() => handlePresetChallenge(preset)}
            >
              <h3 className="challenge-title">{preset.name}</h3>
              <p className="challenge-deadline">目标：{preset.targetBooks} 本书</p>
              <p className="challenge-deadline">截止日期：{preset.deadline}</p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '1rem', width: '100%' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePresetChallenge(preset);
                }}
              >
                参与挑战
              </button>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">发起新挑战</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
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
                <button type="submit" className="btn btn-primary">
                  发起挑战
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Challenges;
