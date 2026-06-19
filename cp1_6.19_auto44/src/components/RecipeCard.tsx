import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../types';
import { recipeApi } from '../api';
import { useAuth, useToast } from '../App';

interface Props {
  recipe: Recipe;
  onLikeUpdate?: (id: string, likes: number, liked: boolean) => void;
}

const TAG_COLORS = [
  '#E07A5F',
  '#4A7C59',
  '#81B29A',
  '#F2CC8F',
  '#C17C74',
  '#76B5C5',
  '#9B5DE5',
  '#F15BB5'
];

const HeartIcon: React.FC<{ liked: boolean; bounce: boolean }> = ({ liked, bounce }) => {
  const cls = 'heart-icon ' + (liked ? 'liked' : 'unliked') + (bounce ? ' heart-bounce' : '');
  return (
    <svg
      className={cls}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

const RecipeCard: React.FC<Props> = ({ recipe, onLikeUpdate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bounce, setBounce] = useState(false);
  const [localLikes, setLocalLikes] = useState(recipe.likes);

  const liked = useMemo(() => {
    if (!user) return false;
    return recipe.likedBy.includes(user.id);
  }, [recipe.likedBy, user]);

  const tagColors = useMemo(() => {
    return recipe.ingredients.slice(0, 4).map(
      (_, idx) => TAG_COLORS[hashString(recipe.id + idx) % TAG_COLORS.length]
    );
  }, [recipe.id, recipe.ingredients]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.like-btn')) return;
    navigate(`/recipe/${recipe.id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast('请先登录后再点赞', 'info');
      navigate('/login');
      return;
    }
    setBounce(true);
    setTimeout(() => setBounce(false), 520);

    const newLiked = !liked;
    const optimisticLikes = newLiked ? localLikes + 1 : Math.max(0, localLikes - 1);
    setLocalLikes(optimisticLikes);

    try {
      const res = await recipeApi.likeRecipe(recipe.id, user.id);
      setLocalLikes(res.likes);
      if (onLikeUpdate) onLikeUpdate(recipe.id, res.likes, res.liked);
      if (res.liked) {
        recipe.likedBy.push(user.id);
      } else {
        recipe.likedBy = recipe.likedBy.filter((id) => id !== user.id);
      }
    } catch (err) {
      setLocalLikes(localLikes);
      showToast('操作失败，请稍后重试', 'error');
    }
  };

  return (
    <div className="recipe-card" onClick={handleCardClick}>
      <div className="recipe-card-image">
        <img src={recipe.imageUrl} alt={recipe.name} loading="lazy" />
      </div>
      <div className="recipe-card-body">
        <div>
          <div className="recipe-card-title">{recipe.name}</div>
          <div className="recipe-card-author">— by {recipe.authorName}</div>
        </div>
        <div className="recipe-card-desc">{recipe.description}</div>
        <div className="recipe-card-tags">
          {recipe.ingredients.slice(0, 4).map((ing, idx) => (
            <span
              key={idx}
              className="ingredient-tag"
              style={{ background: tagColors[idx] }}
            >
              {ing.name}
            </span>
          ))}
          {recipe.ingredients.length > 4 && (
            <span
              className="ingredient-tag"
              style={{ background: '#999' }}
            >
              +{recipe.ingredients.length - 4}
            </span>
          )}
        </div>
      </div>
      <div className="recipe-card-footer">
        <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
          📅 {formatDate(recipe.createdAt)}
        </span>
        <button className="like-btn" onClick={handleLike} aria-label="点赞">
          <HeartIcon liked={liked} bounce={bounce} />
          <span className={'like-count' + (liked ? ' liked' : '')}>
            {localLikes}
          </span>
        </button>
      </div>
    </div>
  );
};

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return '';
  }
}

export default RecipeCard;
