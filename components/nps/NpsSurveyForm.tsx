'use client'

import { useState } from 'react'

interface Props {
  bookingId: string
  token: string
  customerName: string
}

export default function NpsSurveyForm({ bookingId, token, customerName }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function scoreColor(n: number): string {
    if (n <= 6) return '#e53e3e'
    if (n <= 8) return '#d69e2e'
    return '#38a169'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected === null) {
      setError('Por favor, selecione uma nota antes de enviar.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/nps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, token, score: selected, comment }),
      })
      if (res.ok) {
        setDone(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erro ao enviar. Tente novamente.')
      }
    } catch {
      setError('Erro de conexao. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          Obrigado por avaliar!
        </p>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Sua resposta foi registrada.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {customerName && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Ola, <strong style={{ color: 'var(--text-primary)' }}>{customerName}</strong>!
        </p>
      )}

      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
        Em uma escala de 0 a 10, qual a probabilidade de voce recomendar nossos passeios?
      </p>

      <div
        style={{
          display: 'flex',
          gap: '0.375rem',
          flexWrap: 'wrap',
          marginBottom: '0.5rem',
        }}
      >
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: '8px',
              border: selected === i ? `2px solid ${scoreColor(i)}` : '1px solid var(--border)',
              background: selected === i ? scoreColor(i) : 'transparent',
              color: selected === i ? '#fff' : 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {i}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
        }}
      >
        <span>Pouco provavel</span>
        <span>Muito provavel</span>
      </div>

      <label
        style={{
          display: 'block',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
          fontSize: '0.95rem',
        }}
      >
        Comentario (opcional)
      </label>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Conte-nos mais sobre sua experiencia (opcional)..."
        rows={4}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'transparent',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          resize: 'vertical',
          fontFamily: 'inherit',
          marginBottom: '1rem',
          boxSizing: 'border-box',
        }}
      />

      {error && (
        <p style={{ color: '#e53e3e', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
        style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Enviando...' : 'Enviar avaliacao'}
      </button>
    </form>
  )
}
