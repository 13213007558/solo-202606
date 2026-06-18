import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Recipe } from '../types';

interface RecipeDetailProps {
  user: { id: string; username: string } | null;
}

function RecipeDetail({ user }: RecipeDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      setRecipe(response.data);
      setLikes(response.data.likes);
      setIsLiked(user ? response.data.likedBy.includes(user.id) : false);
      setLoading(false);
    } catch (error) {
      console.error('加载菜谱详情失败:', error);
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    try {
      const response = await axios.post(`/api/recipes/${id}/like`, { userId: user.id });
      const { liked, likes: newLikes } = response.data;
      setIsLiked(liked);
      setLikes(newLikes);
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">😕</div>
        <p>菜谱不存在</p>
      </div>
    );
  }

  return (
    <div className="recipe-detail">
      <img
        src={recipe.imageUrl}
        alt={recipe.title}
        className="recipe-detail-image"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://picsum.photos/800/300?random';
        }}
      />
      <div className="recipe-detail-content">
        <h1 className="recipe-detail-title">{recipe.title}</h1>
        <div className="recipe-detail-author">
          👨‍🍳 {recipe.username} · {recipe.createdAt}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button
            className={`like-button ${isLiked ? 'liked' : ''} ${isAnimating ? 'animate' : ''}`}
            onClick={handleLike}
            style={{ fontSize: '1.1rem', padding: '8px 16px' }}
          >
            <span className="heart-icon" style={{ fontSize: '1.5rem' }}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span>{likes} 人点赞</span>
          </button>
        </div>

        <div className="recipe-detail-section">
          <h2 className="recipe-detail-section-title">简介</h2>
          <p style={{ color: '#666', lineHeight: '1.8' }}>{recipe.description}</p>
        </div>

        <div className="recipe-detail-section">
          <h2 className="recipe-detail-section-title">食材清单</h2>
          <div className="ingredient-list">
            {recipe.ingredients.map((ing, index) => (
              <div key={index} className="ingredient-item">
                <span style={{ fontWeight: '500', color: '#4a7c59' }}>{ing.name}</span>
                <span style={{ color: '#666', marginLeft: '8px' }}>{ing.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="recipe-detail-section">
          <h2 className="recipe-detail-section-title">制作步骤</h2>
          <ol className="step-list">
            {recipe.steps.map((step, index) => (
              <li key={index} className="step-item">
                {step.description}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
