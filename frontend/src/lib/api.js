const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

import mockApi from './mockApi';

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
    return this.request(`/content?${query}`);
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
