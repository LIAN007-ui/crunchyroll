'use client';

import { useRef } from 'react';
import Link from 'next/link';
import ContentCard, { ContentCardSkeleton } from './ContentCard';
import './Carousel.css';

export default function Carousel({ items = [], title, emoji, viewAllHref, loading }) {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    if (!trackRef.current) return;
    const scrollAmount = trackRef.current.clientWidth * 0.8;
    trackRef.current.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section className="carousel-section">
      <div className="carousel-header">
        <h2>{emoji && <span>{emoji}</span>} {title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="view-all">View All →</Link>
        )}
      </div>

      <div className="carousel-wrapper">
        <button
          className="carousel-btn prev"
          onClick={() => scroll('prev')}
          aria-label="Previous"
        >
          ←
        </button>

        <div className="carousel-track" ref={trackRef}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))
          ) : (
            items.map((item, i) => (
              <ContentCard key={item.id} content={item} index={i} />
            ))
          )}
        </div>

        <button
          className="carousel-btn next"
          onClick={() => scroll('next')}
          aria-label="Next"
        >
          →
        </button>
      </div>
    </section>
  );
}
