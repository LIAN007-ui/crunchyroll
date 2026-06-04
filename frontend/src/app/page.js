'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import HeroBanner from '@/components/HeroBanner';
import Link from 'next/link';
import Carousel from '@/components/Carousel';
import './home.css';

export default function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newAnime, setNewAnime] = useState([]);
  const [popularManga, setPopularManga] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const [featuredRes, trendingRes, animeRes, mangaRes] = await Promise.all([
        api.getFeatured(),
        api.getContent({ sort: 'rating', limit: 15 }),
        api.getContent({ type: 'ANIME', sort: 'newest', limit: 15 }),
        api.getContent({ type: 'MANGA', sort: 'rating', limit: 15 }),
      ]);

      setFeatured(featuredRes.featured || []);
      setTrending(trendingRes.content || []);
      setNewAnime(animeRes.content || []);
      setPopularManga(mangaRes.content || []);

      // Load user-specific data
      if (user) {
        try {
          const [recsRes, progressRes] = await Promise.all([
            api.getRecommendations(),
            api.getProgress()
          ]);
          setRecommendations(recsRes.recommendations || []);
          setContinueWatching((progressRes.progress || []).map(p => ({
            ...p.content,
            userProgress: p
          })));
        } catch (e) {
          console.error('Error loading user data:', e);
        }
      }
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home-page page-enter">
      <HeroBanner items={featured} />

      <div className="home-content">
        {user && continueWatching.length > 0 && (
          <Carousel
            title="Continue Watching"
            emoji="▶️"
            items={continueWatching}
            loading={loading}
          />
        )}

        <Carousel
          title="Trending Now"
          emoji="🔥"
          items={trending}
          viewAllHref="/browse?sort=rating"
          loading={loading}
        />

        {user && recommendations.length > 0 && (
          <Carousel
            title="Recommended for You"
            emoji="✨"
            items={recommendations}
            loading={loading}
          />
        )}

        <Carousel
          title="Latest Anime"
          emoji="📺"
          items={newAnime}
          viewAllHref="/browse?type=ANIME"
          loading={loading}
        />

        <Carousel
          title="Popular Manga"
          emoji="📖"
          items={popularManga}
          viewAllHref="/browse?type=MANGA"
          loading={loading}
        />

        {/* Genre Quick Links */}
        <section className="genre-section">
          <h2>📂 Browse by Genre</h2>
            <div className="genre-grid">
            {['Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Comedy', 'Mystery',
              'Horror', 'Adventure', 'Drama', 'Slice of Life', 'Supernatural', 'Music'
            ].map(genre => (
              <Link
                key={genre}
                href={`/browse?genre=${encodeURIComponent(genre)}`}
                className="genre-card"
              >
                <span className="genre-name">{genre}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
