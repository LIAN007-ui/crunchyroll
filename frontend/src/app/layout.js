import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'OmniStream — Anime & Manga Streaming',
  description: 'Watch anime and read manga with OmniStream. Discover trending titles, get personalized recommendations, and track your progress across your favorite series.',
  keywords: 'anime, manga, streaming, watch anime, read manga, omnistream',
  openGraph: {
    title: 'OmniStream — Anime & Manga Streaming',
    description: 'Your ultimate anime and manga platform',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
