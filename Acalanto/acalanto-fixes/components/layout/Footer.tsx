import Link from 'next/link'

// SVG do ícone A — versão para fundo escuro
function AcalantoIconDark({ size = 32 }: { size?: number }) {
  const h = size
  const w = size * 0.88
  return (
    <svg width={w} height={h} viewBox="0 0 120 136" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(60,68) rotate(-7) translate(-60,-68)">
        <path d="M13,124 Q42,71 64,13" stroke="#F5EDD8" strokeWidth="6" strokeLinecap="round" fill="none"/>
        <line x1="64" y1="13" x2="69" y2="124" stroke="#F5EDD8" strokeWidth="2.8" strokeLinecap="round"/>
        <path d="M64,19 Q92,65 122,120 L69,120 Z" fill="#F4A623"/>
        <path d="M35,75 Q49,70 64,72" stroke="#F5EDD8" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      </g>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ocean-deep)', color: 'rgba(255,255,255,0.85)' }}>

      {/* ── Wave top ── */}
      <div style={{ width: '100%', overflow: 'hidden', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '60px', transform: 'rotate(180deg)' }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>

          {/* ── Brand ── */}
          <div style={{ gridColumn: 'span 2' }}>
            {/* Logo com ícone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.875rem' }}>
              <AcalantoIconDark size={36} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <span style={{
                  fontFamily: 'var(--font-playfair)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: '1.25rem',
                  color: '#F5EDD8',
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                }}>
                  Acalanto
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
                  <div style={{ height: '1.5px', background: 'rgba(255,255,255,0.5)', borderRadius: '999px' }} />
                  <div style={{ height: '1.5px', width: '75%', background: '#F4A623', borderRadius: '999px' }} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-jakarta)',
                  fontWeight: 700,
                  fontSize: '0.5rem',
                  color: 'rgba(245,237,216,0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.38em',
                  marginTop: '3px',
                  paddingLeft: '0.38em',
                }}>
                  Turismo
                </span>
              </div>
            </div>

            <p style={{
              fontSize: '0.85rem', lineHeight: 1.7,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '1.25rem', maxWidth: '260px',
              fontFamily: 'var(--font-jakarta)',
            }}>
              Passeios de escuna, hospedagem, fotografia e serviços exclusivos em Paraty, RJ.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <a
                href="https://instagram.com/acalantoturismo"
                target="_blank" rel="noreferrer"
                aria-label="Instagram"
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.6)',
                  transition: 'background 0.15s, color 0.15s',
                  textDecoration: 'none',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}`}
                target="_blank" rel="noreferrer"
                aria-label="WhatsApp"
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: '#25D366',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', textDecoration: 'none',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* ── Explore ── */}
          <div>
            <h4 style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)',
              marginBottom: '1rem', fontFamily: 'var(--font-jakarta)',
            }}>
              Explore
            </h4>
            {[
              { href: '/passeios',   label: 'Passeios de escuna' },
              { href: '/hotelaria',  label: 'Hospedagem' },
              { href: '/fotografia', label: 'Fotografia' },
              { href: '/servicos',   label: 'Serviços' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                display: 'block', color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none', fontSize: '0.875rem',
                marginBottom: '0.5rem', fontFamily: 'var(--font-jakarta)',
                transition: 'color 0.15s',
              }}>
                {label}
              </Link>
            ))}
          </div>

          {/* ── Empresa ── */}
          <div>
            <h4 style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)',
              marginBottom: '1rem', fontFamily: 'var(--font-jakarta)',
            }}>
              Empresa
            </h4>
            {[
              { href: '/quem-somos',     label: 'Quem somos' },
              { href: '/contato',        label: 'Contato' },
              { href: '/seja-parceiro',  label: 'Seja parceiro' },
              { href: '/parceiros/login',label: 'Área do parceiro' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                display: 'block', color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none', fontSize: '0.875rem',
                marginBottom: '0.5rem', fontFamily: 'var(--font-jakarta)',
              }}>
                {label}
              </Link>
            ))}
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '1.5rem',
          display: 'flex', flexWrap: 'wrap', gap: '1rem',
          justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)',
          fontFamily: 'var(--font-jakarta)',
        }}>
          <span>© {new Date().getFullYear()} Acalanto Turismo · Paraty, RJ · Todos os direitos reservados.</span>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { href: '/privacidade', label: 'Privacidade' },
              { href: '/termos',      label: 'Termos de Uso' },
              { href: '/cancelamento',label: 'Cancelamento' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.8125rem',
              }}>
                {label}
              </Link>
            ))}
            <a href="https://balaio.net" target="_blank" rel="noreferrer" style={{
              color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
            }}>
              Feito com ♥ pela Balaio Digital
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
