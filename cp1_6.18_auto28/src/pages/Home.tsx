import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import WorkCard from '../components/WorkCard';
import type { Work } from '../types';

export default function Home() {
  const [works, setWorks] = useState<Work[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const loaderRef = useRef<HTMLDivElement>(null);

  const tags = ['流行', '摇滚', '电子', '民谣', '古典', '爵士', '嘻哈', 'RnB'];

  const loadWorks = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: 8,
        status: 'published',
        sortBy,
      };
      if (filterTag) {
        params.tag = filterTag;
      }

      const response = await axios.get('/api/works', { params });
      if (page === 1) {
        setWorks(response.data.works);
      } else {
        setWorks((prev) => [...prev, ...response.data.works]);
      }
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error('加载作品失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filterTag, sortBy, loading, hasMore]);

  useEffect(() => {
    setWorks([]);
    setPage(1);
    setHasMore(true);
  }, [filterTag, sortBy]);

  useEffect(() => {
    loadWorks();
  }, [page, loadWorks]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div className="container">
      <div className="hero-section">
        <h1 className="hero-title">发现优秀的独立音乐人</h1>
        <p className="hero-subtitle">
          在这里，每一首原创作品都值得被听见。展示你的音乐，连接你的粉丝。
        </p>
        <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 32px' }}>
          开始创作
        </Link>
      </div>

      <div className="works-header">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>热门作品</h2>
        <div className="works-filters">
          <select
            className="filter-select"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
          >
            <option value="">全部风格</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">最新发布</option>
            <option value="popular">最受欢迎</option>
          </select>
        </div>
      </div>

      {works.length === 0 && !loading ? (
        <div className="empty-state">
          <div className="empty-state-illustration">🎵</div>
          <h3 className="empty-state-title">还没有作品</h3>
          <p className="empty-state-desc">
            {filterTag ? '该风格下暂无作品，换个风格看看吧' : '快来发布你的第一个作品吧'}
          </p>
          <Link to="/create" className="btn btn-primary">
            发布你的第一个作品
          </Link>
        </div>
      ) : (
        <>
          <div className="works-grid">
            {works.map((work, index) => (
              <WorkCard key={work.id} work={work} index={index} />
            ))}
          </div>

          <div ref={loaderRef} className="load-more" style={{ minHeight: '60px' }}>
            {loading && <div className="spinner"></div>}
            {!hasMore && works.length > 0 && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                没有更多了
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
