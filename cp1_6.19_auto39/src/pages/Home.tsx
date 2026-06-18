import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import type { Recipe, Challenge } from '../types';

interface HomeProps {
  user: { id: string; username: string } | null;
}

function Home({ user }: HomeProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecipes();
    loadActiveChallenge();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await axios.get('/api/recipes');
      setRecipes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('加载菜谱失败:', error);
      setLoading(false);
    }
  };

  const loadActiveChallenge = async () => {
    try {
      const response = await axios.get('/api/challenges/active');
      if (response.data.length > 0) {
        setChallenge(response.data[0]);
      }
    } catch (error) {
      console.error('加载挑战失败:', error);
    }
  };

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim().length > 0) {
      try {
        const response = await axios.get(`/api/recipes?search=${encodeURIComponent(value)}`);
        setSuggestions(response.data.slice(0, 8));
        setShowDropdown(true);
      } catch (error) {
        console.error('搜索失败:', error);
      }
    } else {
      setSuggestions([]);
      setShowDropdown(false);
      loadRecipes();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      axios
        .get(`/api/recipes?search=${encodeURIComponent(searchQuery)}`)
        .then(response => setRecipes(response.data))
        .catch(error => console.error('搜索失败:', error));
    } else {
      loadRecipes();
    }
  };

  const handleSuggestionClick = (recipe: Recipe) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/recipe/${recipe.id}`);
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleLikeChange = (recipeId: string, likes: number) => {
    setRecipes(prev =>
      prev
        .map(r => (r.id === recipeId ? { ...r, likes } : r))
        .sort((a, b) => b.likes - a.likes)
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div>
      {challenge && (
        <div
          className="challenge-banner"
          onClick={() => navigate(`/challenge/${challenge.id}`)}
        >
          <div className="challenge-banner-title">
            🏆 当前挑战：{challenge.title}
          </div>
          <div className="challenge-banner-desc">{challenge.description}</div>
          <div className="challenge-countdown">
            <span>⏰ 剩余</span>
            <span className="countdown-number">
              {getDaysRemaining(challenge.endDate)}
            </span>
            <span>天</span>
          </div>
        </div>
      )}

      <div className="search-container" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="search-input"
            placeholder="搜索菜谱或食材..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery && setShowDropdown(true)}
          />
        </form>
        {showDropdown && suggestions.length > 0 && (
          <div className="search-dropdown">
            {suggestions.map(recipe => (
              <div
                key={recipe.id}
                className="search-dropdown-item"
                onClick={() => handleSuggestionClick(recipe)}
              >
                {recipe.title}
                <span style={{ color: '#999', fontSize: '0.85rem', marginLeft: '10px' }}>
                  - {recipe.username}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="section-title">
        {searchQuery ? `"${searchQuery}" 的搜索结果` : '🔥 热门菜谱'}
      </h2>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍳</div>
          <p>暂无菜谱，快来添加第一个吧！</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              userId={user?.id}
              onLikeChange={handleLikeChange}
              className="stagger-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
