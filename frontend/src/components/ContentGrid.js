'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import Spinner from './Spinner';
import ContentCard, { ContentCardSkeleton } from './ContentCard';
import './ContentGrid.css';

export default function ContentGrid({ items = [], title, viewAllHref, loading, emptyMessage }) {
  const { t } = useLanguage();
  return (
    <section>
      {title && (
        <div className="content-grid-header">
          <h2>{title}</h2>
          {viewAllHref && (
            <Link href={viewAllHref} className="view-all">{t('viewAll')}</Link>
          )}
        </div>
      )}
      <div className="content-grid">
        {loading ? (
          <Spinner />
        ) : items.length > 0 ? (
          items.map((item, i) => (
            <ContentCard key={item.id} content={item} index={i} />
          ))
        ) : (
          <div className="content-grid-empty">
            <div className="empty-icon">📭</div>
            <p>{emptyMessage || 'No content found'}</p>
          </div>
        )}
      </div>
    </section>
  );
}
