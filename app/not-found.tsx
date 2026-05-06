import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)', display: 'flex', justifyContent: 'center' }}><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 12H2a10 10 0 0020 0h-3"/></svg></div>
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        color: 'var(--ocean-deep)',
        marginBottom: '0.75rem',
      }}>
        Pagina nao encontrada
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '400px', lineHeight: 1.6 }}>
        Esta pagina nao existe ou foi removida. Que tal explorar nossos passeios?
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/passeios"
          style={{
            background: 'var(--ocean-deep)',
            color: 'white',
            padding: '0.75rem 1.75rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          Ver passeios
        </Link>
        <Link
          href="/"
          style={{
            background: 'var(--sand)',
            color: 'var(--text-primary)',
            padding: '0.75rem 1.75rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: '1px solid var(--border)',
          }}
        >
          Inicio
        </Link>
      </div>
    </div>
  )
}
