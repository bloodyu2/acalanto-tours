import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      background: 'var(--sand)',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🌊</div>
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        color: 'var(--ocean-deep)',
        marginBottom: '0.75rem',
      }}>
        Página não encontrada
      </h1>
      <p style={{
        color: 'var(--text-muted)',
        fontSize: '1.0625rem',
        maxWidth: '400px',
        lineHeight: 1.65,
        marginBottom: '2rem',
      }}>
        Esta página não existe ou foi movida. Que tal explorar nossos passeios de escuna em Paraty?
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            background: 'var(--ocean-deep)',
            color: 'white',
            padding: '0.875rem 1.75rem',
            borderRadius: '0.875rem',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '0.9375rem',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Ir para o início
        </Link>
        <Link
          href="/passeios"
          style={{
            padding: '0.875rem 1.75rem',
            borderRadius: '0.875rem',
            border: '1.5px solid var(--ocean-deep)',
            color: 'var(--ocean-deep)',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '0.9375rem',
          }}
        >
          Ver passeios
        </Link>
      </div>
    </div>
  )
}
