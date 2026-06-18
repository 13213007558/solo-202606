import { useState, useEffect } from 'react';
import './Sidebar.css';

export type FilterType = 'all' | 'favorite' | 'image';

interface SidebarProps {
  activeFilter: FilterType;
  onFilterChange: (f: FilterType) => void;
  onSearch: (keyword: string) => void;
  searchKeyword: string;
}

const Sidebar = ({ activeFilter, onFilterChange, onSearch, searchKeyword }: SidebarProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [localKeyword, setLocalKeyword] = useState(searchKeyword);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setLocalKeyword(searchKeyword);
  }, [searchKeyword]);

  const filters: { key: FilterType; label: string; icon: JSX.Element }[] = [
    {
      key: 'all',
      label: '全部灵感',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      key: 'favorite',
      label: '仅收藏',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      key: 'image',
      label: '仅图片',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
  ];

  if (isMobile) {
    return (
      <div className="mobile-tabbar">
        {showMobileSearch ? (
          <div className="mobile-search-wrap">
            <input
              className="mobile-search-input"
              placeholder="搜索灵感..."
              value={localKeyword}
              onChange={(e) => {
                setLocalKeyword(e.target.value);
                onSearch(e.target.value);
              }}
              autoFocus
            />
            <button className="mobile-search-cancel" onClick={() => setShowMobileSearch(false)}>
              取消
            </button>
          </div>
        ) : (
          <div className="mobile-tabs">
            {filters.map((f) => (
              <button
                key={f.key}
                className={`mobile-tab ${activeFilter === f.key ? 'active' : ''}`}
                onClick={() => onFilterChange(f.key)}
              >
                {f.icon}
                <span>{f.label}</span>
              </button>
            ))}
            <button className="mobile-tab" onClick={() => setShowMobileSearch(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>搜索</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#4F46E5">
            <path d="M9 21h6M12 17v4M5.5 9.5a6.5 6.5 0 1 1 13 0c0 2.5-1.5 4-2.5 5.5-.7 1-1 1.5-1 3h-9c0-1.5-.3-2-1-3C7 13.5 5.5 12 5.5 9.5z" />
          </svg>
          <h1>灵感碎片</h1>
        </div>
      </div>
      <nav className="sidebar-nav">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`sidebar-nav-item ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => onFilterChange(f.key)}
          >
            {f.icon}
            <span>{f.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B8B8B" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="搜索灵感..."
          value={localKeyword}
          onChange={(e) => {
            setLocalKeyword(e.target.value);
            onSearch(e.target.value);
          }}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
