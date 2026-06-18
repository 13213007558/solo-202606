import React, { useState } from 'react';
import type { FilterType } from '../types';

interface SidebarProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchKeyword: string;
  onSearch: (keyword: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  filter,
  onFilterChange,
  searchKeyword,
  onSearch,
}) => {
  const [mobileTab, setMobileTab] = useState<FilterType | 'search'>('all');

  const handleFilterClick = (newFilter: FilterType) => {
    onFilterChange(newFilter);
    setMobileTab(newFilter);
  };

  const handleSearchClick = () => {
    setMobileTab('search');
  };

  return (
    <>
      <aside className="sidebar">
        <h1 className="sidebar-title">灵感碎片</h1>

        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          <svg
            className="filter-btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          全部灵感
        </button>

        <button
          className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`}
          onClick={() => handleFilterClick('favorites')}
        >
          <svg
            className="filter-btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          仅收藏
        </button>

        <button
          className={`filter-btn ${filter === 'images' ? 'active' : ''}`}
          onClick={() => handleFilterClick('images')}
        >
          <svg
            className="filter-btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          仅图片
        </button>

        <div className="search-container">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="搜索灵感..."
            value={searchKeyword}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </aside>

      {mobileTab === 'search' && (
        <div className="mobile-search-bar">
          <div className="search-container">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="搜索灵感..."
              value={searchKeyword}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      <nav className="bottom-tabbar">
        <div className="tabbar-items">
          <button
            className={`tabbar-item ${mobileTab === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterClick('all')}
          >
            <svg
              className="tabbar-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            全部
          </button>

          <button
            className={`tabbar-item ${mobileTab === 'favorites' ? 'active' : ''}`}
            onClick={() => handleFilterClick('favorites')}
          >
            <svg
              className="tabbar-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            收藏
          </button>

          <button
            className={`tabbar-item ${mobileTab === 'images' ? 'active' : ''}`}
            onClick={() => handleFilterClick('images')}
          >
            <svg
              className="tabbar-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            图片
          </button>

          <button
            className={`tabbar-item ${mobileTab === 'search' ? 'active' : ''}`}
            onClick={handleSearchClick}
          >
            <svg
              className="tabbar-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            搜索
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
