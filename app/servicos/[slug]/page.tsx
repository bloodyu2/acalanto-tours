import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Props { params: Promise<{ slug: string }> }

// Force dynamic rendering — Supabase env vars may not be present at build time
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { title: 'Serviço — Acalanto Tours' }
  }
  const supabase = await createClient()
  const { data } = await supabase.from('services').select('name,description').eq('slug', slug).single()
  if (!data) return { title: 'Serviço não encontrado' }
  return { title: data.name, description: data.description || undefined }
}

export default async function ServicoPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: svc } = await supabase.from('services').select('*').eq('slug', slug).eq('active', true).single()
  if (!svc) notFound()

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999999999'
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no serviço "${svc.name}". Poderia me dar mais informações?`)

  return (
    <>
      <section style={{ background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)', padding: '5rem 0 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative' }}>
          <Link href="/servicos" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>← Todos os serviços</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'white', marginBottom: '0.5rem' }}>{svc.name}</h1>
          {svc.price_label && <p style={{ color: 'var(--sunset)', fontWeight: 700, fontSize: '1.25rem' }}>{svc.price_label}</p>}
        </div>
      </section>

      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container">
          <div className="service-detail-grid">

            {/* Left — description */}
            <div>
              {svc.description && (
                <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
                  {svc.description}
                </p>
              )}

              {/* Highlights from features field if present */}
              {svc.features && svc.features.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    O que está incluído
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {svc.features.map((f: string) => (
                      <li key={f} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.625rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--ocean-mid)', fontWeight: 700 }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Note */}
              <div style={{ background: 'var(--sand)', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Como funciona?</strong>{' '}
                  Manda mensagem no WhatsApp e a gente te responde com disponibilidade, valores e detalhes. Sem formulário, sem espera.
                </p>
              </div>
            </div>

            {/* Right — CTA card */}
            <div className="service-cta-sticky" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', position: 'sticky', top: '90px' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Valor
                </p>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {svc.price_label || 'Sob consulta'}
                </p>
              </div>

              <a
                href={`https://wa.me/${phone}?text=${waMsg}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', marginBottom: '1rem' }}
              >
                Solicitar pelo WhatsApp
              </a>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '1.25rem' }}>
                {[
                  '✅ Resposta rápida',
                  '✅ Sem compromisso',
                  '✅ Equipe local em Paraty',
                ].map(item => (
                  <p key={item} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>{item}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
