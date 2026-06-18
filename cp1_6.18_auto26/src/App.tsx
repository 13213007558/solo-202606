import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { IdeaCard, FilterType } from './types';
import type { CardData } from './components/CardModal';
import Sidebar from './components/Sidebar';
import InspirationFeed from './components/InspirationFeed';
import CardModal from './components/CardModal';

const api = axios.create({
  baseURL: '/api',
});

interface FetchCardsResponse {
  data: IdeaCard[];
  hasMore: boolean;
}

const App: React.FC = () => {
  const [cards, setCards] = useState<IdeaCard[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const buildParams = useCallback(
    (f: FilterType, kw: string, p: number) => {
      const params: Record<string, string | number> = {
        page: p,
        limit: 12,
      };

      if (f === 'favorites') {
        params.favorite = 'true';
      } else if (f === 'images') {
        params.type = 'image';
      }

      if (kw.trim()) {
        params.keyword = kw.trim();
      }

      return params;
    },
    []
  );

  const fetchCards = useCallback(
    async (f: FilterType, kw: string, p: number, append: boolean = false) => {
      setIsLoading(true);
      try {
        const params = buildParams(f, kw, p);
        const response = await api.get<FetchCardsResponse>('/ideas', { params });
        const { data, hasMore: more } = response.data;

        if (append) {
          setCards((prev) => [...prev, ...data]);
        } else {
          setCards(data);
        }
        setHasMore(more);
      } catch (error) {
        console.error('Failed to fetch cards:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [buildParams]
  );

  const createCard = useCallback(async (data: CardData): Promise<IdeaCard | null> => {
    try {
      const response = await api.post<IdeaCard>('/ideas', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create card:', error);
      return null;
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    try {
      await api.put(`/ideas/${id}`, { isFavorite });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchCards(filter, searchKeyword, page, false);
  }, []);

  const handleFilterChange = useCallback(
    (f: FilterType) => {
      setFilter(f);
      setPage(1);
      setCards([]);
      setHasMore(true);
      fetchCards(f, searchKeyword, 1, false);
    },
    [fetchCards, searchKeyword]
  );

  const handleSearch = useCallback(
    (kw: string) => {
      setSearchKeyword(kw);
      setPage(1);
      setCards([]);
      setHasMore(true);
      fetchCards(filter, kw, 1, false);
    },
    [fetchCards, filter]
  );

  const handleLoadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCards(filter, searchKeyword, nextPage, true);
  }, [isLoading, hasMore, page, filter, searchKeyword, fetchCards]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCreateCard = useCallback(
    async (data: CardData) => {
      const newCard = await createCard(data);
      if (newCard) {
        setCards((prev) => [newCard, ...prev]);
      }
      handleCloseModal();
    },
    [createCard, handleCloseModal]
  );

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      const card = cards.find((c) => c.id === id);
      if (!card) return;

      const newFavoriteStatus = !card.isFavorite;

      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFavorite: newFavoriteStatus } : c))
      );

      try {
        await toggleFavorite(id, newFavoriteStatus);
      } catch (error) {
        setCards((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isFavorite: card.isFavorite } : c))
        );
      }
    },
    [cards, toggleFavorite]
  );

  return (
    <div className="app">
      <Sidebar
        filter={filter}
        onFilterChange={handleFilterChange}
        searchKeyword={searchKeyword}
        onSearch={handleSearch}
      />
      <div className="main-content">
        <InspirationFeed
          cards={cards}
          searchKeyword={searchKeyword}
          onToggleFavorite={handleToggleFavorite}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
          onOpenModal={handleOpenModal}
        />
      </div>
      <CardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateCard}
      />
    </div>
  );
};

export default App;
