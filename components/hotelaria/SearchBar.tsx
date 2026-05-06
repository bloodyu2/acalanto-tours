'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

function addDays(iso: string, n: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

export default function SearchBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const tomorrow = addDays(getTodayISO(), 1)
  const dayAfter = addDays(getTodayISO(), 2)

  const [checkIn, setCheckIn] = useState(sp.get('checkin') ?? tomorrow)
  const [checkOut, setCheckOut] = useState(sp.get('checkout') ?? dayAfter)
  const [guests, setGuests] = useState(sp.get('guests') ?? '2')

  function handleSearch() {
    const params = new URLSearchParams({ checkin: checkIn, checkout: checkOut, guests })
    router.push(`/hotelaria?${params.toString()}`)
  }

  function handleCheckInChange(val: string) {
    setCheckIn(val)
    if (val >= checkOut) setCheckOut(addDays(val, 1))
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      alignItems: 'flex-end',
    }}>
      <div style={{ flex: 1, minWidth: '140px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Check-in</label>
        <input
          type="date"
          value={checkIn}
          min={tomorrow}
          onChange={e => handleCheckInChange(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9375rem', background: 'white', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: '140px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Check-out</label>
        <input
          type="date"
          value={checkOut}
          min={addDays(checkIn, 1)}
          onChange={e => setCheckOut(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9375rem', background: 'white', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: '120px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Hóspedes</label>
        <select
          value={guests}
          onChange={e => setGuests(e.target.value)}
          style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9375rem', background: 'white', boxSizing: 'border-box' }}
        >
          {[1,2,3,4,5,6,7,8].map(n => (
            <option key={n} value={n}>{n} hóspede{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <button
        onClick={handleSearch}
        className="btn-primary"
        style={{ whiteSpace: 'nowrap', padding: '0.625rem 1.5rem', alignSelf: 'flex-end' }}
      >
        Buscar
      </button>
    </div>
  )
}
