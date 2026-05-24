const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

import mockApi from './mockApi';
// External public APIs fallbacks
const JIKAN_BASE = 'https://api.jikan.moe/v4';
const MANGADEX_BASE = 'https://api.mangadex.org';
const USE_PROXY = process.env.NEXT_PUBLIC_USE_PROXY === 'true';

// When `USE_PROXY` is true, prefer calling the backend proxy at /api/proxy/... to avoid CORS
async function fetchFromProxyJikan(params = {}) {
  const url = new URL('/api/proxy/jikan/anime', typeof window !== 'undefined' ? window.location.origin : '');
  if (params.search) url.searchParams.set('q', params.search);
  if (params.sort === 'rating') url.searchParams.set('order_by', 'score');
  if (params.sort === 'newest') url.searchParams.set('order_by', 'aired');
  url.searchParams.set('limit', params.limit || 12);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Proxy Jikan fetch failed');
  const data = await res.json();
  const content = (data.data || []).map(item => ({
    id: `anime-${item.mal_id}`,
    type: 'ANIME',
    title: item.title,
    coverUrl: item.images?.jpg?.large_image_url || item.images?.webp?.large_image_url || '',
    bannerUrl: item.trailer?.images?.medium || '',
    description: item.synopsis || '',
    rating: item.score || 0,
    year: item.aired?.prop?.from?.year || null,
    episodeCount: item.episodes || 0,
    status: item.status ? item.status.toUpperCase() : 'UNKNOWN',
    genres: (item.genres || []).slice(0, 3).map(g => g.name),
    inWatchlist: false,
    bookmarkCount: 0,
    episodes: []
  }));
  return { content };
}

async function fetchFromProxyJikanById(id) {
  let mal = id;
  if (typeof id === 'string' && id.startsWith('anime-')) mal = id.split('-')[1];
  if (!mal) throw new Error('Invalid anime id');
  const url = new URL(`/api/proxy/jikan/anime/${mal}`, typeof window !== 'undefined' ? window.location.origin : '');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Proxy Jikan fetch failed');
  const json = await res.json();
  const item = json.data;
  return { content: {
    id: `anime-${item.mal_id}`,
    type: 'ANIME',
    title: item.title,
    coverUrl: item.images?.jpg?.large_image_url || '',
    bannerUrl: item.trailer?.images?.medium || '',
    description: item.synopsis || '',
    rating: item.score || 0,
    year: item.aired?.prop?.from?.year || null,
    episodeCount: item.episodes || 0,
    status: item.status ? item.status.toUpperCase() : 'UNKNOWN',
    genres: (item.genres || []).map(g => g.name),
    inWatchlist: false,
    bookmarkCount: 0,
    episodes: []
  } };
}

async function fetchFromJikan(params = {}) {
  // Basic mapping for list endpoints
  const url = new URL(`${JIKAN_BASE}/anime`);
  if (params.search) url.searchParams.set('q', params.search);
  if (params.sort === 'rating') url.searchParams.set('order_by', 'score');
  if (params.sort === 'newest') url.searchParams.set('order_by', 'aired');
  url.searchParams.set('limit', params.limit || 12);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Jikan fetch failed');
  const data = await res.json();
  const content = (data.data || []).map(item => ({
    id: `anime-${item.mal_id}`,
    type: 'ANIME',
    title: item.title,
    coverUrl: item.images?.jpg?.large_image_url || item.images?.webp?.large_image_url || '',
    bannerUrl: item.trailer?.images?.medium || '',
    description: item.synopsis || '',
    rating: item.score || 0,
    year: item.aired?.prop?.from?.year || null,
    episodeCount: item.episodes || 0,
    status: item.status ? item.status.toUpperCase() : 'UNKNOWN',
    genres: (item.genres || []).slice(0, 3).map(g => g.name),
    inWatchlist: false,
    bookmarkCount: 0,
    episodes: []
  }));
  return { content };
}

async function fetchFromJikanById(id) {
  // Accept numeric id or 'anime-<num>'
  let mal = id;
  if (typeof id === 'string' && id.startsWith('anime-')) mal = id.split('-')[1];
  if (!mal) throw new Error('Invalid anime id');
  const res = await fetch(`${JIKAN_BASE}/anime/${mal}`);
  if (!res.ok) throw new Error('Jikan fetch failed');
  const { data: item } = await res.json();
  return { content: {
    id: `anime-${item.mal_id}`,
    type: 'ANIME',
    title: item.title,
    coverUrl: item.images?.jpg?.large_image_url || '',
    bannerUrl: item.trailer?.images?.medium || '',
    description: item.synopsis || '',
    rating: item.score || 0,
    year: item.aired?.prop?.from?.year || null,
    episodeCount: item.episodes || 0,
    status: item.status ? item.status.toUpperCase() : 'UNKNOWN',
    genres: (item.genres || []).map(g => g.name),
    inWatchlist: false,
    bookmarkCount: 0,
    episodes: []
  } };
}

