"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MangaTodosPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to browse filtered by manga
    router.replace('/browse?type=MANGA');
  }, [router]);

  return (
    <div className="page-enter" style={{ padding: '48px' }}>
      <div className="container">
        <h2>Redirigiendo a Manga…</h2>
        <p>If you are not redirected, <a href="/browse?type=MANGA">click here</a>.</p>
      </div>
    </div>
  );
}
