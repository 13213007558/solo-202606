import { useState, useEffect } from 'react';
import axios from 'axios';
import ExhibitionCard from '../components/ExhibitionCard';
import type { Exhibition } from '../types';

export default function HomePage() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'ended'>('all');

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/exhibitions');
      setExhibitions(res.data);
    } catch (error) {
      console.error('获取展览列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExhibitions = filter === 'all' 
    ? exhibitions 
    : exhibitions.filter(e => e.status === filter);

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'ongoing', label: '进行中' },
    { key: 'upcoming', label: '即将开始' },
    { key: 'ended', label: '已结束' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero 区域 */}
      <div style={{
        textAlign: 'center',
        padding: '40px 0 30px',
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}>
          探索精彩展览
        </h1>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6',
        }}>
          足不出户，畅游世界各地的博物馆展览。精选优质展览，在线预约，即刻开启您的艺术之旅。
        </p>
      </div>

      {/* 筛选标签 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              backgroundColor: filter === f.key ? 'var(--accent-amber)' : 'transparent',
              color: filter === f.key ? '#1A202C' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: filter === f.key ? '600' : '400',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 展览卡片网格 */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          color: 'var(--text-secondary)',
        }}>
          加载中...
        </div>
      ) : filteredExhibitions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          color: 'var(--text-secondary)',
        }}>
          暂无展览
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {filteredExhibitions.map(exhibition => (
            <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
          ))}
        </div>
      )}

      {/* 响应式样式 */}
      <style>{`
        @media (max-width: 768px) {
          .exhibition-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .exhibition-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
