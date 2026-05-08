'use client'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import DatePickerCalendar from '@/components/ui/DatePickerCalendar'

export type PhotographyPackageForWidget = {
  id: string
  slug: string
  name: string
  price_cents: number | null
  price_label: string | null
  duration_label: string | null
  includes: string[]
}

type Props = {
  pkg: PhotographyPackageForWidget
  unavailableDates?: string[]
}

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export default function PhotographyBookingWidget({ pkg, unavailableDates = [] }: Props) {
  const { addItem, openCart } = useCart()
  const [date, setDate] = useState(addDays(getTodayISO(), 1))
  const [added, setAdded] = useState(false)

  const isUnavailable = unavailableDates.includes(date)
  const priceCents = pkg.price_cents ?? 0
  const canAdd = !!date && !isUnavailable && priceCents > 0

  function handleAdd() {
    if (!canAdd) return
    const utmCampaign = typeof window !== 'undefined' ? sessionStorage.getItem('utm_campaign') : null
    addItem({
      id: `${pkg.id}-${date}`,
      type: 'fotografia',
      name: pkg.name,
      date,
      adults: 1,
      children: 0,
      priceAdultCents: priceCents,
      priceChildCents: 0,
      photographerPackageId: pkg.id,
      utmCampaign: utmCampaign ?? null,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
    openCart()
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: '90px',
    }}>
      {/* Price */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          Valor do pacote
        </p>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', letterSpacing: '-0.02em', margin: 0 }}>
          {priceCents > 0 ? fmtCents(priceCents) : (pkg.price_label ?? 'Consultar')}
        </p>
        {pkg.duration_label && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {pkg.duration_label}
          </p>
        )}
      </div>

      {priceCents > 0 ? (
        <>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
              Data do passeio
            </label>
            <DatePickerCalendar
              value={date}
              onChange={setDate}
              unavailableDates={unavailableDates}
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!canAdd || added}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '1rem',
              opacity: (!canAdd || added) ? 0.6 : 1,
              cursor: (!canAdd || added) ? 'not-allowed' : 'pointer',
              background: added ? '#16a34a' : undefined,
            }}
          >
            {added ? '✓ Adicionado ao carrinho' : 'Adicionar ao carrinho'}
          </button>
        </>
      ) : (
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5524999627968'}?text=${encodeURIComponent(`Olá! Tenho interesse no pacote "${pkg.name}". Poderia me informar disponibilidade?`)}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
            width: '100%', background: '#25D366', color: 'white',
            padding: '0.875rem', borderRadius: '0.75rem', textDecoration: 'none',
            fontWeight: 700, fontSize: '1rem',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          {' '}Consultar pelo WhatsApp
        </a>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
        {['Fotógrafo embarca junto na escuna', 'Fotos editadas em 48h', 'Link privado de download'].map(item => (
          <p key={item} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--vertical-fotografia, #f59e0b)', flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}
