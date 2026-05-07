import { createClient } from '@/lib/supabase/server'

export default async function TestimonialsSection() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(6)

  if (!data || data.length === 0) return null

  return (
    <section style={{ padding: '5rem 0', background: 'var(--ocean-deep)', position: 'relative' }}>

      {/* Wave top — vem da seção sand acima */}
      <div style={{ width: '100%', overflow: 'hidden', lineHeight: 0, marginTop: '-5rem' }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '60px' }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" fill="var(--sand-warm)" />
        </svg>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(244,166,35,0.15)',
            color: 'var(--sunset)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem', fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '0.3rem 0.85rem', borderRadius: '999px',
            border: '1px solid rgba(244,166,35,0.3)',
            marginBottom: '0.875rem',
          }}>
            Depoimentos
          </span>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            Quem navegou com a gente
          </h2>
          <p style={{
            fontSize: '1.0625rem',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.65,
            maxWidth: '480px',
            margin: '0 auto',
            fontFamily: 'var(--font-jakarta)',
          }}>
            Cada depoimento é uma memória criada nas águas de Paraty.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {data.map((t, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}>
              {/* Estrelas — cor âmbar, não vermelho */}
              <div style={{ display: 'flex', gap: '2px', marginBottom: '0.875rem' }}>
                {Array.from({ length: t.rating || 5 }).map((_, si) => (
                  <svg key={si} width="15" height="15" viewBox="0 0 24 24" fill="#F4A623">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
                  </svg>
                ))}
              </div>

              {/* Conteúdo */}
              <p style={{
                fontSize: '0.9375rem',
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 1.65,
                marginBottom: '1.25rem',
                fontStyle: 'italic',
                fontFamily: 'var(--font-playfair)',
                flex: 1,
              }}>
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Autor */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--ocean-mid), var(--ocean-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700,
                  fontFamily: 'var(--font-jakarta)', fontSize: '0.875rem',
                  flexShrink: 0,
                }}>
                  {(t.author_name || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{
                    fontWeight: 700, color: 'white',
                    fontSize: '0.875rem', margin: 0,
                    fontFamily: 'var(--font-jakarta)',
                  }}>
                    {t.author_name}
                  </p>
                  {t.author_city && (
                    <p style={{
                      fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)',
                      margin: 0, fontFamily: 'var(--font-mono)',
                    }}>
                      {t.author_city}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wave bottom — transição para branco */}
      <div style={{ width: '100%', overflow: 'hidden', lineHeight: 0, marginTop: '3rem' }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '60px' }}>
          <path d="M0,30 C360,0 1080,60 1440,30 L1440,60 L0,60 Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
