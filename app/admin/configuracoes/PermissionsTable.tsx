'use client'
import { useState, useTransition } from 'react'
import { updatePermission } from './actions'

interface Row { role: string; vertical: string; enabled: boolean; priority: number }
interface Props { rows: Row[] }

const ROLES = ['super_admin', 'pdv', 'tripulacao', 'fotografo'] as const
const VERTICALS = ['passeio', 'fotografia', 'servico', 'hospedagem'] as const

export default function PermissionsTable({ rows: initialRows }: Props) {
  const [rows, setRows] = useState(initialRows)
  const [pending, startTransition] = useTransition()
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const get = (role: string, vertical: string) =>
    rows.find(r => r.role === role && r.vertical === vertical) ?? { role, vertical, enabled: false, priority: 0 }

  function update(role: string, vertical: string, patch: Partial<Row>) {
    const current = get(role, vertical)
    const next = { ...current, ...patch }
    setRows(prev => {
      const others = prev.filter(r => !(r.role === role && r.vertical === vertical))
      return [...others, next]
    })
    startTransition(async () => {
      await updatePermission(role, vertical, next.enabled, next.priority)
      setSavedAt(new Date().toLocaleTimeString('pt-BR'))
    })
  }

  return (
    <div>
      <div className="hidden-mobile" style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--sand)' }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700 }}>Role</th>
              {VERTICALS.map(v => (
                <th key={v} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize' }}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role, i) => (
              <tr key={role} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{role}</td>
                {VERTICALS.map(v => {
                  const p = get(role, v)
                  return (
                    <td key={v} style={{ padding: '0.5rem 1rem', textAlign: 'center' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={p.enabled}
                          onChange={e => update(role, v, { enabled: e.target.checked })}
                          disabled={pending}
                        />
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={p.priority}
                          onChange={e => update(role, v, { priority: Number(e.target.value) })}
                          disabled={pending || !p.enabled}
                          style={{ width: '52px', padding: '0.25rem 0.375rem', border: '1px solid var(--border)', borderRadius: '0.375rem', fontSize: '0.8rem', textAlign: 'center' }}
                        />
                      </label>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {ROLES.map(role => (
          <div key={role} style={{ background: 'white', borderRadius: '0.875rem', padding: '1rem 1.125rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.625rem', fontSize: '0.95rem' }}>{role}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {VERTICALS.map(v => {
                const p = get(role, v)
                return (
                  <div key={v} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.85rem' }}>
                      <input
                        type="checkbox"
                        checked={p.enabled}
                        onChange={e => update(role, v, { enabled: e.target.checked })}
                        disabled={pending}
                      />
                      {v}
                    </label>
                    <input
                      type="number"
                      min={0} max={999}
                      value={p.priority}
                      onChange={e => update(role, v, { priority: Number(e.target.value) })}
                      disabled={pending || !p.enabled}
                      aria-label={`Prioridade ${role} ${v}`}
                      style={{ width: '60px', padding: '0.3rem 0.4rem', border: '1px solid var(--border)', borderRadius: '0.375rem', fontSize: '0.8rem', textAlign: 'center' }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {pending ? 'Salvando…' : savedAt ? `Salvo às ${savedAt}` : 'Mudanças são salvas automaticamente.'}
      </p>

      <style jsx>{`
        @media (min-width: 768px) {
          .hidden-mobile { display: block !important; }
          .show-mobile   { display: none  !important; }
        }
        @media (max-width: 767px) {
          .hidden-mobile { display: none  !important; }
          .show-mobile   { display: flex  !important; }
        }
      `}</style>
    </div>
  )
}
