'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import ContentGrid from '@/components/ContentGrid';
import './browse.css';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural',
  'Thriller', 'Music', 'School', 'Cyberpunk', 'Dark Fantasy',
  'Isekai', 'Martial Arts', 'Mecha', 'Steampunk', 'Food',
  'Historical', 'Healing', 'Tournament'
];

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const type = searchParams.get('type') || '';
  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'rating';
  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    loadContent();
  }, [type, genre, year, status, search, sort, page]);

  async function loadContent() {
    setLoading(true);
    try {
      const params = { page, limit: 20, sort };
      if (type) params.type = type;
      if (genre) params.genre = genre;
      if (year) params.year = year;
      if (status) params.status = status;
      if (search) params.search = search;

      const data = await api.getContent(params);
      setContent(data.content || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Browse error:', err);
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.push(`/browse?${params.toString()}`);
  }

  function clearFilters() {
    router.push('/browse');
  }

  const hasFilters = type || genre || year || status || search;

  const title = search
    ? `Search: "${search}"`
    : type
      ? `${type === 'ANIME' ? '📺 Anime' : '📖 Manga'}`
      : 'Browse All';

  return (
    <div className="browse-page page-enter">
      <div className="browse-layout">
        {/* Mobile filter toggle */}
        <button
          className="btn btn-secondary mobile-filter-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? '✕ Close Filters' : '☰ Filters'}
        </button>

        {/* Sidebar */}
        <aside className={`browse-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="filter-section">
            <h3>Type</h3>
            <div className="filter-chips">
              <button
                className={`filter-chip ${type === 'ANIME' ? 'active' : ''}`}
                onClick={() => updateFilter('type', 'ANIME')}
              >
                📺 Anime
              </button>
              <button
                className={`filter-chip ${type === 'MANGA' ? 'active' : ''}`}
                onClick={() => updateFilter('type', 'MANGA')}
              >
                📖 Manga
              </button>
            </div>
          </div>

          <div className="filter-section">
            <h3>Genre</h3>
            <div className="filter-chips">
              {GENRES.map(g => (
                <button
                  key={g}
                  className={`filter-chip ${genre === g ? 'active' : ''}`}
                  onClick={() => updateFilter('genre', g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Year</h3>
            <div className="filter-chips">
              {YEARS.map(y => (
                <button
                  key={y}
                  className={`filter-chip ${year === String(y) ? 'active' : ''}`}
                  onClick={() => updateFilter('year', String(y))}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Status</h3>
            <div className="filter-chips">
              {['Airing', 'Completed', 'Upcoming'].map(s => (
                <button
                  key={s}
                  className={`filter-chip ${status === s ? 'active' : ''}`}
                  onClick={() => updateFilter('status', s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button className="filter-reset" onClick={clearFilters}>
              ✕ Clear all filters
            </button>
          )}
        </aside>

        {/* Main content */}
        <div className="browse-main">
          <div className="browse-header">
            <h1>{title}</h1>
            <div className="browse-sort">
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Sort:</span>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
                <option value="title">A-Z</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>

          {pagination.total !== undefined && (
            <div className="browse-results-count">
              {pagination.total} result{pagination.total !== 1 ? 's' : ''} found
            </div>
          )}

          <ContentGrid
            items={content}
            loading={loading}
            emptyMessage="No content matches your filters. Try adjusting your search."
          />

          {pagination.totalPages > 1 && (
            <div className="browse-pagination">
              <button
                disabled={page <= 1}
                onClick={() => updateFilter('page', String(page - 1))}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => updateFilter('page', String(page + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="browse-page page-enter"><div className="container"><p>Loading...</p></div></div>}>
      <BrowseContent />
    </Suspense>
  );
}
