'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar({ placeholder = 'Buscar passeios, fotografia...' }: { placeholder?: string }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/passeios?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '520px' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <svg
          width="18" height="18"
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
        >
          <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="form-input"
          style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem' }}
        />
      </div>
      <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
        Buscar
      </button>
    </form>
  )
}
