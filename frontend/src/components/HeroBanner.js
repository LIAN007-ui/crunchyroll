'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './HeroBanner.css';

export default function HeroBanner({ items = [] }) {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent(prev => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, items.length]);

  if (!items || items.length === 0) return null;

  return (
    <div className="hero-banner" id="hero-banner">
      {items.map((item, i) => (
        <div key={item.id} className={`hero-slide ${i === current ? 'active' : ''}`}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {item.bannerUrl || item.coverUrl ? (
              <Image
                src={item.bannerUrl || item.coverUrl}
                alt={item.title}
                fill
                style={{ objectFit: 'cover' }}
                priority={i === 0}
              />
            ) : null}
            <div className="hero-slide-overlay" />
          </div>
        </div>
      ))}

      <div className="hero-content">
        <span className="hero-badge">
          {items[current]?.type === 'ANIME' ? '📺' : '📖'} Featured
        </span>
        <h1 className="hero-title">{items[current]?.title}</h1>
        <p className="hero-description">{items[current]?.description}</p>
        <div className="hero-meta">
          {items[current]?.rating > 0 && (
            <span className="hero-rating">⭐ {items[current]?.rating.toFixed(1)}</span>
          )}
          <span>{items[current]?.year}</span>
          <span className={`badge badge-status ${items[current]?.status?.toLowerCase()}`}>
            {items[current]?.status}
          </span>
          {(items[current]?.genres || []).slice(0, 3).map(g => (
            <span key={g} className="badge badge-genre">{g}</span>
          ))}
        </div>
        <div className="hero-actions">
          <Link
            href={items[current]?.type === 'ANIME'
              ? `/anime/${items[current]?.id}`
              : `/manga/${items[current]?.id}`}
            className="btn btn-primary"
          >
            ▶ Watch Now
          </Link>
          <Link
            href={items[current]?.type === 'ANIME'
              ? `/anime/${items[current]?.id}`
              : `/manga/${items[current]?.id}`}
            className="btn btn-secondary"
          >
            ℹ️ More Info
          </Link>
        </div>
      </div>

      {items.length > 1 && (
        <div className="hero-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
