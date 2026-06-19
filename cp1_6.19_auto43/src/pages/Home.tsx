import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Exhibition } from '../types';
import ExhibitionCard from '../components/ExhibitionCard';
import './Home.css';

const Home = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const res = await axios.get('/api/exhibitions');
        setExhibitions(res.data);
      } catch (err) {
        console.error('Failed to fetch exhibitions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  const filteredExhibitions = exhibitions.filter(exh => {
    if (filter === 'all') return true;
    return exh.status === filter;
  });

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'ongoing', label: '进行中' },
    { key: 'upcoming', label: '即将开始' },
    { key: 'ended', label: '已结束' }
  ];

  return (
    <div className="page-container home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            探索<span className="highlight">艺术</span>的无限可能
          </h1>
          <p className="hero-subtitle">
            走进虚拟博物馆，发现世界各地的精彩展览
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{exhibitions.length}</span>
              <span className="stat-label">展览</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">
                {exhibitions.filter(e => e.status === 'ongoing').length}
              </span>
              <span className="stat-label">进行中</span>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="deco-circle circle-1"></div>
          <div className="deco-circle circle-2"></div>
          <div className="deco-circle circle-3"></div>
        </div>
      </section>

      <section className="exhibition-section">
        <div className="section-header">
          <h2 className="section-title">展览广场</h2>
          <div className="filter-tabs">
            {filters.map(f => (
              <button
                key={f.key}
                className={`filter-tab ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : filteredExhibitions.length === 0 ? (
          <div className="empty-state card">
            <p className="empty-text">暂无展览</p>
          </div>
        ) : (
          <div className="exhibition-grid">
            {filteredExhibitions.map(exhibition => (
              <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
