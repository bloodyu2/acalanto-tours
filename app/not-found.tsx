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
      <p style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚓</p>
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
