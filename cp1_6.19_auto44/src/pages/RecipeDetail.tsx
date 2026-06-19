import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Recipe } from '../types';
import { recipeApi } from '../api';
import { useAuth, useToast } from '../App';

const RecipeDetail: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    let mounted = true;
    recipeApi
      .getRecipe(id)
      .then((r) => {
        if (!mounted) return;
        setRecipe(r);
        setLikes(r.likes);
        if (user) setLiked(r.likedBy.includes(user.id));
      })
      .catch(() => {
        if (mounted) showToast('菜谱不存在', 'error');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      showToast('请先登录', 'info');
      navigate('/login');
      return;
    }
    setBouncing(true);
    setTimeout(() => setBouncing(false), 520);
    const prev = liked;
    setLiked(!prev);
    setLikes(prev ? Math.max(0, likes - 1) : likes + 1);
    try {
      const res = await recipeApi.likeRecipe(id, user.id);
      setLikes(res.likes);
      setLiked(res.liked);
    } catch {
      setLiked(prev);
      setLikes(likes);
      showToast('操作失败', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">🍳 正在加载菜谱详情...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <div className="empty-state-text">菜谱不存在或已被删除</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>返回首页</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)}
          style={{ padding: '6px 14px', fontSize: 14 }}>← 返回</button>
      </div>
      <div className="recipe-detail">
        <div className="recipe-detail-image">
          <img src={recipe.imageUrl} alt={recipe.name} />
        </div>
        <div className="recipe-detail-content">
          <div className="recipe-detail-header">
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 className="recipe-detail-title">{recipe.name}</h1>
              <div className="recipe-detail-meta">
                <span className="recipe-detail-author">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(recipe.authorName)}`} alt="" />
                  {recipe.authorName}
                </span>
                <span>📅 {new Date(recipe.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
            <button className="like-btn" onClick={handleLike} aria-label="点赞"
              style={{ padding: '8px 18px', background: liked ? 'rgba(224, 122, 95, 0.1)' : 'var(--bg-secondary)', borderRadius: 24 }}>
              <svg
                className={'heart-icon ' + (liked ? 'liked' : 'unliked') + (bouncing ? ' heart-bounce' : '')}
                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                style={{ width: 26, height: 26 }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <span className={'like-count ' + (liked ? 'liked' : '')} style={{ fontSize: 16 }}>{likes}</span>
            </button>
          </div>
          <div className="recipe-detail-desc">{recipe.description}</div>
          <div className="detail-section">
            <h2>🥗 食材清单</h2>
            <div className="ingredients-list">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="ingredient-item">
                  <span className="ingredient-name">{ing.name}</span>
                  <span className="ingredient-amount">{ing.amount}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="detail-section">
            <h2>👨‍🍳 烹饪步骤</h2>
            <div className="steps-list">
              {recipe.steps.sort((a, b) => a.order - b.order).map((step, idx) => (
                <div key={idx} className="step-item">
                  <div className="step-number">{idx + 1}</div>
                  <div className="step-desc">{step.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
