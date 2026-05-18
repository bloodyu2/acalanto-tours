'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  boatId: string
  capacityMax: number
  selectedDate: string | null
  departureTimeId?: string
}

export default function CapacityBar({ boatId, capacityMax, selectedDate, departureTimeId }: Props) {
  const [spotsTotal, setSpotsTotal] = useState(Math.floor(capacityMax * 0.5))
  const [spotsBooked, setSpotsBooked] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate) return
    setLoading(true)
    const supabase = createClient()

    let bookingsQuery = supabase
      .from('bookings')
      .select('adults, children, infants', { count: 'exact' })
      .eq('boat_id', boatId)
      .eq('tour_date', selectedDate)
      .in('status', ['pending', 'confirmed', 'paid'])

    if (departureTimeId) {
      bookingsQuery = bookingsQuery.eq('departure_time_id', departureTimeId)
    }

    Promise.all([
      supabase
        .from('capacity_overrides')
        .select('capacity')
        .eq('boat_id', boatId)
        .eq('tour_date', selectedDate)
        .maybeSingle(),
      bookingsQuery,
    ]).then(([overrideRes, bookingsRes]) => {
      const total = overrideRes.data ? overrideRes.data.capacity : Math.floor(capacityMax * 0.5)
      setSpotsTotal(total)
      const booked = (bookingsRes.data ?? []).reduce((sum, b) => sum + (b.adults ?? 0) + (b.children ?? 0) + ((b as any).infants ?? 0), 0)
      setSpotsBooked(booked)
      setLoading(false)
    })
  }, [boatId, capacityMax, selectedDate, departureTimeId])

  const spotsLeft = Math.max(0, spotsTotal - spotsBooked)
  const pct = Math.max(0, Math.min(100, (spotsLeft / Math.max(spotsTotal, 1)) * 100))
  const barColor = pct > 50 ? 'var(--status-paid)' : pct > 20 ? 'var(--status-pending)' : 'var(--status-cancelled)'

  if (!selectedDate) return null

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Vagas disponíveis {departureTimeId ? 'neste horário' : ''}
        </span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: loading ? 'var(--text-muted)' : barColor }}>
          {loading ? '...' : `${spotsLeft} vagas`}
        </span>
      </div>
      <div className="capacity-bar-track">
        <div className="capacity-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  )
}
