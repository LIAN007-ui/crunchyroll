'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);
  const searchDebounce = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      // keep the query in the input for UX (real-time search)
      setMobileOpen(false);
    }
  };

  // Real-time search (debounced) — update browse results as user types
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      const q = (searchQuery || '').trim();
      if (q.length > 0) {
        // use replace to avoid polluting history while typing
        router.replace(`/browse?search=${encodeURIComponent(q)}`);
      } else {
        // if input cleared, go back to browse without search
        if (pathname === '/browse' || pathname.startsWith('/browse')) {
          router.replace('/browse');
        }
      }
    }, 450);
    return () => clearTimeout(searchDebounce.current);
  }, [searchQuery, router, pathname]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    router.push('/');
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <span className="logo-icon">▶</span>
            <span className="logo-text">OmniStream</span>
          </Link>

          <div className="navbar-nav">
            <Link href="/" className={pathname === '/' ? 'active' : ''}>{t('nav.home')}</Link>
            <Link href="/explorar" className={pathname === '/explorar' || pathname === '/browse' ? 'active' : ''}>{t('nav.browse')}</Link>
            <Link href="/anime" className={pathname.includes('/anime') ? 'active' : ''}>{t('nav.anime')}</Link>
            <Link href="/manga" className={pathname.includes('/manga') ? 'active' : ''}>{t('nav.manga')}</Link>
          </div>

          <form className="navbar-search" onSubmit={handleSearch} role="search">
            <label htmlFor="nav-search" className="sr-only">Search</label>
            <input
              type="text"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="nav-search"
              aria-label={t('nav.searchPlaceholder')}
            />
            <button type="submit" className="search-btn" aria-label="Search">
              🔍
            </button>
          </form>

          <div className="navbar-actions" ref={menuRef}>
            <button 
              className="lang-toggle-btn navbar-desktop-only"
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              aria-label="Toggle language"
              title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              🌐 {lang.toUpperCase()}
            </button>

            <button
              className="theme-toggle-btn navbar-desktop-only"
              onClick={toggle}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Cambiar a modo oscuro'}
              style={{ marginLeft: 8 }}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            {user ? (
              <>
                <button
                  className="navbar-avatar"
                  onClick={() => setMenuOpen(!menuOpen)}
                  id="user-avatar"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  {user.profilePic ? (
                    <Image src={user.profilePic} alt={user.username} width={36} height={36} style={{ borderRadius: '50%' }} />
                  ) : (
                    <span aria-hidden="true">{user.username[0].toUpperCase()}</span>
                  )}
                </button>
                {menuOpen && (
                  <div className="navbar-user-menu">
                    <div style={{ padding: '8px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {user.username}
                    </div>
                    <div className="menu-divider" />
                    <Link href="/profile" onClick={() => setMenuOpen(false)}>
                      👤 {t('nav.profile')}
                    </Link>
                    <Link href="/profile#watchlist" onClick={() => setMenuOpen(false)}>
                      📋 {t('nav.watchlist')}
                    </Link>
                    <div className="menu-divider" />
                    <button onClick={handleLogout}>
                      🚪 {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost navbar-desktop-only">{t('nav.signIn')}</Link>
                <Link href="/register" className="btn btn-primary navbar-desktop-only">{t('nav.signUp')}</Link>
              </>
            )}

            {/* Hamburger button */}
            <button
              className={`mobile-menu-btn ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
              id="mobile-menu-toggle"
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <button className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)} aria-label="Close mobile menu" />

      {/* Mobile slide-in panel */}
      <div className={`mobile-panel ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-panel-header">
          <Link href="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
            <span className="logo-icon">▶</span>
            <span className="logo-text">OmniStream</span>
          </Link>
        </div>

          <form className="mobile-search" onSubmit={handleSearch} role="search">
          <label htmlFor="mobile-search" className="sr-only">Search</label>
          <input
            id="mobile-search"
            type="text"
            placeholder={t('nav.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('nav.searchPlaceholder')}
          />
          <button type="submit" className="search-btn" aria-label="Search">🔍</button>
        </form>

          <nav className="mobile-nav-links">
          <Link href="/" className={pathname === '/' ? 'active' : ''} onClick={() => setMobileOpen(false)}>
            🏠 {t('nav.home')}
          </Link>
          <Link href="/explorar" className={pathname === '/explorar' || pathname === '/browse' ? 'active' : ''} onClick={() => setMobileOpen(false)}>
            🔍 {t('nav.browse')}
          </Link>
          <Link href="/anime" onClick={() => setMobileOpen(false)}>
            📺 {t('nav.anime')}
          </Link>
          <Link href="/manga" onClick={() => setMobileOpen(false)}>
            📖 {t('nav.manga')}
          </Link>
        </nav>

        <div className="mobile-divider" />

        <div className="mobile-lang-section" style={{ padding: '0 24px 16px' }}>
          <button 
            className="lang-toggle-btn"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          >
            🌐 {lang === 'es' ? 'Cambiar a Inglés' : 'Switch to Spanish'}
          </button>
        </div>

        <div className="mobile-divider" style={{ marginTop: 0 }} />

        {user ? (
          <div className="mobile-user-section">
            <div className="mobile-user-info">
              <div className="navbar-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>
                {user.profilePic ? (
                  <Image src={user.profilePic} alt={user.username} width={44} height={44} style={{ borderRadius: '50%' }} />
                ) : (
                  user.username[0].toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{user.username}</div>
                <div style={{ fontSize: '0.813rem', color: 'var(--text-tertiary)' }}>{user.email}</div>
              </div>
            </div>
            <Link href="/profile" className="mobile-nav-link-btn" onClick={() => setMobileOpen(false)}>
              👤 {t('nav.profile')}
            </Link>
            <Link href="/profile#watchlist" className="mobile-nav-link-btn" onClick={() => setMobileOpen(false)}>
              📋 {t('nav.watchlist')}
            </Link>
            <button className="mobile-nav-link-btn logout-btn" onClick={handleLogout}>
              🚪 {t('nav.signOut')}
            </button>
          </div>
        ) : (
          <div className="mobile-auth-section">
            <Link href="/login" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setMobileOpen(false)}>
              {t('nav.signIn')}
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setMobileOpen(false)}>
              {t('nav.signUp')}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
