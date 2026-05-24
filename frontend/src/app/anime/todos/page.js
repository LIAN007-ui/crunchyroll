"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnimeTodosPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to browse filtered by anime
    router.replace('/browse?type=ANIME');
  }, [router]);

  return (
    <div className="page-enter" style={{ padding: '48px' }}>
      <div className="container">
        <h2>Redirigiendo a Anime…</h2>
        <p>If you are not redirected, <a href="/browse?type=ANIME">click here</a>.</p>
      </div>
    </div>
  );
}
