"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import ContentGrid from '@/components/ContentGrid';
import { useLanguage } from '@/context/LanguageContext';

export default function ClientTodos() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [page, searchParams.get('search')]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = { type: 'MANGA', page, limit: 24 };
      const q = searchParams.get('search');
      if (q) params.search = q;
      const data = await api.getContent(params);
      setContent(data.content || []);
      setPagination(data.pagination || { page, totalPages: 1, total: (data.content || []).length });
    } catch (err) {
      setError(err.message || 'Error loading');
    } finally {
      setLoading(false);
    }
  }

  function gotoPage(p) {
    setPage(p);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/manga/todos?${params.toString()}`);
  }

  return (
    <div className="page-enter">
      <div className="container">
        <h1>📖 {t('home.popularManga') || 'Manga'}</h1>

        {error ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <p>{`Error: ${error}`}</p>
            <button className="btn btn-primary" onClick={load}>Retry</button>
          </div>
        ) : (
          <ContentGrid items={content} loading={loading} emptyMessage={t('browse.noResults')} />
        )}

        {pagination.totalPages > 1 && (
          <div className="browse-pagination">
            <button disabled={page <= 1} onClick={() => gotoPage(page - 1)}>← Previous</button>
            <span className="page-info">Page {pagination.page} of {pagination.totalPages}</span>
            <button disabled={page >= pagination.totalPages} onClick={() => gotoPage(page + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
