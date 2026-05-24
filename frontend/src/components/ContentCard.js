'use client';

import Link from 'next/link';
import './ContentCard.css';

export default function ContentCard({ content, index = 0 }) {
  const link = content.type === 'ANIME'
    ? `/anime/${content.id}`
    : `/manga/${content.id}`;

  const itemCount = content.type === 'ANIME'
    ? `${content.episodeCount || 0} eps`
    : `${content.chapterCount || 0} chs`;

  return (
    <Link
      href={link}
      className="content-card"
      id={`content-card-${content.id}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="content-card-image">
        <img
          src={content.coverUrl}
          alt={content.title}
          loading="lazy"
        />
        <div className="content-card-overlay">
          <div className="play-btn">▶</div>
        </div>

        <div className="content-card-type">
          <span className="badge badge-genre">
            {content.type === 'ANIME' ? '📺' : '📖'} {content.type}
          </span>
        </div>

        {content.rating > 0 && (
          <div className="content-card-rating">
            ⭐ {content.rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="content-card-body">
        <div className="content-card-title">{content.title}</div>
        <div className="content-card-meta">
          <span>{content.year}</span>
          <span>•</span>
          <span>{itemCount}</span>
          <span>•</span>
          <span className={`badge badge-status ${content.status.toLowerCase()}`}>
            {content.status}
          </span>
        </div>
        <div className="content-card-genres">
          {(content.genres || []).slice(0, 3).map(genre => (
            <span key={genre} className="badge badge-genre">{genre}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="content-card content-card-skeleton">
      <div className="content-card-image skeleton" />
      <div className="content-card-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-meta" />
      </div>
    </div>
  );
}
