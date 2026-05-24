'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import ContentCard, { ContentCardSkeleton } from './ContentCard';
import './Carousel.css';

export default function Carousel({ items = [], title, emoji, viewAllHref, loading }) {
  const trackRef = useRef(null);

  const scroll = (direction) => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const children = track.children;
    let step = track.clientWidth * 0.8;
    if (children && children.length > 0) {
      if (children.length > 1) {
        // distance between first two children (accounts for gap)
        step = Math.abs(children[1].offsetLeft - children[0].offsetLeft);
      } else {
        step = children[0].clientWidth;
      }
    }

    track.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth'
    });
  };

  // keyboard support: allow left/right arrows when track is focused
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scroll('next');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scroll('prev');
      }
    };
    track.addEventListener('keydown', onKey);
    return () => track.removeEventListener('keydown', onKey);
  }, []);

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

        <div className="carousel-track" ref={trackRef} tabIndex={0} aria-label={`${title} carousel`}>
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
