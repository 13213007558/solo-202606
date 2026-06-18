import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import type { Recipe, Trophy, User } from '../types';

const TrophySvg = ({ rank }: { rank: string }) => {
  const color =
    rank === 'first' ? '#FFD700' : rank === 'second' ? '#C0C0C0' : '#CD7F32';
  return (
    <svg
      viewBox="0 0 24 24"
      fill={color}
      className="trophy-icon"
      stroke={color}
      strokeWidth="0.5"
    >
      <path d="M12 15c3.87 0 7-3.13 7-7h-3c0 2.21-1.79 4-4 4s-4-1.79-4-4H5c0 3.87 3.13 7 7 7zm-1 3.94V21h2v-2.06c3.95-.49 7-3.85 7-7.94h-2c0 3.31-2.69 6-6 6s-6-2.69-6-6H4c0 4.09 3.05 7.45 7 7.94z" />
    </svg>
  );
};

interface ProfileProps {
  currentUser: { id: string; username: string } | null;
}

function Profile({ currentUser }: ProfileProps) {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadUserProfile();
      loadUserRecipes();
      loadUserTrophies();
    }
  }, [id]);

  const loadUserProfile = async () => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };

  const loadUserRecipes = async () => {
    try {
      const response = await axios.get(`/api/users/${id}/recipes`);
      setRecipes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('加载用户菜谱失败:', error);
      setLoading(false);
    }
  };

  const loadUserTrophies = async () => {
    try {
      const response = await axios.get(`/api/users/${id}/trophies`);
      const sortedTrophies = [...response.data].sort(
        (a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime()
      );
      setTrophies(sortedTrophies);
    } catch (error) {
      console.error('加载用户奖杯失败:', error);
    }
  };

  const handleLikeChange = (recipeId: string, likes: number) => {
    setRecipes(prev =>
      prev.map(r => (r.id === recipeId ? { ...r, likes } : r))
    );
  };

  const isOwnProfile = currentUser?.id === id;

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <img
          src={user?.avatar}
          alt={user?.username}
          className="profile-avatar"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
          }}
        />
        <h2 className="profile-username">{user?.username}</h2>
        <p className="profile-bio">{user?.bio}</p>

        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-number">{recipes.length}</div>
            <div className="stat-label">菜谱</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{trophies.length}</div>
            <div className="stat-label">奖杯</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">
              {recipes.reduce((sum, r) => sum + r.likes, 0)}
            </div>
            <div className="stat-label">获赞</div>
          </div>
        </div>

        {trophies.length > 0 && (
          <div className="trophy-section">
            <h3 className="trophy-section-title">🏆 获得的奖杯</h3>
            <div className="trophy-grid">
              {trophies.map(trophy => (
                <div
                  key={trophy.id}
                  className={`trophy-item trophy-${trophy.rank}`}
                  title={`${trophy.challengeTitle} - ${
                    trophy.rank === 'first'
                      ? '冠军'
                      : trophy.rank === 'second'
                      ? '亚军'
                      : '季军'
                  }`}
                >
                  <TrophySvg rank={trophy.rank} />
                  <div className="trophy-shine"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="profile-main">
        <h2 className="section-title">
          {isOwnProfile ? '我的食谱' : `${user?.username}的食谱`}
        </h2>
        {recipes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p>还没有菜谱，快来添加第一个吧！</p>
          </div>
        ) : (
          <div className="recipe-grid">
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                userId={currentUser?.id}
                onLikeChange={handleLikeChange}
                className="stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
