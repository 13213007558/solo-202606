import { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/likeButton.css';

interface LikeButtonProps {
  workId: string;
  initialLikes: number;
  initialLiked?: boolean;
  onLikeChange?: (likes: number, liked: boolean) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
}

const LikeButton = ({ workId, initialLikes, initialLiked = false, onLikeChange }: LikeButtonProps) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleIdRef = useRef(0);

  const handleClick = async () => {
    if (!user || isAnimating) return;

    setIsAnimating(true);
    
    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : likes - 1;
    
    setLiked(newLiked);
    setLikes(newLikes);
    onLikeChange?.(newLikes, newLiked);

    if (newLiked) {
      createParticles();
    }

    try {
      await axios.post(`/api/works/${workId}/like`, {
        userId: user.id,
      });
    } catch (error) {
      console.error('Failed to like:', error);
      setLiked(!newLiked);
      setLikes(likes);
      onLikeChange?.(likes, !newLiked);
    } finally {
      setIsAnimating(false);
    }
  };

  const createParticles = () => {
    const particleCount = 12;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      newParticles.push({
        id: particleIdRef.current++,
        x: 0,
        y: 0,
        angle,
        velocity: 2 + Math.random() * 3,
      });
    }
    
    setParticles(newParticles);
    
    setTimeout(() => {
      setParticles([]);
    }, 800);
  };

  return (
    <div className="like-button-container">
      <button
        ref={buttonRef}
        className={`like-button ${liked ? 'liked' : ''}`}
        onClick={handleClick}
        disabled={!user}
      >
        <span className="heart-icon">
          {liked ? '❤️' : '🤍'}
        </span>
        <span className="like-count">{likes}</span>
        
        {particles.map(particle => (
          <span
            key={particle.id}
            className="heart-particle"
            style={{
              '--angle': `${particle.angle}rad`,
              '--velocity': `${particle.velocity}`,
            } as React.CSSProperties}
          >
            ❤️
          </span>
        ))}
      </button>
      
      {!user && (
        <span className="like-hint">登录后可点赞</span>
      )}
    </div>
  );
};

export default LikeButton;
