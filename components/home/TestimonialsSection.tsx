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

  const testimonials = data

  return (
    <section style={{ padding: '5rem 0', background: 'var(--ocean-deep)' }}>
      {/* Top wave */}
      <div style={{ width: '100%', overflow: 'hidden', lineHeight: 0, marginTop: '-5rem' }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" fill="var(--sand)" />
        </svg>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(244,166,35,0.18)', color: 'var(--sunset)',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '0.25rem 0.75rem', borderRadius: '999px', marginBottom: '0.75rem',
          }}>
            Depoimentos
          </span>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'white', marginBottom: '1rem' }}>
            Quem navegou com a gente
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '500px', margin: '0 auto' }}>
            Cada depoimento é uma memória criada nas águas de Paraty.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '1.25rem', padding: '1.5rem',
            }}>
              {/* Stars */}
              <div style={{ marginBottom: '0.875rem', color: '#e00b41', fontSize: '0.875rem', letterSpacing: '0.05em' }}>
                {'★'.repeat(t.rating || 5)}
              </div>
              <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, marginBottom: '1.25rem', fontStyle: 'italic' }}>
                "{t.content}"
              </p>
              <div>
                <p style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{t.author_name}</p>
                {t.author_city && (
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{t.author_city}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div style={{ width: '100%', overflow: 'hidden', lineHeight: 0, marginTop: '3rem' }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
          <path d="M0,30 C360,0 1080,60 1440,30 L1440,60 L0,60 Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}
