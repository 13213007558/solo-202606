import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface WorkCardProps {
  work: {
    id: string;
    userId: string;
    username: string;
    title: string;
    description: string;
    content: string;
    audioUrl?: string;
    tags?: string[];
    likes: string[];
    createdAt: string;
  };
  onClick?: () => void;
  animationDelay?: number;
}

const WorkCard: React.FC<WorkCardProps> = ({ work, onClick, animationDelay = 0 }) => {
  const [hovered, setHovered] = useState(false);
  const { theme } = useTheme();

  const primaryColor = theme?.primary ?? '#6366f1';

  const styles: Record<string, React.CSSProperties> = {
    card: {
      borderRadius: 12,
      background: 'var(--card-bg, #ffffff)',
      border: '1px solid var(--card-border, #e5e7eb)',
      padding: 20,
      cursor: 'pointer',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      boxShadow: hovered
        ? '0 12px 24px var(--shadow-color, rgba(0,0,0,0.12))'
        : '0 2px 8px var(--shadow-color, rgba(0,0,0,0.06))',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      opacity: 0,
      animation: `fadeInUp 0.4s ease-out ${animationDelay}ms forwards`,
    },
    title: {
      fontSize: 18,
      fontWeight: 600,
      color: 'var(--text-primary)',
      marginBottom: 8,
      textAlign: 'left' as const,
    },
    username: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      marginBottom: 12,
      textAlign: 'left' as const,
    },
    tagsRow: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: 6,
      marginBottom: 12,
    },
    tag: {
      borderRadius: 9999,
      padding: '2px 10px',
      fontSize: 12,
      background: `${primaryColor}1a`,
      color: primaryColor,
    },
    bottomRow: {
      display: 'flex',
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    },
    likes: {
      fontSize: 14,
    },
    date: {
      fontSize: 12,
      color: 'var(--text-secondary)',
    },
  };

  const formattedDate = new Date(work.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div
        style={styles.card}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={styles.title}>{work.title}</div>
        <div style={styles.username}>{work.username}</div>
        {work.tags && work.tags.length > 0 && (
          <div style={styles.tagsRow}>
            {work.tags.map((tag) => (
              <span key={tag} style={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div style={styles.bottomRow}>
          <span style={styles.likes}>
           ❤ {work.likes.length}
          </span>
          <span style={styles.date}>{formattedDate}</span>
        </div>
      </div>
    </>
  );
};

export default WorkCard;
