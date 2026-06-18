import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  userId?: string;
  onLikeChange?: (recipeId: string, likes: number, liked: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
}

function RecipeCard({ recipe, userId, onLikeChange, style, className = '' }: RecipeCardProps) {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(recipe.likes);
  const [isLiked, setIsLiked] = useState(userId ? recipe.likedBy.includes(userId) : false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) {
      navigate('/login');
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    try {
      const response = await axios.post(`/api/recipes/${recipe.id}/like`, { userId });
      const { liked, likes: newLikes } = response.data;
      setIsLiked(liked);
      setLikes(newLikes);
      if (onLikeChange) {
        onLikeChange(recipe.id, newLikes, liked);
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  };

  const displayIngredients = recipe.ingredients.slice(0, 4);

  return (
    <div
      className={`recipe-card ${className}`}
      style={style}
      onClick={handleClick}
    >
      <img
        src={recipe.imageUrl}
        alt={recipe.title}
        className="recipe-card-image"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?random';
        }}
      />
      <div className="recipe-card-content">
        <h3 className="recipe-card-title">{recipe.title}</h3>
        <p className="recipe-card-description">{recipe.description}</p>
        <div className="recipe-card-tags">
          {displayIngredients.map((ing, index) => (
            <span key={index} className="ingredient-tag">
              {ing.name}
            </span>
          ))}
          {recipe.ingredients.length > 4 && (
            <span className="ingredient-tag" style={{ background: '#999' }}>
              +{recipe.ingredients.length - 4}
            </span>
          )}
        </div>
        <div className="recipe-card-footer">
          <span style={{ fontSize: '0.85rem', color: '#999' }}>
            {recipe.username}
          </span>
          <button
            className={`like-button ${isLiked ? 'liked' : ''} ${isAnimating ? 'animate' : ''}`}
            onClick={handleLike}
          >
            <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span>
            <span>{likes}</span>
  </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;
