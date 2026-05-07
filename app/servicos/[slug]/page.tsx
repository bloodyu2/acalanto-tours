import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ServiceBookingWidget from '@/components/booking/ServiceBookingWidget'

interface Props { params: Promise<{ slug: string }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'fotografia') return { title: 'Fotografia Profissional | Acalanto Turismo' }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { title: 'Serviço | Acalanto Turismo' }
  const supabase = await createClient()
  const { data } = await supabase.from('acalanto_services').select('name,description').eq('slug', slug).single()
  if (!data) return { title: 'Serviço não encontrado' }
  return { title: data.name, description: data.description || undefined }
}

const serviceHighlights: Record<string, string[]> = {
  'lancha-privativa': [
    'Embarcação exclusiva para o seu grupo (até 6 pessoas)',
    'Roteiro personalizado — você escolhe as paradas',
    'Saída no horário combinado com você',
    'Inclui combustível e equipamentos de segurança',
    'Condutor experiente com conhecimento local',
    'Possibilidade de snorkel e banho nas praias',
  ],
  'passeio-de-jeep': [
    'Percurso pela Mata Atlântica com guia local',
    'Visita a cachoeiras e mirantes exclusivos',
    'Vista panorâmica para a Baía de Paraty',
    'Trilhas que não aparecem nos roteiros comuns',
    'Combinável com passeio de escuna no mesmo dia',
    'Veículo 4x4 apto para terrenos irregulares',
  ],
  'transfer': [
    'Transfer para aeroportos do Rio e São Paulo',
    'Atende rodoviárias e cidades da Costa Verde',
    'Veículos confortáveis e climatizados',
    'Motoristas bilíngues (inglês disponível)',
    'Horário fixo acordado previamente',
    'Ideal para grupos, famílias e crianças pequenas',
  ],
}

export default async function ServicoPage({ params }: Props) {
  const { slug } = await params

  if (slug === 'fotografia') redirect('/fotografia')

  const supabase = await createClient()
  const { data: svc } = await supabase
    .from('acalanto_services')
    .select('id, slug, name, description, price_label, features, active, pricing_type, price_cents_per_person, price_cents_group, capacity_max')
    .eq('slug', slug)
    .eq('active', true)
    .single()
  if (!svc) notFound()

  const { data: unavailRows } = await supabase
    .from('service_availability')
    .select('date')
    .eq('service_id', svc.id)
    .eq('available', false)
  const unavailableDates = (unavailRows ?? []).map((r: { date: string }) => r.date)

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no serviço de ${svc.name}. Poderia me dar mais informações?`)
  const highlights = serviceHighlights[slug] ?? []

  return (
    <>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)', padding: '5rem 0 3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative' }}>
          <Link href="/servicos" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>
            ← Todos os serviços
          </Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'white', marginBottom: '0.5rem' }}>
            {svc.name}
          </h1>
          {svc.price_label && !svc.pricing_type && (
            <p style={{ color: 'var(--sunset)', fontWeight: 700, fontSize: '1.25rem' }}>{svc.price_label}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container">
          <div className="service-detail-grid">

            {/* Left — catalog */}
            <div>
              {svc.description && (
                <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2.5rem' }}>
                  {svc.description}
                </p>
              )}

              {highlights.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.375rem', color: 'var(--ocean-deep)', marginBottom: '1.25rem' }}>
                    O que está incluído
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {highlights.map(f => (
                      <li key={f} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.9375rem', color: 'var(--text-muted)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ocean-mid)', flexShrink: 0, marginTop: '2px' }}>
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ background: 'var(--sand)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>
                  Como funciona
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                  Escolha a data e o número de pessoas, adicione ao carrinho e finalize o pagamento via Pix. Você receberá a confirmação por e-mail em instantes. Para dúvidas, nossa equipe está no{' '}
                  <a href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer" style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>
                    WhatsApp
                  </a>.
                </p>
              </div>
            </div>

            {/* Right — booking widget */}
            <div>
              {svc.pricing_type ? (
                <ServiceBookingWidget
                  service={{
                    id: svc.id,
                    slug: svc.slug,
                    name: svc.name,
                    pricing_type: svc.pricing_type as 'per_person' | 'per_group',
                    price_cents_per_person: svc.price_cents_per_person ?? null,
                    price_cents_group: svc.price_cents_group ?? null,
                    capacity_max: svc.capacity_max ?? null,
                  }}
                  unavailableDates={unavailableDates}
                />
              ) : (
                <div className="service-cta-sticky" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', position: 'sticky', top: '90px' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Valor</p>
                    <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                      {svc.price_label || 'Sob consulta'}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Valor confirmado no WhatsApp conforme data e grupo
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${phone}?text=${waMsg}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', marginBottom: '0.875rem' }}
                  >
                    Solicitar pelo WhatsApp
                  </a>
                  <Link href="/contato" style={{ display: 'block', textAlign: 'center', fontSize: '0.875rem', color: 'var(--ocean-mid)', padding: '0.625rem', textDecoration: 'none', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    Ou envie uma mensagem
                  </Link>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                    {['Resposta em minutos', 'Sem compromisso', 'Equipe local em Paraty'].map(item => (
                      <p key={item} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ocean-mid)', flexShrink: 0 }}>
                          <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
