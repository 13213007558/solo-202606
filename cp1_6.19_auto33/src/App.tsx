import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Sidebar, { FilterType } from './components/Sidebar';
import InspirationFeed from './components/InspirationFeed';
import CardModal from './components/CardModal';
import { IdeaCardData } from './components/IdeaCard';
import './App.css';

const App = () => {
  const [cards, setCards] = useState<IdeaCardData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const PAGE_SIZE = 12;

  const loadCards = useCallback(
    async (p: number, replace: boolean = false) => {
      if (loading) return;
      setLoading(true);
      try {
        const { data } = await axios.get('/api/cards', {
          params: {
            page: p,
            limit: PAGE_SIZE,
            favorite: filter === 'favorite' ? 'true' : undefined,
            type: filter === 'image' ? 'image' : undefined,
            keyword: searchKeyword.trim() || undefined,
          },
        });
        setHasMore(data.hasMore);
        if (replace) {
          setCards(data.data);
        } else {
          setCards((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const merged = [...prev];
            for (const c of data.data) {
              if (!existingIds.has(c.id)) merged.push(c);
            }
            return merged;
          });
        }
      } catch (err) {
        console.error('load error', err);
      } finally {
        setLoading(false);
      }
    },
    [filter, searchKeyword, loading]
  );

  useEffect(() => {
    setPage(1);
    setCards([]);
    setHasMore(true);
    loadCards(1, true);
  }, [filter, searchKeyword]);

  useEffect(() => {
    if (page > 1) loadCards(page, false);
  }, [page]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((p) => p + 1);
    }
  };

  const handleCreateCard = async (payload: any) => {
    try {
      const { data } = await axios.post('/api/cards', payload);
      setCards((prev) => [data, ...prev]);
      setModalOpen(false);
    } catch (err) {
      console.error('create error', err);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const target = cards.find((c) => c.id === id);
    if (!target) return;
    const nextFav = !target.favorite;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: nextFav } : c)));
    try {
      await axios.patch(`/api/cards/${id}`, { favorite: nextFav });
    } catch (err) {
      console.error('favorite error', err);
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, favorite: !nextFav } : c)));
    }
  };

  return (
    <div className="app">
      <Sidebar
        activeFilter={filter}
        onFilterChange={(f) => setFilter(f)}
        onSearch={(k) => setSearchKeyword(k)}
        searchKeyword={searchKeyword}
      />
      <main className="app-main">
        <InspirationFeed
          cards={cards}
          filter={filter}
          searchKeyword={searchKeyword}
          onToggleFavorite={handleToggleFavorite}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
          onOpenCreate={() => setModalOpen(true)}
        />
      </main>
      <CardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateCard}
      />
    </div>
  );
};

export default App;
