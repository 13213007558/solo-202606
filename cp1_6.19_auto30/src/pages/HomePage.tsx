import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import WorkCard from '../components/WorkCard';
import { useAuth } from '../context/AuthContext';
import '../styles/homePage.css';

interface Work {
  id: string;
  userId: string;
  title: string;
  composer: string;
  lyricist: string;
  lyrics: string;
  audioUrl: string;
  tags: string[];
  status: string;
  likes: number;
  comments: any[];
  createdAt: string;
}

const TAGS = ['全部', '流行', '摇滚', '电子', '民谣', '古典', '爵士', '说唱'];

const HomePage = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState('全部');
  const [sortBy, setSortBy] = useState('time');
  const { user } = useAuth();
  const observerRef = useRef<HTMLDivElement>(null);

  const loadWorks = useCallback(async (pageNum: number, reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: 8,
        status: 'published',
        sortBy,
      };
      
      if (selectedTag !== '全部') {
        params.tag = selectedTag;
      }

      const response = await axios.get('/api/works', { params });
      
      if (reset) {
        setWorks(response.data.works);
      } else {
        setWorks(prev => [...prev, ...response.data.works]);
      }
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error('Failed to load works:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, selectedTag, sortBy]);

  useEffect(() => {
    setWorks([]);
    setPage(1);
    setHasMore(true);
    loadWorks(1, true);
  }, [selectedTag, sortBy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && works.length > 0) {
          setPage(prev => {
            const nextPage = prev + 1;
            loadWorks(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, works.length, loadWorks]);

  return (
    <div className="home-page">
      <div className="container">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              发现独立音乐的
              <span className="highlight">无限可能</span>
            </h1>
            <p className="hero-subtitle">
              汇聚优质原创音乐作品，展示你的创作才华
            </p>
            {user ? (
              <Link to="/create" className="btn btn-primary btn-lg">
                发布你的第一个作品
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                立即加入
              </Link>
            )}
          </div>
          <div className="hero-decorations">
            <div className="floating-note note-1">🎵</div>
            <div className="floating-note note-2">🎸</div>
            <div className="floating-note note-3">🎹</div>
            <div className="floating-note note-4">🎤</div>
          </div>
        </section>

        <section className="works-section">
          <div className="section-header">
            <h2 className="section-title">作品广场</h2>
            
            <div className="filter-controls">
              <div className="sort-select">
                <label>排序：</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="time">最新发布</option>
                  <option value="popular">最受欢迎</option>
                </select>
              </div>
            </div>
          </div>

          <div className="tag-filter">
            {TAGS.map((tag) => (
              <button
                key={tag}
                className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {works.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎶</div>
              <h3>暂无作品</h3>
              <p>还没有{selectedTag !== '全部' ? selectedTag + '类' : ''}作品发布</p>
              {user && (
                <Link to="/create" className="btn btn-primary">
                  发布你的第一个作品
                </Link>
              )}
            </div>
          ) : (
            <div className="works-grid">
              {works.map((work, index) => (
                <WorkCard key={work.id} work={work} delay={index * 50} />
              ))}
            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          )}

          <div ref={observerRef} style={{ height: '20px' }} />
          
          {!hasMore && works.length > 0 && (
            <div className="end-message">
              <p>已加载全部作品</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
