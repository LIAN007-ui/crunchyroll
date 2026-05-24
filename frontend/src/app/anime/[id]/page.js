'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import '../../detail.css';

export default function AnimeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    loadContent();
  }, [id]);

  async function loadContent() {
    try {
      const data = await api.getContentById(id);
      setContent(data.content);
      setInWatchlist(data.content.inWatchlist);
      document.title = `${data.content.title} — Anime | OmniStream`;
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
        <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>The anime you're looking for doesn't exist.</p>
        <Link href="/browse" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>Browse Catalog</Link>
      </div>
    );
  }

  // Group episodes by season
  const seasons = {};
  (content.episodes || []).forEach(ep => {
    if (!seasons[ep.seasonNumber]) seasons[ep.seasonNumber] = [];
    seasons[ep.seasonNumber].push(ep);
  });
  const seasonNumbers = Object.keys(seasons).map(Number).sort((a, b) => a - b);
  const currentEpisodes = seasons[selectedSeason] || [];

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

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
              <span className="badge badge-genre">📺 ANIME</span>
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
              {content.episodes?.length > 0 && (
                <Link
                  href={`/watch/${content.episodes[0].id}`}
                  className="btn btn-primary"
                >
                  ▶ Watch Episode 1
                </Link>
              )}
              <button
                className={`btn ${inWatchlist ? 'btn-secondary' : 'btn-secondary'}`}
                onClick={toggleWatchlist}
                id="watchlist-btn"
              >
                {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
            </div>
            <div className="detail-stats">
              <div className="detail-stat">
                <div className="stat-value">{content.episodes?.length || 0}</div>
                <div className="stat-label">Episodes</div>
              </div>
              <div className="detail-stat">
                <div className="stat-value">{seasonNumbers.length}</div>
                <div className="stat-label">Seasons</div>
              </div>
              <div className="detail-stat">
                <div className="stat-value">{content.bookmarkCount || 0}</div>
                <div className="stat-label">Bookmarks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes */}
        {content.episodes?.length > 0 && (
          <div className="detail-section">
            <h2>📺 Episodes</h2>

            {seasonNumbers.length > 1 && (
              <div className="season-tabs">
                {seasonNumbers.map(s => (
                  <button
                    key={s}
                    className={`season-tab ${selectedSeason === s ? 'active' : ''}`}
                    onClick={() => setSelectedSeason(s)}
                  >
                    Season {s}
                  </button>
                ))}
              </div>
            )}

            <div className="episode-list">
              {currentEpisodes.map(ep => (
                <Link
                  key={ep.id}
                  href={`/watch/${ep.id}`}
                  className="episode-card"
                  id={`episode-${ep.id}`}
                >
                  <div className="episode-thumb">
                    {ep.thumbnailUrl || content.coverUrl ? (
                      <Image src={ep.thumbnailUrl || content.coverUrl} alt={ep.title} fill style={{ objectFit: 'cover' }} />
                    ) : null}
                    <div className="play-icon">▶</div>
                  </div>
                  <div className="episode-info">
                    <div className="episode-number">
                      S{ep.seasonNumber} E{ep.episodeNumber}
                    </div>
                    <div className="episode-title">{ep.title}</div>
                    <div className="episode-duration">{formatDuration(ep.duration)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
