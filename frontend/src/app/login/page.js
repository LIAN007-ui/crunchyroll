'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import '../auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@omnistream.com');
    setPassword('demo123');
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="logo gradient-text">OmniStream</h1>
          <p>{t('auth.signInTitle')}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} id="login-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} id="login-btn">
            {loading ? `⏳ ${t('auth.signingIn')}` : `🚀 ${t('auth.signInBtn')}`}
          </button>
        </form>

        <div className="auth-footer">
          {t('auth.dontHaveAccount')} <Link href="/register">{t('auth.signUpBtn') || t('nav.signUp') }</Link>
        </div>

        <div className="auth-demo">
          <p>{t('auth.demoAccount')} <strong>demo@omnistream.com</strong> / <strong>demo123</strong></p>
          <button onClick={fillDemo} className="btn btn-ghost" style={{ marginTop: '8px', fontSize: '0.813rem' }}>
            {t('auth.fillDemo')}
          </button>
        </div>
      </div>
    </div>
  );
}
