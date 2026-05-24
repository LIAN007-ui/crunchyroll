'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations, defaultLanguage } from '@/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(defaultLanguage);

  useEffect(() => {
    const savedLang = localStorage.getItem('omnistream_lang');
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang) => {
    if (newLang === 'es' || newLang === 'en') {
      setLangState(newLang);
      localStorage.setItem('omnistream_lang', newLang);
    }
  };

  // Light translation function supporting nested keys (e.g., 'nav.home') and replacements (e.g. {page})
  const t = (key, replacements = {}) => {
    const dict = translations[lang] || translations[defaultLanguage];
    const keys = key.split('.');
    let value = dict;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to raw key if not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Handle replacements (e.g., {page})
    let formatted = value;
    Object.entries(replacements).forEach(([k, v]) => {
      formatted = formatted.replace(new RegExp(`{${k}}`, 'g'), v);
    });

    return formatted;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
