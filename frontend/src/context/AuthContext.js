'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getProfile();
      setUser(data.user);
    } catch (err) {
      api.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    const data = await api.register(username, email, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const result = await api.updateProfile(data);
    setUser(result.user);
    return result;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
