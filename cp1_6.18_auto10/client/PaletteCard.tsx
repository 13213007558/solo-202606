import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Palette } from './types';

interface PaletteCardProps {
  palette: Palette;
  index?: number;
  showLike?: boolean;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
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

function PaletteCard({ palette, index = 0, showLike = true }: PaletteCardProps) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(palette.likes);
  const [liked, setLiked] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [saved, setSaved] = useState(false);

  const previewColors = palette.colors.slice(0, 5);

  const handleCardClick = () => {
    navigate(`/palette/${palette.id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) return;

    setPulsing(true);
    setTimeout(() => setPulsing(false), 300);

    try {
      const response = await axios.post(`/api/palettes/${palette.id}/like`);
      setLikes(response.data.likes);
      setLiked(true);
    } catch (err) {
      console.error('点赞失败', err);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
  };

  const animationDelay = `${index * 100}ms`;

  return (
    <div
      className="palette-card card-slide-in"
      style={{ animationDelay }}
      onClick={handleCardClick}
    >
      <div className="card-thumbnail">
        {previewColors.map((color, i) => (
          <div
            key={i}
            className="thumbnail-segment"
            style={{
              backgroundColor: color,
              borderTopLeftRadius: i === 0 ? '8px' : '0',
              borderBottomLeftRadius: i === 0 ? '8px' : '0',
              borderTopRightRadius: i === previewColors.length - 1 ? '8px' : '0',
              borderBottomRightRadius: i === previewColors.length - 1 ? '8px' : '0'
            }}
          />
        ))}
      </div>

      <div className="card-content">
        <div className="card-header-row">
          <h3 className="card-title" title={palette.name}>
            {palette.name}
          </h3>
          <button
            className={`save-btn ${saved ? 'saved' : ''}`}
            onClick={handleSave}
            title={saved ? '已收藏' : '收藏'}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill={saved ? '#E94560' : 'none'}
              stroke={saved ? '#E94560' : '#EEEEEE'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>

        <div className="card-meta">
          <span className="card-author">@{palette.author}</span>
          {palette.colors.length > 5 && (
            <span className="card-color-count">
              +{palette.colors.length - 5}色
            </span>
          )}
        </div>

        {showLike && (
          <div className="card-footer">
            <button
              className={`like-btn ${pulsing ? 'like-pulse' : ''}`}
              onClick={handleLike}
              disabled={liked}
            >
              <HeartIcon filled={liked} />
              <span className="like-count">{likes}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaletteCard;
