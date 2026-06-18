import { useEffect, useRef, useState, useMemo } from 'react';
import IdeaCard, { IdeaCardData } from './IdeaCard';
import './InspirationFeed.css';
import type { FilterType } from './Sidebar';

interface InspirationFeedProps {
  cards: IdeaCardData[];
  filter: FilterType;
  searchKeyword: string;
  onToggleFavorite: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  onOpenCreate: () => void;
}

const InspirationFeed = ({
  cards,
  filter,
  searchKeyword,
  onToggleFavorite,
  onLoadMore,
  hasMore,
  loading,
  onOpenCreate,
}: InspirationFeedProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [animKey, setAnimKey] = useState(0);
  const prevFilterRef = useRef(filter);
  const prevKeywordRef = useRef(searchKeyword);

  useEffect(() => {
    if (prevFilterRef.current !== filter || prevKeywordRef.current !== searchKeyword) {
      setAnimKey((k) => k + 1);
      prevFilterRef.current = filter;
      prevKeywordRef.current = searchKeyword;
    }
  }, [filter, searchKeyword]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  const visibleCards = useMemo(() => {
    let list = cards;
    if (filter === 'favorite') {
      list = list.filter((c) => c.favorite);
    } else if (filter === 'image') {
      list = list.filter((c) => c.type === 'image');
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter((c) => {
        if (c.type === 'text') {
          const text = (c.content || '').replace(/<[^>]*>/g, '').toLowerCase();
          return text.includes(kw);
        }
        return false;
      });
    }
    return list;
  }, [cards, filter, searchKeyword]);

  return (
    <div className="feed-wrap">
      <div className="feed-header">
        <h2>
          {filter === 'all' && '全部灵感'}
          {filter === 'favorite' && '收藏的灵感'}
          {filter === 'image' && '图片灵感'}
        </h2>
        <span className="feed-count">{visibleCards.length} 条</span>
      </div>

      {visibleCards.length === 0 ? (
        <div className="feed-empty">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c7d2fe" strokeWidth="1.5">
              <path d="M12 2v6M12 22v-6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M22 12h-6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
            </svg>
          </div>
          <p>还没有灵感卡片</p>
          <button className="empty-btn" onClick={onOpenCreate}>+ 创建第一条</button>
        </div>
      ) : (
        <div className="masonry" key={`masonry-${animKey}`}>
          {visibleCards.map((card, index) => (
            <IdeaCard
              key={`${card.id}-${animKey}`}
              card={card}
              searchKeyword={searchKeyword}
              onToggleFavorite={onToggleFavorite}
              index={index}
              animationKey={animKey}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="sentinel" />

      {loading && (
        <div className="feed-loading">
          <div className="spinner" />
          <span>加载中...</span>
        </div>
      )}

      {!hasMore && visibleCards.length > 0 && (
        <div className="feed-end">已显示全部 {visibleCards.length} 条灵感</div>
      )}

      <button className="fab" onClick={onOpenCreate} aria-label="创建灵感">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
          <rect x="11" y="4" width="2" height="16" rx="1" />
          <rect x="4" y="11" width="16" height="2" rx="1" />
        </svg>
      </button>
    </div>
  );
};

export default InspirationFeed;
