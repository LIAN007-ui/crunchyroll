'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import './watch.css';

export default function WatchPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [episode, setEpisode] = useState(null);
  const [content, setContent] = useState(null);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    loadEpisode();
  }, [id]);

  async function loadEpisode() {
    setLoading(true);
    try {
      // Find the episode by getting all content and searching
      const allContentRes = await api.getContent({ type: 'ANIME', limit: 100 });
      let foundEp = null;
      let foundContent = null;
      let episodes = [];

      for (const c of allContentRes.content) {
        const detail = await api.getContentById(c.id);
        const ep = detail.content.episodes?.find(e => e.id === parseInt(id));
        if (ep) {
          foundEp = ep;
          foundContent = detail.content;
          episodes = detail.content.episodes || [];
          break;
        }
      }

      if (foundEp) {
        setEpisode(foundEp);
        setContent(foundContent);
        setAllEpisodes(episodes);
        document.title = `${foundEp.title} — ${foundContent.title} | OmniStream`;
      }
    } catch (err) {
      console.error('Error loading episode:', err);
    } finally {
      setLoading(false);
    }
  }

  // Save progress every 30 seconds
  const saveProgress = useCallback(async () => {
    if (!user || !content || !episode || !videoRef.current) return;
    try {
      await api.updateProgress({
        contentId: content.id,
        episodeId: episode.id,
        lastTimestamp: Math.floor(videoRef.current.currentTime)
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [user, content, episode]);

  useEffect(() => {
    const interval = setInterval(saveProgress, 30000);
    return () => clearInterval(interval);
  }, [saveProgress]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * duration;
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 85, duration);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    const container = document.querySelector('.video-container');
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container?.requestFullscreen();
    }
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Find prev/next episodes
  const currentIndex = allEpisodes.findIndex(e => e.id === parseInt(id));
  const prevEp = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
  const nextEp = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoRef.current) return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          videoRef.current.currentTime += 10;
          break;
        case 'ArrowLeft':
          videoRef.current.currentTime -= 10;
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case 's':
          skipForward();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, playing]);

  if (loading) {
    return (
      <div className="watch-page page-enter">
        <div className="video-container" style={{ height: '70vh' }}>
          <div className="skeleton" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1>Episode not found</h1>
        <Link href="/browse" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>Browse</Link>
      </div>
    );
  }

  return (
    <div className="watch-page page-enter">
      <div className="watch-top-bar">
        <Link href="/" className="back-home-btn" title="Menú Principal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Inicio</span>
        </Link>
        {content && (
          <Link href={`/anime/${content.id}`} className="back-anime-btn">
            {content.title}
          </Link>
        )}
      </div>
      <div className="video-container" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={episode.videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setPlaying(false)}
          playsInline
        />

        <div className="video-controls" onClick={(e) => e.stopPropagation()}>
          <div className="video-progress" onClick={handleSeek}>
            <div
              className="video-progress-fill"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>

          <div className="video-buttons">
            <div className="video-buttons-left">
              <button className="video-btn" onClick={togglePlay}>
                {playing ? '⏸' : '▶'}
              </button>
              {prevEp && (
                <Link href={`/watch/${prevEp.id}`} className="video-btn">⏮</Link>
              )}
              {nextEp && (
                <Link href={`/watch/${nextEp.id}`} className="video-btn">⏭</Link>
              )}
              <button className="video-btn" onClick={skipForward} title="Skip Intro (+85s)">
                ⏩
              </button>
              <button className="video-btn" onClick={toggleMute}>
                {muted ? '🔇' : '🔊'}
              </button>
              <span className="video-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="video-buttons-right">
              <button className="video-btn" onClick={toggleFullscreen}>⛶</button>
            </div>
          </div>
        </div>
      </div>

      <div className="watch-info">
        <div className="watch-episode-title">
          <span className="ep-number">S{episode.seasonNumber} E{episode.episodeNumber}</span>
          <h1>{episode.title}</h1>
        </div>
        {content && (
          <div className="watch-anime-link">
            From <Link href={`/anime/${content.id}`}>{content.title}</Link>
          </div>
        )}
      </div>

      <div className="watch-nav">
        {prevEp ? (
          <Link href={`/watch/${prevEp.id}`} className="btn btn-secondary">
            ← Previous Episode
          </Link>
        ) : <div />}
        {nextEp ? (
          <Link href={`/watch/${nextEp.id}`} className="btn btn-primary">
            Next Episode →
          </Link>
        ) : <div />}
      </div>

      {allEpisodes.length > 0 && (
        <div className="watch-episodes">
          <h2>All Episodes</h2>
          <div className="watch-episode-list">
            {allEpisodes.map(ep => (
              <Link
                key={ep.id}
                href={`/watch/${ep.id}`}
                className={`watch-ep-card ${ep.id === parseInt(id) ? 'active' : ''}`}
              >
                <div className="watch-ep-thumb">
                    {ep.thumbnailUrl || content?.coverUrl ? (
                      <Image src={ep.thumbnailUrl || content?.coverUrl} alt={ep.title} fill style={{ objectFit: 'cover' }} />
                    ) : null}
                </div>
                <div className="watch-ep-info">
                  <div className="ep-num">S{ep.seasonNumber} E{ep.episodeNumber}</div>
                  <div className="ep-title">{ep.title}</div>
                  <div className="ep-dur">{ep.duration ? `${Math.floor(ep.duration / 60)} min` : ''}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