async function fetchFromMangaDex(params = {}) {
  // Simple search: map to our shape minimally
  const url = new URL(`${MANGADEX_BASE}/manga`);
  if (params.search) url.searchParams.set('title', params.search);
  url.searchParams.set('limit', params.limit || 12);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('MangaDex fetch failed');
  const data = await res.json();
  const content = (data.data || []).map(entry => ({
    id: `manga-${entry.id}`,
    type: 'MANGA',
    title: entry.attributes?.title?.en || Object.values(entry.attributes?.title || {})[0] || 'Manga',
    coverUrl: `/images/sample-1.svg`,
    bannerUrl: `/images/sample-banner-1.svg`,
    description: entry.attributes?.description?.en || '',
    rating: 0,
    year: entry.attributes?.year || null,
    chapterCount: 0,
    status: (entry.attributes?.status || 'UNKNOWN').toUpperCase(),
    genres: [],
    inWatchlist: false,
    bookmarkCount: 0
  }));
  return { content };
}

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('omnistream_token');
  }

  setToken(token) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('omnistream_token', token);
  }

  removeToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('omnistream_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to server. Please try again.');
      }
      throw error;
    }
  }

  // Auth
  async register(username, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(data) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  logout() {
    this.removeToken();
  }

  // Content
  async getContent(params = {}) {
    const query = new URLSearchParams(params).toString();
    try {
      return await this.request(`/content?${query}`);
    } catch (err) {
      // Try external providers depending on type
      try {
        if (USE_PROXY) {
          if (params.type === 'ANIME') return await fetchFromProxyJikan(params);
          if (params.type === 'MANGA') return await fetchFromMangaDex(params);
          return await fetchFromProxyJikan(params);
        }

        if (params.type === 'ANIME') return await fetchFromJikan(params);
        if (params.type === 'MANGA') return await fetchFromMangaDex(params);
        // Generic: try Jikan first
        return await fetchFromJikan(params);
      } catch (e) {
        return mockApi.getContent(params);
      }
    }
  }

  async getFeatured() {
    try {
      return await this.request('/content/featured');
    } catch (err) {
      return mockApi.getFeatured();
    }
  }

  async getContentById(id) {
    try {
      return await this.request(`/content/${id}`);
    } catch (err) {
      // Try external providers (prefer proxy when configured)
      try {
        if (USE_PROXY) {
          if (typeof id === 'string' && id.startsWith('anime-')) return await fetchFromProxyJikanById(id);
          if (typeof id === 'string' && id.startsWith('manga-')) {
            // Try proxy to MangaDex
            const mdId = id.split('-')[1];
            const res = await fetch(`/api/proxy/mangadex/manga/${mdId}`);
            if (res.ok) {
              const json = await res.json();
              return { content: {
                id: `manga-${json.data.id}`,
                type: 'MANGA',
                title: json.data.attributes?.title?.en || Object.values(json.data.attributes?.title || {})[0] || 'Manga',
                coverUrl: `/images/sample-1.svg`,
                bannerUrl: `/images/sample-banner-1.svg`,
                description: json.data.attributes?.description?.en || '',
                rating: 0,
                year: json.data.attributes?.year || null,
                chapterCount: 0,
                status: (json.data.attributes?.status || 'UNKNOWN').toUpperCase(),
                genres: [],
                inWatchlist: false,
                bookmarkCount: 0
              } };
            }
          }
        } else {
          if (typeof id === 'string' && id.startsWith('anime-')) return await fetchFromJikanById(id);
          if (typeof id === 'string' && id.startsWith('manga-')) {
            const mdId = id.split('-')[1];
            const res = await fetch(`${MANGADEX_BASE}/manga/${mdId}`);
            if (res.ok) {
              const json = await res.json();
              return { content: {
                id: `manga-${json.data.id}`,
                type: 'MANGA',
                title: json.data.attributes?.title?.en || Object.values(json.data.attributes?.title || {})[0] || 'Manga',
                coverUrl: `/images/sample-1.svg`,
                bannerUrl: `/images/sample-banner-1.svg`,
                description: json.data.attributes?.description?.en || '',
                rating: 0,
                year: json.data.attributes?.year || null,
                chapterCount: 0,
                status: (json.data.attributes?.status || 'UNKNOWN').toUpperCase(),
                genres: [],
                inWatchlist: false,
                bookmarkCount: 0
              } };
            }
          }
        }
      } catch (e) {
        // fall through to mock
      }
      return mockApi.getContentById(id);
    }
  }

  async getEpisodes(contentId) {
    try {
      return await this.request(`/content/${contentId}/episodes`);
    } catch (err) {
      return mockApi.getEpisodes(contentId);
    }
  }

  async getChapters(contentId) {
    try {
      return await this.request(`/content/${contentId}/chapters`);
    } catch (err) {
      return mockApi.getChapters(contentId);
    }
  }

  // Watchlist
  async getWatchlist() {
    try {
      return await this.request('/watchlist');
    } catch (err) {
      return mockApi.getWatchlist();
    }
  }

  async addToWatchlist(contentId) {
    return this.request(`/watchlist/${contentId}`, { method: 'POST' });
  }

  async removeFromWatchlist(contentId) {
    return this.request(`/watchlist/${contentId}`, { method: 'DELETE' });
  }

  // Progress
  async getProgress() {
    try {
      return await this.request('/progress');
    } catch (err) {
      return mockApi.getProgress();
    }
  }

  async getContentProgress(contentId) {
    try {
      return await this.request(`/progress/${contentId}`);
    } catch (err) {
      return mockApi.getContentProgress(contentId);
    }
  }

  async updateProgress(data) {
    return this.request('/progress', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Recommendations
  async getRecommendations() {
    try {
      return await this.request('/recommendations');
    } catch (err) {
      return mockApi.getRecommendations();
    }
  }
}

const api = new ApiClient();
export default api;
