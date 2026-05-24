'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setLoading(true);
    setProgress(20);
  }, []);

  useEffect(() => {
    startLoading();
    const timer1 = setTimeout(() => setProgress(60), 100);
    const timer2 = setTimeout(() => setProgress(80), 300);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname, startLoading]);

  if (!loading && progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #7c3aed, #f97316)',
          borderRadius: '0 2px 2px 0',
          transition: progress === 0
            ? 'none'
            : progress === 100
              ? 'width 150ms ease-out, opacity 200ms ease-out'
              : 'width 400ms ease-out',
          opacity: progress === 100 ? 0 : 1,
          boxShadow: '0 0 10px rgba(124, 58, 237, 0.5), 0 0 5px rgba(249, 115, 22, 0.3)',
        }}
      />
    </div>
  );
}
