import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Boat } from '@/lib/types/database'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Reservar',
  description: 'Escolha o que você quer reservar em Paraty: passeios de escuna, fotografia profissional, lancha privativa, jeep e transfer.',
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'

function waLink(msg: string) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`
}

function fmt(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

// ─── Section header ──────────────────────────────────────────────────────────
function SectionHeader({ emoji, label, color, tag }: { emoji: string; label: string; color: string; tag?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: `${color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.375rem', flexShrink: 0,
      }}>
        {emoji}
      </div>
      <div>
        <h2 style={{
          fontFamily: 'var(--font-playfair)', fontSize: '1.5rem',
          color: 'var(--text-primary)', lineHeight: 1.1,
        }}>
          {label}
        </h2>
        {tag && (
          <span style={{
            fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
            color, textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            {tag}
          </span>
        )}
      </div>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)', marginLeft: '0.5rem' }} />
    </div>
  )
}

export default async function ReservarPage() {
  const supabase = await createClient()

  const [{ data: boats }, { data: pkgs }, { data: services }] = await Promise.all([
    supabase.from('boats').select('*').eq('active', true).order('display_order'),
    supabase.from('photographer_packages').select('*').eq('active', true).order('display_order'),
    supabase.from('services').select('*').eq('active', true).order('display_order'),
  ])

  // Split services: fotografia has its own vertente page
  const extraServices = (services ?? []).filter(s => s.slug !== 'fotografia')

  return (
    <>
      {/* Page hero */}
      <section style={{
        background: 'linear-gradient(160deg, var(--ocean-deep) 0%, #0d2a3d 100%)',
        padding: '5rem 0 3.5rem', position: 'relative',
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)',
            fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}>
            <span style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
            Acalanto Tours · Paraty
            <span style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: 'white', lineHeight: 1.1, marginBottom: '0.875rem',
          }}>
            O que você quer reservar?
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.0625rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>
            Escolha entre passeios de escuna, fotografia, serviços exclusivos e mais.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: '3.5rem 0 6rem', background: 'white' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>

          {/* ── Passeios ─────────────────────────────────────────────────── */}
          <div style={{ marginBottom: '4rem' }}>
            <SectionHeader emoji="⛵" label="Passeios de Escuna" color="var(--ocean-mid)" tag="reserva online disponível" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {(boats ?? []).map((boat: Boat) => (
                <Link key={boat.id} href={`/passeios/${boat.slug}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Cover */}
                    <div style={{
                      height: '150px', position: 'relative',
                      background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)',
                    }}>
                      {boat.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={boat.cover_image} alt={boat.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>⛵</div>
                      )}
                      <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.55)', color: 'white', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                        {fmt(boat.price_adult)}<span style={{ fontWeight: 400, fontSize: '0.65rem' }}>/pessoa</span>
                      </div>
                    </div>
                    <div style={{ padding: '1rem 1.125rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', color: 'var(--text-primary)', fontWeight: 700 }}>{boat.name}</div>
                      {boat.tagline && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{boat.tagline}</div>}
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🕐 {boat.duration_hours}h</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏰ {boat.departure_time?.slice(0, 5)}</span>
                      </div>
                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                        <span style={{ display: 'inline-block', background: 'var(--ocean-mid)', color: 'white', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.8125rem', fontWeight: 600, width: '100%', textAlign: 'center' }}>
                          Selecionar data e reservar →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Fotografia ───────────────────────────────────────────────── */}
          <div style={{ marginBottom: '4rem' }}>
            <SectionHeader emoji="📸" label="Fotografia Profissional" color="#8B5CF6" tag="contratação via whatsapp" />
            {pkgs && pkgs.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {pkgs.map((pkg) => (
                  <div key={pkg.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '3px solid #8B5CF6' }}>
                    <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', color: 'var(--text-primary)', fontWeight: 700 }}>{pkg.name}</div>
                    {pkg.description && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{pkg.description}</div>}
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.1rem', fontWeight: 700, color: '#8B5CF6' }}>
                        {pkg.price_cents ? fmt(pkg.price_cents) : (pkg.price_label || 'Sob consulta')}
                      </div>
                      <a
                        href={waLink(`Olá! Tenho interesse no pacote de fotografia "${pkg.name}". Pode me informar disponibilidade?`)}
                        target="_blank" rel="noreferrer"
                        style={{ background: '#8B5CF6', color: 'white', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                      >
                        Contratar →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback when no packages in DB yet */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                {[
                  { name: 'Sessão Bordo Básica', desc: 'Fotógrafo embarca junto, entrega digital em 48h.', price: 'A partir de R$250' },
                  { name: 'Sessão Bordo Completa', desc: 'Cobertura total do passeio + edição premium.', price: 'A partir de R$450' },
                  { name: 'Pacote Família', desc: 'Ideal para grupos. Galeria privada de acesso.', price: 'A partir de R$600' },
                ].map((pkg) => (
                  <div key={pkg.name} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '3px solid #8B5CF6' }}>
                    <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', color: 'var(--text-primary)', fontWeight: 700 }}>{pkg.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{pkg.desc}</div>
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', fontWeight: 700, color: '#8B5CF6' }}>{pkg.price}</div>
                      <a
                        href={waLink(`Olá! Tenho interesse no pacote de fotografia "${pkg.name}". Pode me informar disponibilidade?`)}
                        target="_blank" rel="noreferrer"
                        style={{ background: '#8B5CF6', color: 'white', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                      >
                        Contratar →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '1rem' }}>
              <Link href="/fotografia" style={{ fontSize: '0.875rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>
                Ver todos os pacotes de fotografia →
              </Link>
            </div>
          </div>

          {/* ── Serviços ─────────────────────────────────────────────────── */}
          <div style={{ marginBottom: '4rem' }}>
            <SectionHeader emoji="🚤" label="Serviços Exclusivos" color="#D97706" tag="contratação via whatsapp" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {extraServices.length > 0 ? extraServices.map((svc) => {
                const icons: Record<string, string> = {
                  'lancha-privativa': '🚤',
                  'passeio-de-jeep': '🚙',
                  'transfer': '🚐',
                }
                const icon = icons[svc.slug] || '⚓'
                const waMsg = `Olá! Tenho interesse no serviço "${svc.name}" em Paraty. Pode me passar mais informações?`
                return (
                  <div key={svc.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', borderTop: '3px solid #D97706' }}>
                    <div style={{ fontSize: '2rem' }}>{icon}</div>
                    <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', color: 'var(--text-primary)', fontWeight: 700 }}>{svc.name}</div>
                    {svc.description && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{svc.description}</div>}
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#D97706' }}>{svc.price_label || 'Sob consulta'}</div>
                      <a
                        href={waLink(waMsg)}
                        target="_blank" rel="noreferrer"
                        style={{ background: '#D97706', color: 'white', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                      >
                        Contratar →
                      </a>
                    </div>
                  </div>
                )
              }) : (
                /* Fallback when no services in DB yet */
                [{name:'Lancha Privativa', slug:'lancha-privativa', icon:'🚤', desc:'Embarque privativo para grupos, passeios personalizados pelas ilhas.'},
                 {name:'Passeio de Jeep', slug:'passeio-de-jeep', icon:'🚙', desc:'Trilhas e mirantes da Serra da Bocaina a bordo de um jeep 4x4.'},
                 {name:'Transfer', slug:'transfer', icon:'🚐', desc:'Translado confortável entre Paraty, RJ e SP — van ou van executiva.'}
                ].map(svc => (
                  <div key={svc.slug} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', borderTop: '3px solid #D97706' }}>
                    <div style={{ fontSize: '2rem' }}>{svc.icon}</div>
                    <div style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', color: 'var(--text-primary)', fontWeight: 700 }}>{svc.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{svc.desc}</div>
                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#D97706' }}>Sob consulta</div>
                      <a
                        href={waLink(`Olá! Tenho interesse no serviço "${svc.name}" em Paraty. Pode me passar mais informações?`)}
                        target="_blank" rel="noreferrer"
                        style={{ background: '#D97706', color: 'white', borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
                      >
                        Contratar →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link href="/servicos" style={{ fontSize: '0.875rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>
                Ver todos os serviços →
              </Link>
            </div>
          </div>

          {/* ── Hospedagem ───────────────────────────────────────────────── */}
          <div>
            <SectionHeader emoji="🏡" label="Hospedagem" color="#059669" />
            <div style={{
              background: '#f0fdf4',
              border: '1.5px dashed #86efac',
              borderRadius: '1rem',
              padding: '2.5rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏡</div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: '#065f46', marginBottom: '0.5rem' }}>
                Hospedagem em breve
              </h3>
              <p style={{ color: '#047857', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.25rem', lineHeight: 1.6 }}>
                Estamos selecionando pousadas e hotéis parceiros próximos ao pier. Em breve você poderá combinar hospedagem + passeio num pacote único.
              </p>
              <a
                href={waLink('Olá! Tenho interesse em hospedagem em Paraty combinada com passeio de escuna. Podem me avisar quando estiver disponível?')}
                target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', background: '#059669', color: 'white', borderRadius: '8px', padding: '0.625rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
              >
                Avisar quando estiver disponível
              </a>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
