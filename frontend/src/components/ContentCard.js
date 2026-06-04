'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './ContentCard.css';

export default function ContentCard({ content, index = 0 }) {
  const router = useRouter();
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
      <div className="content-card-image" style={{ position: 'relative' }}>
        {content.coverUrl ? (
          <Image
            src={content.coverUrl}
            alt={content.title}
            fill
            sizes="(max-width: 600px) 180px, 220px"
            style={{ objectFit: 'cover', borderRadius: '8px' }}
          />
        ) : (
          <div className="image-fallback" aria-hidden="true" />
        )}

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
            <span
              key={genre}
              className="badge badge-genre"
              role="link"
              tabIndex={0}
              onClick={(e) => {
                // prevent the parent Link from triggering
                e.stopPropagation();
                e.preventDefault();
                router.push(`/browse?genre=${encodeURIComponent(genre)}`);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  router.push(`/browse?genre=${encodeURIComponent(genre)}`);
                }
              }}
            >
              {genre}
            </span>
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
