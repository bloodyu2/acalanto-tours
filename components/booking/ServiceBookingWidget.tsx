'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import { createClient } from '@/lib/supabase/client'
import DatePickerCalendar from '@/components/ui/DatePickerCalendar'

export type ServiceForWidget = {
  id: string
  slug: string
  name: string
  pricing_type: 'per_person' | 'per_group' | null
  price_cents_per_person: number | null
  price_cents_group: number | null
  capacity_max: number | null
}

type DepartureTime = { id: string; time: string; label: string | null }

type Props = {
  service: ServiceForWidget
  unavailableDates?: string[]
}

function fmtCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtTime(t: string) { return t.slice(0, 5) }

function getTodayISO() { return new Date().toISOString().split('T')[0] }

function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

export default function ServiceBookingWidget({ service, unavailableDates = [] }: Props) {
  const { addItem } = useCart()
  const [date, setDate] = useState(addDays(getTodayISO(), 1))
  const [count, setCount] = useState(1)

  const [departureTimes, setDepartureTimes] = useState<DepartureTime[]>([])
  const [selectedTimeId, setSelectedTimeId] = useState<string | null>(null)

  useEffect(() => {
    const sb = createClient()
    sb.from('departure_times')
      .select('id, time, label')
      .eq('service_id', service.id)
      .eq('active', true)
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        const list = (data as DepartureTime[]) ?? []
        setDepartureTimes(list)
        if (list.length > 0) setSelectedTimeId(list[0].id)
      })
  }, [service.id])

  const selectedTime = departureTimes.find(t => t.id === selectedTimeId)

  const isPerGroup = service.pricing_type === 'per_group'
  const price = isPerGroup ? (service.price_cents_group ?? 0) : (service.price_cents_per_person ?? 0)
  const maxCount = isPerGroup ? (service.capacity_max ?? 20) : 20
  const isUnavailable = unavailableDates.includes(date)
  const totalCents = isPerGroup ? price : price * count

  function handleAdd() {
    if (isUnavailable || !date) return
    if (departureTimes.length > 0 && !selectedTimeId) { alert('Selecione um horário.'); return }

    const timeLabel = selectedTime
      ? (selectedTime.label ? `${selectedTime.label} — ${fmtTime(selectedTime.time)}` : fmtTime(selectedTime.time))
      : undefined

    addItem({
      id: `${service.id}-${date}-${selectedTimeId ?? 'default'}`,
      type: 'servico',
      name: service.name,
      date,
      adults: count,
      children: 0,
      priceAdultCents: price,
      priceChildCents: 0,
      serviceId: service.id,
      pricingType: service.pricing_type ?? 'per_person',
      groupSize: count,
      departureTimeId: selectedTimeId ?? undefined,
      departureTimeLabel: timeLabel,
    })
  }

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)', borderRadius: '16px',
      padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      position: 'sticky', top: '90px',
    }}>
      {/* Price header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          {isPerGroup ? 'Valor por grupo' : 'Valor por pessoa'}
        </p>
        <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          {fmtCents(price)}
        </p>
        {isPerGroup && service.capacity_max && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Até {service.capacity_max} pessoas
          </p>
        )}
      </div>

      {/* Calendar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
          Escolha a data
        </label>
        <DatePickerCalendar value={date} onChange={setDate} unavailableDates={unavailableDates} />
      </div>

      {/* Seletor de horário */}
      {departureTimes.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
            Horário
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {departureTimes.map(t => {
              const active = t.id === selectedTimeId
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTimeId(t.id)}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: '8px',
                    border: `2px solid ${active ? 'var(--ocean-deep)' : 'var(--border)'}`,
                    background: active ? 'var(--ocean-deep)' : 'white',
                    color: active ? 'white' : 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {fmtTime(t.time)}
                  {t.label && <span style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 400, fontSize: '0.75rem', marginLeft: '0.375rem', opacity: 0.8 }}>{t.label}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Count */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {isPerGroup ? 'Pessoas no grupo' : 'Número de pessoas'}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setCount(c => Math.max(1, c - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
          <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, minWidth: '2rem', textAlign: 'center' }}>{count}</span>
          <button onClick={() => setCount(c => Math.min(maxCount, c + 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
        </div>
        {isPerGroup && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Preço fixo para o grupo inteiro</p>
        )}
      </div>

      {/* Total */}
      {!isPerGroup && count > 1 && (
        <div style={{ background: 'var(--sand)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total ({count} pessoas)</span>
          <span style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{fmtCents(totalCents)}</span>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={isUnavailable || !date}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', opacity: (isUnavailable || !date) ? 0.5 : 1, cursor: (isUnavailable || !date) ? 'not-allowed' : 'pointer' }}
      >
        Adicionar ao carrinho
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
        {['Pagamento via Pix ou cartão', 'Confirmação por e-mail', 'Equipe local em Paraty'].map(item => (
          <p key={item} style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ocean-mid)', flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {item}
          </p>
        ))}
      </div>
    </div>
  )
}
