'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import '../../detail.css';

export default function MangaDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    loadContent();
  }, [id]);

  async function loadContent() {
    try {
      const data = await api.getContentById(id);
      setContent(data.content);
      setInWatchlist(data.content.inWatchlist);
      document.title = `${data.content.title} — Manga | OmniStream`;
    } catch (err) {
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleWatchlist() {
    if (!user) {
      toast.info('Please sign in to add to watchlist');
      return;
    }
    try {
      if (inWatchlist) {
        await api.removeFromWatchlist(content.id);
        setInWatchlist(false);
        toast.success('Removed from watchlist');
      } else {
        await api.addToWatchlist(content.id);
        setInWatchlist(true);
        toast.success('Added to watchlist! 📋');
      }
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) {
    return (
      <div className="detail-page page-enter">
        <div className="detail-hero"><div className="skeleton" style={{ width: '100%', height: '100%' }} /></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="detail-page page-enter" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1>Content not found</h1>
        <Link href="/browse" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>Browse Catalog</Link>
      </div>
    );
  }

  return (
    <div className="detail-page page-enter">
      <div className="detail-hero">
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {content.bannerUrl || content.coverUrl ? (
            <Image src={content.bannerUrl || content.coverUrl} alt={content.title} fill className="detail-hero-bg" style={{ objectFit: 'cover' }} />
          ) : null}
          <div className="detail-hero-overlay" />
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-top">
          <div className="detail-cover">
            {content.coverUrl ? (
              <div style={{ position: 'relative', width: 220, height: 320 }}>
                <Image src={content.coverUrl} alt={content.title} fill style={{ objectFit: 'cover', borderRadius: '8px' }} />
              </div>
            ) : null}
          </div>
          <div className="detail-info">
            <h1>{content.title}</h1>
            <div className="detail-meta">
              {content.rating > 0 && (
                <span className="star-rating">⭐ {content.rating.toFixed(1)}</span>
              )}
              <span className="badge badge-genre">📖 MANGA</span>
              <span style={{ color: 'var(--text-tertiary)' }}>{content.year}</span>
              <span className={`badge badge-status ${content.status.toLowerCase()}`}>
                {content.status}
              </span>
            </div>
            <div className="detail-genres">
              {(content.genres || []).map(g => (
                <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`} className="badge badge-genre">{g}</Link>
              ))}
            </div>
            <p className="detail-description">{content.description}</p>
            <div className="detail-actions">
              {content.mangaChapters?.length > 0 && (
                <Link
                  href={`/read/${content.mangaChapters[0].id}`}
                  className="btn btn-primary"
                >
                  📖 Read Chapter 1
                </Link>
              )}
              <button
                className="btn btn-secondary"
                onClick={toggleWatchlist}
                id="watchlist-btn"
              >
                {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
            </div>
            <div className="detail-stats">
              <div className="detail-stat">
                <div className="stat-value">{content.mangaChapters?.length || 0}</div>
                <div className="stat-label">Chapters</div>
              </div>
              <div className="detail-stat">
                <div className="stat-value">{content.bookmarkCount || 0}</div>
                <div className="stat-label">Bookmarks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters */}
        {content.mangaChapters?.length > 0 && (
          <div className="detail-section">
            <h2>📖 Chapters</h2>
            <div className="episode-list">
              {content.mangaChapters.map(ch => (
                <Link
                  key={ch.id}
                  href={`/read/${ch.id}`}
                  className="chapter-card"
                  id={`chapter-${ch.id}`}
                >
                  <div className="chapter-left">
                    <span className="chapter-num">#{ch.chapterNumber}</span>
                    <div>
                      <div className="chapter-title">{ch.title || `Chapter ${ch.chapterNumber}`}</div>
                      <div className="chapter-pages">{ch.pageCount} pages</div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--accent-primary-light)', fontSize: '0.875rem' }}>Read →</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
