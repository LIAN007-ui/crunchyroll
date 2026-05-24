'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import ContentGrid from '@/components/ContentGrid';
import './profile.css';

export default function ProfilePage() {
  const { user, loading: authLoading, logout, updateProfile } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [watchlist, setWatchlist] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      setNewUsername(user.username);
      loadUserData();
    }
  }, [user, authLoading]);

  async function loadUserData() {
    try {
      const [wlRes, progRes] = await Promise.all([
        api.getWatchlist(),
        api.getProgress()
      ]);
      setWatchlist((wlRes.watchlist || []).map(w => w.content));
      setProgress((progRes.progress || []).map(p => p.content));
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({ username: newUsername.trim() });
      toast.success('Perfil actualizado ✅');
      setEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="profile-page page-enter">
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
      </div>
    );
  }

  // Stats
  const totalAnime = watchlist.filter(c => c.type === 'ANIME').length;
  const totalManga = watchlist.filter(c => c.type === 'MANGA').length;

  return (
    <div className="profile-page page-enter">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.profilePic ? (
              <Image src={user.profilePic} alt={user.username} width={44} height={44} style={{ borderRadius: '50%' }} />
          ) : (
            user.username[0].toUpperCase()
          )}
        </div>
        <div className="profile-details">
          {editing ? (
            <div className="profile-edit-form">
              <input
                className="input profile-edit-input"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Nuevo username"
                minLength={3}
                maxLength={30}
              />
              <div className="profile-edit-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  style={{ fontSize: '0.813rem', padding: '8px 16px' }}
                >
                  {savingProfile ? '⏳ Guardando...' : '✅ Guardar'}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => { setEditing(false); setNewUsername(user.username); }}
                  style={{ fontSize: '0.813rem', padding: '8px 16px' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <h1>{user.username}</h1>
          )}
          <p>{user.email}</p>
          <div className="profile-actions-row">
            {!editing && (
              <button
                className="btn btn-secondary"
                onClick={() => setEditing(true)}
                style={{ fontSize: '0.813rem' }}
              >
                ✏️ Editar Perfil
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => {
                logout();
                toast.info('Sesión cerrada');
                router.push('/');
              }}
              style={{ fontSize: '0.813rem' }}
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="profile-stats">
        <div className="profile-stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-number">{watchlist.length}</div>
          <div className="stat-name">En Watchlist</div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon">▶️</div>
          <div className="stat-number">{progress.length}</div>
          <div className="stat-name">En Progreso</div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon">📺</div>
          <div className="stat-number">{totalAnime}</div>
          <div className="stat-name">Anime</div>
        </div>
        <div className="profile-stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-number">{totalManga}</div>
          <div className="stat-name">Manga</div>
        </div>
      </div>

      <div className="profile-section" id="watchlist">
        <ContentGrid
          title="📋 Mi Watchlist"
          items={watchlist}
          loading={loading}
          emptyMessage="Tu watchlist está vacía. ¡Explora el catálogo para agregar títulos!"
        />
      </div>

      <div className="profile-section">
        <ContentGrid
          title="📊 Continuar Viendo/Leyendo"
          items={progress}
          loading={loading}
          emptyMessage="Aún no hay progreso. ¡Comienza a ver o leer algo!"
        />
      </div>
    </div>
  );
}
