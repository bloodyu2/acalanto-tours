'use client'
import { useEffect } from 'react'
import ServiceBookingWidget from '@/components/booking/ServiceBookingWidget'

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

export type SheetService = {
  id: string
  slug: string
  name: string
  description?: string | null
  price_label?: string | null
  pricing_type?: string | null
  price_cents_per_person?: number | null
  price_cents_group?: number | null
  capacity_max?: number | null
}

interface Props {
  service: SheetService | null
  unavailableMap: Record<string, string[]>
  onClose: () => void
}

const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'

export default function ServiceSheet({ service, unavailableMap, onClose }: Props) {
  useEffect(() => {
    if (!service) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [service, onClose])

  if (!service) return null

  const highlights = serviceHighlights[service.slug] ?? []
  const hasBooking = !!service.pricing_type
  const unavailableDates = unavailableMap[service.id] ?? []
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no serviço de ${service.name}. Poderia me dar mais informações?`)

  return (
    <>
      {/* Overlay */}
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={service.name}
        style={{
          position: 'fixed', inset: '0 0 0 auto',
          width: '100%', maxWidth: '480px',
          background: 'white', zIndex: 50,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
              Serviço
            </p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', margin: 0 }}>
              {service.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {service.description && (
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              {service.description}
            </p>
          )}

          {highlights.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>
                O que está incluído
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {highlights.map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasBooking ? (
            <ServiceBookingWidget
              service={{
                id: service.id,
                slug: service.slug,
                name: service.name,
                pricing_type: service.pricing_type as 'per_person' | 'per_group',
                price_cents_per_person: service.price_cents_per_person ?? null,
                price_cents_group: service.price_cents_group ?? null,
                capacity_max: service.capacity_max ?? null,
              }}
              unavailableDates={unavailableDates}
            />
          ) : (
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)' }}>
              {service.price_label && (
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
                  {service.price_label}
                </p>
              )}
              <a
                href={`https://wa.me/${phone}?text=${waMsg}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', textDecoration: 'none', width: '100%' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Solicitar pelo WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
