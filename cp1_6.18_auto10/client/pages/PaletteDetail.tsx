import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Palette } from '../types';

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill={filled ? '#E94560' : 'none'}
      stroke="#E94560"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    resolve();
  });
}

function PaletteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [palette, setPalette] = useState<Palette | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchPalette = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/palettes/${id}`);
        setPalette(response.data);
        setLikes(response.data.likes);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('配色方案不存在或已被删除');
        } else {
          setError('加载失败，请稍后重试');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPalette();
  }, [id]);

  const handleLike = async () => {
    if (!palette || liked) return;

    setPulsing(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPulsing(true);
        setTimeout(() => setPulsing(false), 320);
      });
    });

    try {
      const response = await axios.post(`/api/palettes/${palette.id}/like`);
      const updated = response.data;
      setPalette(updated);
      setLikes(updated.likes);
      setLiked(true);
    } catch (err) {
      console.error('点赞失败', err);
    }
  };

  const handleCopyColor = async (hex: string, index: number) => {
    try {
      await copyToClipboard(hex);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error('复制失败', err);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载方案详情中...</p>
        </div>
      </div>
    );
  }

  if (error || !palette) {
    return (
      <div className="detail-page">
        <div className="error-state">
          <h2>{error || '加载失败'}</h2>
          <div className="error-actions">
            <button className="btn btn-secondary" onClick={handleBack}>
              返回上一页
            </button>
            <Link to="/gallery" className="btn btn-primary">
              回到广场
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-nav">
        <button className="back-btn" onClick={handleBack}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          返回
        </button>
      </div>

      <div className="detail-header">
        <div className="detail-title-area">
          <h1 className="detail-title">{palette.name}</h1>
          <div className="detail-meta">
            <span className="detail-author">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              @{palette.author}
            </span>
            <span className="detail-date">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {formatDate(palette.createdAt)}
            </span>
          </div>
        </div>

        <div className="detail-actions">
          <button
            className={`like-btn-large ${pulsing ? 'like-pulse' : ''}`}
            onClick={handleLike}
            disabled={liked}
          >
            <HeartIcon filled={liked} />
            <span className="like-count-large">{likes}</span>
            <span className="like-text">{liked ? '已点赞' : '点赞'}</span>
          </button>
        </div>
      </div>

      <div className="detail-preview-section">
        <div className="detail-preview-bar">
          {palette.colors.map((color, index) => (
            <div
              key={index}
              className="detail-preview-segment"
              style={{ backgroundColor: color }}
              title={color}
            >
              <span className="detail-preview-label">{color}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-table-section">
        <h2 className="section-title">颜色详情</h2>
        <div className="colors-table">
          <div className="table-header">
            <div className="col-swatch">色样</div>
            <div className="col-hex">十六进制值</div>
            <div className="col-weight">视觉权重</div>
          </div>
          {palette.colorWeights.map((cw, index) => (
            <div
              key={index}
              className="table-row"
              onClick={() => handleCopyColor(cw.hex, index)}
              title="点击复制"
            >
              <div className="col-swatch">
                <div
                  className="large-swatch"
                  style={{ backgroundColor: cw.hex }}
                />
              </div>
              <div className="col-hex">
                <span className="hex-value">{cw.hex}</span>
                {copiedIndex === index && (
                  <span className="copied-badge">已复制!</span>
                )}
              </div>
              <div className="col-weight">
                <div className="weight-display">
                  <div className="weight-bar-bg">
                    <div
                      className="weight-bar-fill"
                      style={{ width: `${cw.weight * 10}%` }}
                    />
                  </div>
                  <span className="weight-value">{cw.weight}/10</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PaletteDetail;
