'use client'
import { useState } from 'react'

type Props = {
  listing: { id: string; title: string; slug: string }
  initialAvail: Record<string, string>
}

const MONTHS_PT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function AvailabilityCalendarEditor({ listing, initialAvail }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [avail, setAvail] = useState<Record<string, string>>(initialAvail)
  const [saving, setSaving] = useState<string | null>(null)

  function daysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate() }
  function firstDow(y: number, m: number) { return new Date(y, m - 1, 1).getDay() }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  async function toggleDate(iso: string) {
    const today = getTodayISO()
    if (iso < today) return
    const current = avail[iso] ?? 'available'
    const next = current === 'blocked' ? 'available' : 'blocked'
    setSaving(iso)
    const res = await fetch('/api/parceiros/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: listing.id, date: iso, status: next }),
    })
    if (res.ok) {
      setAvail(prev => ({ ...prev, [iso]: next }))
    }
    setSaving(null)
  }

  const totalDays = daysInMonth(year, month)
  const startDow = firstDow(year, month)
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const today = getTodayISO()

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{listing.title}</h2>
      </div>

      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--ocean-mid)', padding: '0.25rem 0.5rem' }}>‹</button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{MONTHS_PT[month - 1]} {year}</span>
          <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--ocean-mid)', padding: '0.25rem 0.5rem' }}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.25rem' }}>
          {DAYS_PT.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', padding: '0.25rem 0' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {cells.map((day, idx) => {
            if (day === null) return <div key={`e${idx}`} />
            const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isPast = iso < today
            const status = avail[iso] ?? 'available'
            const isBlocked = status === 'blocked'
            const isBooked = status === 'booked'
            const isSaving = saving === iso

            return (
              <button
                key={iso}
                onClick={() => !isPast && !isBooked && toggleDate(iso)}
                disabled={isPast || isBooked || isSaving}
                title={isBooked ? 'Reservado (não pode alterar)' : isBlocked ? 'Clique para desbloquear' : 'Clique para bloquear'}
                style={{
                  padding: '0.35rem 0',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 500,
                  cursor: isPast || isBooked ? 'default' : 'pointer',
                  background: isBooked
                    ? '#dbeafe'
                    : isBlocked
                    ? '#fee2e2'
                    : isPast
                    ? 'transparent'
                    : '#dcfce7',
                  color: isBooked
                    ? '#1d4ed8'
                    : isBlocked
                    ? '#dc2626'
                    : isPast
                    ? '#d1d5db'
                    : '#16a34a',
                  opacity: isSaving ? 0.5 : 1,
                  transition: 'background 0.15s',
                }}
              >
                {day}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap' }}>
          {[
            { color: '#dcfce7', border: '#16a34a', text: 'Disponível' },
            { color: '#fee2e2', border: '#dc2626', text: 'Bloqueado' },
            { color: '#dbeafe', border: '#1d4ed8', text: 'Reservado' },
          ].map(({ color, border, text }) => (
            <span key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: color, border: `1px solid ${border}`, display: 'inline-block' }} />
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
