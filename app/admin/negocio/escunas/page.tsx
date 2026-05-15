import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function fmt(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminEscunasPage() {
  const supabase = await createAdminClient()
  const { data: boats } = await supabase.from('boats').select('*').order('display_order')

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <Link href="/admin/negocio" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Estabelecimentos</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginTop: '0.25rem' }}>Escunas</h1>
        </div>
        <Link href="/admin/negocio/escunas/novo" className="btn-primary" style={{ textDecoration: 'none', padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          + Nova Escuna
        </Link>
      </div>
      <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7f9fc', borderBottom: '1px solid var(--border)' }}>
              {['Nome', 'Saída', 'Duração', 'Adulto', 'Capacidade', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(boats ?? []).map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{b.name}</div>
                  {b.tagline && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.tagline}</div>}
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{b.departure_time?.slice(0, 5)}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{b.duration_hours}h</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{fmt(b.price_adult)}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{b.capacity_max} pax</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ background: b.active ? '#38a16920' : '#a0aec020', color: b.active ? '#38a169' : '#a0aec0', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
                    {b.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Link href={`/admin/negocio/escunas/${b.id}`} style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!boats || boats.length === 0) && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma escuna cadastrada.</div>
        )}
      </div>
    </div>
  )
}
