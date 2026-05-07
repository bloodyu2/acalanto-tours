'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

interface Boat {
  id: string
  name: string
  capacity_max: number
  active: boolean
}

interface Override {
  id: string
  boat_id: string
  tour_date: string
  capacity: number
  boats?: { name: string }
}

export default function AdminCapacidadePage() {
  const supabase = createClient()
  const [boats, setBoats] = useState<Boat[]>([])
  const [overrides, setOverrides] = useState<Override[]>([])
  const [form, setForm] = useState({ boat_id: '', tour_date: '', capacity: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function loadOverrides() {
    supabase.from('capacity_overrides').select('*, boats(name)').order('tour_date', { ascending: false }).limit(50).then(({ data }) => setOverrides((data as Override[]) ?? []))
  }

  useEffect(() => {
    supabase.from('boats').select('id,name,capacity_max,active').eq('active', true).order('display_order').then(({ data }) => setBoats(data ?? []))
    loadOverrides()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.boat_id || !form.tour_date || !form.capacity) return
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boat_id: form.boat_id, tour_date: form.tour_date, capacity: Number(form.capacity) }),
      })
      if (res.ok) {
        setMsg('Capacidade salva com sucesso.')
        setForm({ boat_id: '', tour_date: '', capacity: '' })
        loadOverrides()
      } else {
        setMsg('Erro ao salvar.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
        Capacidade
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Gerencie a capacidade disponivel por embarcacao e data.
      </p>

      {/* Boats capacity overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {boats.map(b => (
          <div key={b.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
            <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>{b.name}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Capacidade maxima: <strong>{b.capacity_max}</strong></p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ocean-mid)' }}>Padrao (50%): <strong>{Math.floor(b.capacity_max * 0.5)}</strong></p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{ background: 'white', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '2rem', maxWidth: 520 }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.15rem', color: 'var(--ocean-deep)', marginBottom: '1.25rem' }}>
          Adicionar / editar override
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>
              Embarcacao
            </label>
            <select
              value={form.boat_id}
              onChange={e => setForm(f => ({ ...f, boat_id: e.target.value }))}
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border)', borderRadius: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}
            >
              <option value="">Selecionar...</option>
              {boats.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>
              Data
            </label>
            <input
              type="date"
              value={form.tour_date}
              onChange={e => setForm(f => ({ ...f, tour_date: e.target.value }))}
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border)', borderRadius: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.375rem' }}>
              Capacidade override
            </label>
            <input
              type="number"
              min={0}
              value={form.capacity}
              onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
              placeholder="ex: 20"
              style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1px solid var(--border)', borderRadius: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}
            />
          </div>
          {msg && (
            <p style={{ fontSize: '0.875rem', color: msg.includes('Erro') ? '#e53e3e' : '#38a169' }}>{msg}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ alignSelf: 'flex-start' }}
          >
            {saving ? 'Salvando...' : 'Salvar override'}
          </button>
        </form>
      </div>

      {/* Overrides table */}
      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.15rem', color: 'var(--ocean-deep)' }}>Overrides cadastrados</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--sand)' }}>
              <tr>
                {['Embarcacao', 'Data', 'Capacidade'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--ocean-deep)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overrides.map((o, i) => (
                <tr key={o.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--ocean-deep)' }}>
                    {o.boats?.name || o.boat_id}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>{o.tour_date}</td>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: 'var(--ocean-mid)' }}>{o.capacity}</td>
                </tr>
              ))}
              {overrides.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum override cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
