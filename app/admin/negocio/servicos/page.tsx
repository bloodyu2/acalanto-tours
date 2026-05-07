import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function fmt(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminServicosPage() {
  const supabase = await createAdminClient()
  const { data: services } = await supabase.from('services').select('*').order('display_order')

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <Link href="/admin/negocio" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Negócios</Link>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginTop: '0.25rem' }}>Serviços</h1>
        </div>
        <Link href="/admin/negocio/servicos/novo" className="btn-primary" style={{ textDecoration: 'none', padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          + Novo Serviço
        </Link>
      </div>
      <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7f9fc', borderBottom: '1px solid var(--border)' }}>
              {['Nome', 'Slug', 'Tipo Preço', 'Valor', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(services ?? []).map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--ocean-deep)' }}>{s.name}</div>
                  {s.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>}
                </td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.slug}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{s.pricing_type === 'per_person' ? 'Por pessoa' : 'Por grupo'}</td>
                <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>
                  {s.price_cents_per_person ? fmt(s.price_cents_per_person) + '/pax'
                    : s.price_cents_group ? fmt(s.price_cents_group) + '/grp'
                    : s.price_label ?? '—'}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span style={{ background: s.active ? '#38a16920' : '#a0aec020', color: s.active ? '#38a169' : '#a0aec0', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
                    {s.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Link href={`/admin/negocio/servicos/${s.id}`} style={{ fontSize: '0.8rem', color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!services || services.length === 0) && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum serviço cadastrado.</div>
        )}
      </div>
    </div>
  )
}
