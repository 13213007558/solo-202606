import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RecipeCard from '../components/RecipeCard';
import type { Recipe, Challenge } from '../types';

interface ChallengeDetailProps {
  user: { id: string; username: string } | null;
}

function ChallengeDetail({ user }: ChallengeDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadChallengeDetail();
    }
  }, [id]);

  const loadChallengeDetail = async () => {
    try {
      const response = await axios.get(`/api/challenges/${id}/detail`);
      const data = response.data;
      setChallenge(data);
      setRecipes(data.participantRecipes);

      if (user) {
        const participated = data.participantRecipes.some(
          (r: Recipe) => r.userId === user.id
        );
        setHasParticipated(participated);
      }

      setLoading(false);
    } catch (error) {
      console.error('加载挑战详情失败:', error);
      setLoading(false);
    }
  };

  const loadUserRecipes = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/users/${user.id}/recipes`);
      const availableRecipes = response.data.filter(
        (r: Recipe) => !r.challengeId
      );
      setUserRecipes(availableRecipes);
    } catch (error) {
      console.error('加载用户菜谱失败:', error);
    }
  };

  const handleParticipate = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (hasParticipated) return;
    loadUserRecipes();
    setShowModal(true);
    setMessage('');
  };

  const handleSubmitParticipation = async () => {
    if (!selectedRecipe || !id) return;

    try {
      const response = await axios.post(`/api/challenges/${id}/participate`, {
        recipeId: selectedRecipe,
        userId: user?.id,
      });
      setMessage(response.data.message);
      setShowModal(false);
      setHasParticipated(true);
      loadChallengeDetail();
    } catch (err: any) {
      setMessage(err.response?.data?.error || '投稿失败');
    }
  };

  const handleLikeChange = (recipeId: string, likes: number) => {
    setRecipes(prev =>
      prev
        .map(r => (r.id === recipeId ? { ...r, likes } : r))
        .sort((a, b) => b.likes - a.likes)
    );
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">😕</div>
        <p>挑战不存在</p>
      </div>
    );
  }

  const isEnded = !challenge.isActive;

  return (
    <div className="challenge-detail">
      <div className="challenge-header">
        <h1>🏆 {challenge.title}</h1>
        <p>{challenge.description}</p>
        <div className="challenge-countdown" style={{ display: 'inline-flex' }}>
          {isEnded ? (
            <span>挑战已结束</span>
          ) : (
            <>
              <span>⏰ 剩余</span>
              <span className="countdown-number">
                {getDaysRemaining(challenge.endDate)}
              </span>
              <span>天</span>
            </>
          )}
        </div>
      </div>

      {isEnded && challenge.winners && (
        <div className="winners-banner">
          <div className="winner-card second stagger-item" style={{ animationDelay: '0.1s' }}>
            <div className="winner-rank">🥈</div>
            <div className="winner-username">
              {challenge.winners.second?.username || '空缺'}
            </div>
            <div className="winner-label">亚军</div>
          </div>
          <div className="winner-card first stagger-item" style={{ animationDelay: '0s' }}>
            <div className="winner-rank">🏆</div>
            <div className="winner-username">
              {challenge.winners.first?.username || '空缺'}
            </div>
            <div className="winner-label">冠军</div>
          </div>
          <div className="winner-card third stagger-item" style={{ animationDelay: '0.2s' }}>
            <div className="winner-rank">🥉</div>
            <div className="winner-username">
              {challenge.winners.third?.username || '空缺'}
            </div>
            <div className="winner-label">季军</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button
          className="participate-btn"
          onClick={handleParticipate}
          disabled={isEnded || hasParticipated}
        >
          {isEnded
            ? '挑战已结束'
            : hasParticipated
            ? '已参与挑战'
            : '参与挑战'}
        </button>
      </div>

      <div className="challenge-info">
        <h3>挑战规则</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{challenge.rules}</p>
      </div>

      <div className="challenge-info">
        <h3>重要时间</h3>
        <p>开始时间：{new Date(challenge.startDate).toLocaleDateString()}</p>
        <p>截止时间：{new Date(challenge.endDate).toLocaleDateString()}</p>
      </div>

      <h2 className="section-title">
        参赛作品 ({recipes.length})
      </h2>

      {recipes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍳</div>
          <p>还没有参赛作品，快来投稿吧！</p>
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
              style={{ animationDelay: `${index * 0.08}s` }}
            />
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h3 className="modal-title">选择要投稿的菜谱</h3>
            {message && (
              <p style={{ color: '#e07a5f', marginBottom: '16px' }}>{message}</p>
            )}
            {userRecipes.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                你还没有可投稿的菜谱，请先创建一个！
              </p>
            ) : (
              <>
                {userRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    className={`recipe-select-item ${
                      selectedRecipe === recipe.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedRecipe(recipe.id)}
                  >
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="recipe-select-img"
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>{recipe.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#999' }}>
                        {recipe.ingredients.length} 种食材
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  className="btn btn-primary btn-block"
                  style={{ marginTop: '20px' }}
                  onClick={handleSubmitParticipation}
                  disabled={!selectedRecipe}
                >
                  确认投稿
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChallengeDetail;
