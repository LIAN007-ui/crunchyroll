'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);

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
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

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
            <Link href="/" className={pathname === '/' ? 'active' : ''}>Home</Link>
            <Link href="/browse" className={pathname === '/browse' ? 'active' : ''}>Browse</Link>
            <Link href="/browse?type=ANIME" className={pathname.includes('anime') ? 'active' : ''}>Anime</Link>
            <Link href="/browse?type=MANGA" className={pathname.includes('manga') ? 'active' : ''}>Manga</Link>
          </div>

          <form className="navbar-search" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search anime, manga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="nav-search"
            />
          </form>

          <div className="navbar-actions" ref={menuRef}>
            {user ? (
              <>
                <div
                  className="navbar-avatar"
                  onClick={() => setMenuOpen(!menuOpen)}
                  id="user-avatar"
                >
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.username} />
                  ) : (
                    user.username[0].toUpperCase()
                  )}
                </div>
                {menuOpen && (
                  <div className="navbar-user-menu">
                    <div style={{ padding: '8px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {user.username}
                    </div>
                    <div className="menu-divider" />
                    <Link href="/profile" onClick={() => setMenuOpen(false)}>
                      👤 Profile
                    </Link>
                    <Link href="/profile#watchlist" onClick={() => setMenuOpen(false)}>
                      📋 My Watchlist
                    </Link>
                    <div className="menu-divider" />
                    <button onClick={handleLogout}>
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost navbar-desktop-only">Sign In</Link>
                <Link href="/register" className="btn btn-primary navbar-desktop-only">Sign Up</Link>
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
      <div className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* Mobile slide-in panel */}
      <div className={`mobile-panel ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-panel-header">
          <Link href="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
            <span className="logo-icon">▶</span>
            <span className="logo-text">OmniStream</span>
          </Link>
        </div>

        <form className="mobile-search" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search anime, manga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <nav className="mobile-nav-links">
          <Link href="/" className={pathname === '/' ? 'active' : ''} onClick={() => setMobileOpen(false)}>
            🏠 Home
          </Link>
          <Link href="/browse" className={pathname === '/browse' ? 'active' : ''} onClick={() => setMobileOpen(false)}>
            🔍 Browse
          </Link>
          <Link href="/browse?type=ANIME" onClick={() => setMobileOpen(false)}>
            📺 Anime
          </Link>
          <Link href="/browse?type=MANGA" onClick={() => setMobileOpen(false)}>
            📖 Manga
          </Link>
        </nav>

        <div className="mobile-divider" />

        {user ? (
          <div className="mobile-user-section">
            <div className="mobile-user-info">
              <div className="navbar-avatar" style={{ width: 44, height: 44, fontSize: '1rem' }}>
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.username} />
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
              👤 Mi Perfil
            </Link>
            <Link href="/profile#watchlist" className="mobile-nav-link-btn" onClick={() => setMobileOpen(false)}>
              📋 Mi Watchlist
            </Link>
            <button className="mobile-nav-link-btn logout-btn" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="mobile-auth-section">
            <Link href="/login" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setMobileOpen(false)}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
