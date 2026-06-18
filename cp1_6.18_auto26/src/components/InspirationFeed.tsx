import React, { useEffect, useRef, useCallback } from 'react';
import type { IdeaCard as IdeaCardType } from '../types';
import IdeaCard from './IdeaCard';

interface InspirationFeedProps {
  cards: IdeaCardType[];
  searchKeyword: string;
  onToggleFavorite: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onOpenModal: () => void;
}

const InspirationFeed: React.FC<InspirationFeedProps> = ({
  cards,
  searchKeyword,
  onToggleFavorite,
  onLoadMore,
  hasMore,
  isLoading,
  onOpenModal,
}) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && __N__ isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (__N__ element) return;
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [handleObserver, cards.length]);

  const getFilterTitle = () => {
    if (searchKeyword.trim()) {
      return `搜索："${searchKeyword}"`;
    }
    return '全部灵感';
  };
