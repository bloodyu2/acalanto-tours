'use client'

interface Row { role: string; vertical: string; enabled: boolean; priority: number }
interface Props { rows: Row[] }

const ROLES = ['super_admin', 'pdv', 'tripulacao', 'fotografo'] as const
const VERTICALS = ['passeio', 'fotografia', 'servico', 'hospedagem'] as const

export default function PermissionsTable({ rows }: Props) {
  const get = (role: string, vertical: string) =>
    rows.find(r => r.role === role && r.vertical === vertical) ?? { enabled: false, priority: 0 }

  return (
    <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
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
                  <td key={v} style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <span style={{ color: p.enabled ? '#16a34a' : '#94a3b8' }}>
                      {p.enabled ? `✓ (${p.priority})` : '—'}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
