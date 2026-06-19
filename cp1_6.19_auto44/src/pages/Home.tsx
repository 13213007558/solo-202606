import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Recipe, Challenge } from '../types';
import { recipeApi, challengeApi } from '../api';
import RecipeCard from '../components/RecipeCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<number | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const t0 = performance.now();
    Promise.all([
      recipeApi.getRecipes().catch(() => [] as Recipe[]),
      challengeApi.getActive().catch(() => null as Challenge | null)
    ]).then(([recipesData, challengeData]) => {
      setRecipes(recipesData);
      setAllRecipes(recipesData);
      setChallenge(challengeData);
      if (challengeData) {
        setDaysLeft(calcDaysLeft(challengeData.endTime));
      }
      const t1 = performance.now();
      console.log(`首页数据加载用时：${(t1 - t0).toFixed(1)}ms`);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!challenge) return;
    const timer = window.setInterval(() => {
      setDaysLeft(calcDaysLeft(challenge.endTime));
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, [challenge]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = useCallback((val: string) => {
    setSearchQuery(val);
    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
    searchTimerRef.current = window.setTimeout(async () => {
      if (!val.trim()) {
        setRecipes(allRecipes);
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setShowSuggestions(true);
      try {
        const results = await recipeApi.getRecipes({ search: val.trim() });
        setRecipes(results);
        setSuggestions(results.slice(0, 6));
      } catch {
        setRecipes([]);
        setSuggestions([]);
      }
    }, 120);
  }, [allRecipes]);

  const handleSuggestionClick = (recipe: Recipe) => {
    setSearchQuery(recipe.name);
    setShowSuggestions(false);
    navigate(`/recipe/${recipe.id}`);
  };

  const onLikeUpdate = (id: string, likes: number) => {
    const updater = (list: Recipe[]) =>
      list.map((r) => (r.id === id ? { ...r, likes } : r));
    setRecipes(updater);
    setAllRecipes(updater);
    setSuggestions(updater);
  };

  return (
    <div className="container">
      <h1 className="page-title" style={{ textAlign: 'center' }}>
        🍽️ 发现美食，分享味道
      </h1>
      <p className="page-subtitle" style={{ textAlign: 'center' }}>
        浏览社区中的精选食谱，与万千家庭厨师一起创造美味
      </p>

      <div className="search-wrapper" ref={searchWrapperRef}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="搜索菜名或食材，例如「红烧肉」「豆腐」..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim() && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="search-suggestion-item"
                onClick={() => handleSuggestionClick(s)}
              >
                <img
                  src={s.imageUrl}
                  alt=""
                  className="search-suggestion-thumb"
                />
                <div className="search-suggestion-info">
                  <div className="search-suggestion-name">{s.name}</div>
                  <div className="search-suggestion-desc">{s.description}</div>
                </div>
                <span style={{ color: 'var(--accent-secondary)', fontSize: 13 }}>
                  ❤ {s.likes}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {challenge && (
        <div
          className="challenge-banner"
          onClick={() => navigate(`/challenge/${challenge.id}`)}
        >
          <div className="challenge-banner-content">
            <div>
              <div className="challenge-banner-label">
                🏆 当前正在进行 · 火热投稿中
              </div>
              <div className="challenge-banner-title">{challenge.title}</div>
              <div className="challenge-banner-desc">{challenge.description}</div>
            </div>
            <div className="countdown-box">
              <div className="countdown-number">
                {daysLeft > 0 ? daysLeft : 0}
              </div>
              <div className="countdown-label">剩余 天</div>
            </div>
          </div>
        </div>
      )}

      <h2 className="section-title">
        {searchQuery ? `搜索结果（${recipes.length}）` : '🔥 热门菜谱'}
      </h2>

      {loading ? (
        <div className="loading">🍳 正在加载美味菜谱...</div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <div className="empty-state-text">
            没有找到匹配的菜谱，换个关键词试试吧
          </div>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.slice(0, 40).map((r) => (
            <RecipeCard key={r.id} recipe={r} onLikeUpdate={onLikeUpdate} />
          ))}
        </div>
      )}

      {!searchQuery && recipes.length > 40 && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button
            className="btn btn-outline"
            onClick={() => {
              const el = document.querySelector('.recipes-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            更多精彩等你发现 →
          </button>
        </div>
      )}
    </div>
  );
};

function calcDaysLeft(endTimeIso: string): number {
  const end = new Date(endTimeIso).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (24 * 60 * 60 * 1000)));
}

export default Home;
