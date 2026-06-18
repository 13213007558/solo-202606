import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Performance } from '../types';
import PerformanceTimeline from '../components/PerformanceTimeline';

export default function Performances() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        const response = await axios.get('/api/performances');
        setPerformances(response.data);
      } catch (error) {
        console.error('加载演出信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformances();
  }, []);

  const filteredPerformances = performances.filter((perf) => {
    const date = new Date(perf.date);
    const now = new Date();
    if (filter === 'upcoming') return date >= now;
    if (filter === 'past') return date < now;
    return true;
  });

  const upcomingCount = performances.filter((p) => new Date(p.date) >= new Date()).length;
  const pastCount = performances.filter((p) => new Date(p.date) < new Date()).length;

  return (
    <div className="container timeline-page">
      <div className="hero-section" style={{ paddingBottom: '24px' }}>
        <h1 className="hero-title" style={{ fontSize: '2rem' }}>
          演出时间线
        </h1>
        <p className="hero-subtitle" style={{ marginBottom: '16px' }}>
          关注音乐人动态，不错过每一场精彩演出
        </p>
      </div>

      <div className="tabs" style={{ justifyContent: 'center', marginBottom: '32px' }}>
        <button
          className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 ({performances.length})
        </button>
        <button
          className={`tab-btn ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          即将到来 ({upcomingCount})
        </button>
        <button
          className={`tab-btn ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          已结束 ({pastCount})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <PerformanceTimeline performances={filteredPerformances} />
      )}
    </div>
  );
}
