'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import './read.css';

export default function ReadPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [chapter, setChapter] = useState(null);
  const [content, setContent] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('vertical'); // 'vertical' or 'paged'
  const [currentPage, setCurrentPage] = useState(0);
  const [lightBg, setLightBg] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    loadChapter();
  }, [id]);

  async function loadChapter() {
    setLoading(true);
    try {
      const allContentRes = await api.getContent({ type: 'MANGA', limit: 100 });
      let foundCh = null;
      let foundContent = null;
      let chapters = [];

      for (const c of allContentRes.content) {
        const detail = await api.getContentById(c.id);
        const ch = detail.content.mangaChapters?.find(ch => ch.id === parseInt(id));
        if (ch) {
          foundCh = ch;
          foundContent = detail.content;
          chapters = detail.content.mangaChapters || [];
          break;
        }
      }

      if (foundCh) {
        setChapter(foundCh);
        setContent(foundContent);
        setAllChapters(chapters);
        setCurrentPage(0);
        document.title = `Ch.${foundCh.chapterNumber}: ${foundCh.title || ''} — ${foundContent.title} | OmniStream`;
      }
    } catch (err) {
      console.error('Error loading chapter:', err);
    } finally {
      setLoading(false);
    }
  }

  // Save progress
  const saveProgress = useCallback(async () => {
    if (!user || !content || !chapter) return;
    try {
      await api.updateProgress({
        contentId: content.id,
        chapterId: chapter.id,
        lastPage: currentPage + 1
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [user, content, chapter, currentPage]);

  useEffect(() => {
    const interval = setInterval(saveProgress, 15000);
    return () => clearInterval(interval);
  }, [saveProgress]);

  // Scroll progress tracking
  useEffect(() => {
    if (mode !== 'vertical') return;
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);

      // Calculate current page from scroll position
      if (chapter?.pages) {
        const pageEstimate = Math.floor((progress / 100) * chapter.pages.length);
        setCurrentPage(Math.min(pageEstimate, chapter.pages.length - 1));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode, chapter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!chapter?.pages) return;
      if (mode === 'paged') {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          setCurrentPage(p => Math.min(p + 1, chapter.pages.length - 1));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          setCurrentPage(p => Math.max(p - 1, 0));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, chapter]);

  const currentCh = allChapters.findIndex(c => c.id === parseInt(id));
  const prevCh = currentCh > 0 ? allChapters[currentCh - 1] : null;
  const nextCh = currentCh < allChapters.length - 1 ? allChapters[currentCh + 1] : null;

  if (loading) {
    return (
      <div className="read-page page-enter">
        <div className="skeleton" style={{ width: '100%', height: '100vh' }} />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1>Chapter not found</h1>
        <Link href="/browse" className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>Browse</Link>
      </div>
    );
  }

  const pages = chapter.pages || [];

  return (
    <div className={`read-page page-enter ${lightBg ? 'reader-bg-light' : ''}`} ref={containerRef}>
      <div className="reader-progress" style={{ width: mode === 'vertical' ? `${scrollProgress}%` : `${((currentPage + 1) / pages.length) * 100}%` }} />

      <div className="reader-toolbar">
        <div className="reader-title">
          {content && (
            <Link href={`/manga/${content.id}`}>{content.title}</Link>
          )}
          {' '} — Ch.{chapter.chapterNumber}: {chapter.title}
        </div>

        <div className="reader-controls">
          <span className="reader-page-info">
            {currentPage + 1} / {pages.length}
          </span>

          <div className="reader-mode-toggle">
            <button
              className={mode === 'vertical' ? 'active' : ''}
              onClick={() => setMode('vertical')}
            >
              Scroll
            </button>
            <button
              className={mode === 'paged' ? 'active' : ''}
              onClick={() => setMode('paged')}
            >
              Page
            </button>
          </div>

          <button
            className="btn btn-ghost"
            onClick={() => setLightBg(!lightBg)}
            style={{ fontSize: '0.813rem', padding: '6px 12px' }}
          >
            {lightBg ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {mode === 'vertical' ? (
        <div className="reader-vertical">
          {pages.map((pageUrl, i) => (
            <img
              key={i}
              src={pageUrl}
              alt={`Page ${i + 1}`}
              loading="lazy"
            />
          ))}
        </div>
      ) : (
        <div className="reader-paged">
          <div
            className="reader-paged-nav prev"
            onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
          />
          <img
            src={pages[currentPage]}
            alt={`Page ${currentPage + 1}`}
          />
          <div
            className="reader-paged-nav next"
            onClick={() => setCurrentPage(p => Math.min(p + 1, pages.length - 1))}
          />
        </div>
      )}

      <div className="reader-chapter-nav">
        {prevCh ? (
          <Link href={`/read/${prevCh.id}`} className="btn btn-secondary">
            ← Previous Chapter
          </Link>
        ) : <div />}
        {content && (
          <Link href={`/manga/${content.id}`} className="btn btn-ghost">
            📋 All Chapters
          </Link>
        )}
        {nextCh ? (
          <Link href={`/read/${nextCh.id}`} className="btn btn-primary">
            Next Chapter →
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
