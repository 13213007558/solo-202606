import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import PaletteCard from '../PaletteCard';
import { Palette } from '../types';

type SortType = 'newest' | 'popular';

function PaletteGallery() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortType>('newest');
  const [error, setError] = useState<string | null>(null);

  const fetchPalettes = useCallback(async (sortType: SortType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/palettes?sort=${sortType}`);
      setPalettes(response.data);
    } catch (err) {
      setError('加载配色方案失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPalettes(sort);
  }, [sort, fetchPalettes]);

  const handleSortChange = (sortType: SortType) => {
    if (sortType !== sort) {
      setSort(sortType);
    }
  };

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <div>
          <h1 className="gallery-title">方案广场</h1>
          <p className="gallery-subtitle">
            探索社区精选的 {palettes.length} 个配色灵感
          </p>
        </div>
        <div className="sort-controls">
          <button
            className={`sort-btn ${sort === 'newest' ? 'sort-active' : ''}`}
            onClick={() => handleSortChange('newest')}
          >
            最新
          </button>
          <button
            className={`sort-btn ${sort === 'popular' ? 'sort-active' : ''}`}
            onClick={() => handleSortChange('popular')}
          >
            最热
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => fetchPalettes(sort)}>
            重新加载
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载配色方案中...</p>
        </div>
      ) : palettes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            {['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'].map((c, i) => (
              <div
                key={i}
                className="empty-swatch"
                style={{ backgroundColor: c, animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <h2 className="empty-title">暂无配色方案</h2>
          <p className="empty-desc">快去编辑器创建第一个配色方案吧！</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {palettes.map((palette, index) => (
            <div key={palette.id} className="masonry-item">
              <PaletteCard palette={palette} index={index} showLike={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaletteGallery;
