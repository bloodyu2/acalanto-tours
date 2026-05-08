'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

type DepartureTime = {
  id: string
  time: string
  label: string | null
  active: boolean
  display_order: number
}

type Props = {
  entityField: 'boat_id' | 'service_id'
  entityId: string
}

function fmt(t: string) {
  return t.slice(0, 5)
}

export default function DepartureTimesManager({ entityField, entityId }: Props) {
  const [times, setTimes] = useState<DepartureTime[]>([])
  const [loading, setLoading] = useState(true)
  const [newTime, setNewTime] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [saving, startSaving] = useTransition()
  const sb = createClient()

  async function load() {
    const { data } = await sb
      .from('departure_times')
      .select('id, time, label, active, display_order')
      .eq(entityField, entityId)
      .order('display_order', { ascending: true })
    setTimes((data as DepartureTime[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [entityId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd() {
    if (!newTime) return
    startSaving(async () => {
      await sb.from('departure_times').insert({
        [entityField]: entityId,
        time: newTime,
        label: newLabel.trim() || null,
        active: true,
        display_order: times.length,
      })
      setNewTime('')
      setNewLabel('')
      await load()
    })
  }

  async function handleToggle(id: string, active: boolean) {
    await sb.from('departure_times').update({ active: !active }).eq('id', id)
    setTimes(ts => ts.map(t => t.id === id ? { ...t, active: !active } : t))
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este horário?')) return
    await sb.from('departure_times').delete().eq('id', id)
    setTimes(ts => ts.filter(t => t.id !== id))
  }

  async function handleMove(id: string, dir: -1 | 1) {
    const idx = times.findIndex(t => t.id === id)
    const next = idx + dir
    if (next < 0 || next >= times.length) return
    const reordered = [...times]
    ;[reordered[idx], reordered[next]] = [reordered[next], reordered[idx]]
    const updates = reordered.map((t, i) => ({ id: t.id, display_order: i }))
    setTimes(reordered.map((t, i) => ({ ...t, display_order: i })))
    await Promise.all(updates.map(u => sb.from('departure_times').update({ display_order: u.display_order }).eq('id', u.id)))
  }

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Carregando horários...</p>

  return (
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Horários de Saída
      </p>

      {times.length === 0 && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Nenhum horário cadastrado.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {times.map((t, idx) => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: t.active ? '#f0f9ff' : '#f8fafc',
            border: `1px solid ${t.active ? '#bae6fd' : '#e2e8f0'}`,
            borderRadius: '8px', padding: '0.5rem 0.75rem',
          }}>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1rem', color: t.active ? 'var(--ocean-deep)' : '#94a3b8', minWidth: '3.5rem' }}>
              {fmt(t.time)}
            </span>
            {t.label && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.label}</span>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <button
                type="button" title="Mover para cima"
                onClick={() => handleMove(t.id, -1)}
                disabled={idx === 0}
                style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, padding: '2px 4px', fontSize: '0.8rem' }}
              >▲</button>
              <button
                type="button" title="Mover para baixo"
                onClick={() => handleMove(t.id, 1)}
                disabled={idx === times.length - 1}
                style={{ background: 'none', border: 'none', cursor: idx === times.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === times.length - 1 ? 0.3 : 1, padding: '2px 4px', fontSize: '0.8rem' }}
              >▼</button>
              <button
                type="button"
                onClick={() => handleToggle(t.id, t.active)}
                style={{
                  fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '6px', border: 'none',
                  background: t.active ? '#dcfce7' : '#fee2e2',
                  color: t.active ? '#166534' : '#991b1b',
                  cursor: 'pointer', fontWeight: 600,
                }}
              >
                {t.active ? 'Ativo' : 'Inativo'}
              </button>
              <button
                type="button" title="Remover"
                onClick={() => handleDelete(t.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem', padding: '2px 4px' }}
              >×</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Horário *</label>
          <input
            type="time"
            value={newTime}
            onChange={e => setNewTime(e.target.value)}
            style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Label (opcional)</label>
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="ex: Manhã, Tarde"
            style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.875rem', width: '140px' }}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newTime || saving}
          style={{
            padding: '0.45rem 1rem', borderRadius: '6px', border: 'none',
            background: !newTime || saving ? '#e2e8f0' : 'var(--ocean-deep)',
            color: !newTime || saving ? '#94a3b8' : 'white',
            cursor: !newTime || saving ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem', fontWeight: 600,
          }}
        >
          + Adicionar
        </button>
      </div>
    </div>
  )
}
