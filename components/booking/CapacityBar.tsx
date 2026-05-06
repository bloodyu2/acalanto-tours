'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  boatId: string
  capacityMax: number
  selectedDate: string | null // ISO date
}

export default function CapacityBar({ boatId, capacityMax, selectedDate }: Props) {
  const [spotsTotal, setSpotsTotal] = useState(Math.floor(capacityMax * 0.5))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('capacity_overrides')
      .select('capacity')
      .eq('boat_id', boatId)
      .eq('tour_date', selectedDate)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setSpotsTotal(data.capacity)
        else setSpotsTotal(Math.floor(capacityMax * 0.5))
        setLoading(false)
      })
  }, [boatId, capacityMax, selectedDate])

  // Show total available capacity (real bookings subtracted would require a count query)
  const spotsLeft = spotsTotal
  const pct = Math.max(0, Math.min(100, (spotsLeft / Math.max(spotsTotal, 1)) * 100))
  const barColor = pct > 50 ? 'var(--status-paid)' : pct > 20 ? 'var(--status-pending)' : 'var(--status-cancelled)'

  if (!selectedDate) return null

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Vagas disponiveis
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
