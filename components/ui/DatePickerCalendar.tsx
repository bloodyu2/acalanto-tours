'use client'
import { useState } from 'react'

type Props = {
  value: string
  onChange: (iso: string) => void
  unavailableDates?: string[]
  minDate?: string
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function isoToYM(iso: string) {
  const [y, m] = iso.split('-')
  return { year: Number(y), month: Number(m) }
}

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default function DatePickerCalendar({ value, onChange, unavailableDates = [], minDate }: Props) {
  const effectiveMin = minDate ?? addDays(getTodayISO(), 1)
  const init = value && value >= effectiveMin ? isoToYM(value) : isoToYM(effectiveMin)
  const [year, setYear] = useState(init.year)
  const [month, setMonth] = useState(init.month)

  const unavailSet = new Set(unavailableDates)

  function daysInMonth(y: number, m: number) {
    return new Date(y, m, 0).getDate()
  }

  function firstDayOfWeek(y: number, m: number) {
    return new Date(y, m - 1, 1).getDay()
  }

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalDays = daysInMonth(year, month)
  const startDow = firstDayOfWeek(year, month)
  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'white', userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '1rem', color: 'var(--ocean-mid)' }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          {MONTHS_PT[month - 1]} {year}
        </span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', fontSize: '1rem', color: 'var(--ocean-mid)' }}>›</button>
      </div>

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0.5rem 0.75rem 0' }}>
        {DAYS_PT.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', paddingBottom: '0.375rem' }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 0.75rem 0.75rem', gap: '2px' }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e${idx}`} />
          const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isPast = iso < effectiveMin
          const isUnavail = unavailSet.has(iso)
          const isSelected = iso === value
          const disabled = isPast || isUnavail

          return (
            <button
              key={iso}
              onClick={() => !disabled && onChange(iso)}
              disabled={disabled}
              style={{
                padding: '0.35rem 0',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.825rem',
                fontWeight: isSelected ? 700 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: isSelected
                  ? 'var(--ocean-mid)'
                  : isUnavail
                  ? '#fee2e2'
                  : 'transparent',
                color: isSelected
                  ? 'white'
                  : isUnavail
                  ? '#ef4444'
                  : isPast
                  ? '#d1d5db'
                  : 'var(--text-primary)',
                textDecoration: isUnavail ? 'line-through' : 'none',
                transition: 'background 0.15s',
              }}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ padding: '0.5rem 1rem 0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--ocean-mid)', display: 'inline-block' }} />
          Selecionado
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fee2e2', border: '1px solid #ef4444', display: 'inline-block' }} />
          Indisponível
        </span>
      </div>
    </div>
  )
}
