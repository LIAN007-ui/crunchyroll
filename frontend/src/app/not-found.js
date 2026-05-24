import Link from 'next/link';

export const metadata = {
  title: '404 — Página no encontrada | OmniStream',
};

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)',
      textAlign: 'center',
      padding: '40px 20px',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{
        fontSize: 'clamp(6rem, 15vw, 10rem)',
        fontFamily: 'var(--font-heading)',
        fontWeight: 900,
        background: 'var(--accent-gradient)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1,
        marginBottom: '16px',
        animation: 'pulse404 2s ease-in-out infinite',
      }}>
        404
      </div>

      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
        fontWeight: 700,
        marginBottom: '12px',
        color: 'var(--text-primary)',
      }}>
        ¡Oops! Página no encontrada
      </h1>

      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        maxWidth: '480px',
        marginBottom: '32px',
        lineHeight: 1.6,
      }}>
        Parece que esta página se perdió en otra dimensión. No te preocupes, puedes volver al inicio y seguir explorando el mejor contenido de anime y manga.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          🏠 Volver al Inicio
        </Link>
        <Link href="/browse" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
          🔍 Explorar Catálogo
        </Link>
      </div>

      <style>{`
        @keyframes pulse404 {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
}
