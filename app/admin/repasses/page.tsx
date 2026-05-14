'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Payout {
  id: string
  partner_id: string
  period_month: string
  gross_cents: number
  commission_cents: number
  net_cents: number
  status: 'pending' | 'paid'
  paid_at: string | null
  notes: string | null
  partners?: { name: string }
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AdminRepassesPage() {
  const supabase = createClient()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState<Record<string, string>>({})

  function load() {
    supabase
      .from('payouts')
      .select('*, partners(name)')
      .order('period_month', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setPayouts((data as Payout[]) ?? [])
        setLoading(false)
      })
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function markPaid(id: string) {
    setActionMsg(m => ({ ...m, [id]: 'Salvando...' }))
    const res = await fetch(`/api/admin/payouts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_paid' }),
    })
    if (res.ok) {
      setActionMsg(m => ({ ...m, [id]: 'Pago!' }))
      load()
    } else {
      setActionMsg(m => ({ ...m, [id]: 'Erro.' }))
    }
  }

  const pending = payouts.filter(p => p.status === 'pending')
  const paid = payouts.filter(p => p.status === 'paid')

  if (loading) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Carregando...</div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '0.25rem' }}>
        Repasses
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Gerencie os repasses mensais aos parceiros.
      </p>

      {/* Pending */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.15rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
        Pendentes ({pending.length})
      </h2>

      {/* Pending — desktop table */}
      <div className="hidden-mobile" style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '2.5rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--sand)' }}>
              <tr>
                {['Parceiro', 'Periodo', 'Bruto', 'Comissao', 'Liquido', 'Acao'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--ocean-deep)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.map((p, i) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--ocean-deep)' }}>
                    {p.partners?.name || p.partner_id}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>{p.period_month}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>{formatCents(p.gross_cents)}</td>
                  <td style={{ padding: '0.875rem 1.25rem', color: '#e53e3e' }}>-{formatCents(p.commission_cents)}</td>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: '#38a169' }}>{formatCents(p.net_cents)}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    {actionMsg[p.id] ? (
                      <span style={{ fontSize: '0.8rem', color: actionMsg[p.id] === 'Pago!' ? '#38a169' : '#e53e3e' }}>
                        {actionMsg[p.id]}
                      </span>
                    ) : (
                      <button
                        onClick={() => markPaid(p.id)}
                        style={{
                          background: '#38a169', color: 'white', border: 'none', borderRadius: '0.5rem',
                          padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Marcar como pago
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum repasse pendente.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending — mobile cards */}
      <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2.5rem' }}>
        {pending.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '0.875rem', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--ocean-deep)', fontSize: '0.95rem' }}>
                {p.partners?.name ?? '—'}
              </div>
              <span style={{ background: 'rgba(214,158,46,0.15)', color: '#9c6b14', fontSize: '0.72rem', fontWeight: 700, padding: '0.18rem 0.5rem', borderRadius: '999px', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
                {p.period_month}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 0.75rem', fontSize: '0.8rem', marginBottom: '0.625rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Bruto:</span><span style={{ textAlign: 'right' }}>{formatCents(p.gross_cents)}</span>
              <span style={{ color: 'var(--text-muted)' }}>Comissão:</span><span style={{ textAlign: 'right' }}>{formatCents(p.commission_cents)}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Líquido:</span><span style={{ textAlign: 'right', fontWeight: 700, color: 'var(--ocean-deep)' }}>{formatCents(p.net_cents)}</span>
            </div>
            <button
              onClick={() => markPaid(p.id)}
              disabled={!!actionMsg[p.id]}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.625rem' }}
            >
              {actionMsg[p.id] ?? 'Marcar como pago'}
            </button>
          </div>
        ))}
        {pending.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>Nenhum repasse pendente</p>
        )}
      </div>

      {/* Paid */}
      <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.15rem', color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
        Pagos ({paid.length})
      </h2>

      {/* Paid — desktop table */}
      <div className="hidden-mobile" style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--sand)' }}>
              <tr>
                {['Parceiro', 'Periodo', 'Liquido', 'Pago em'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontWeight: 700, color: 'var(--ocean-deep)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paid.map((p, i) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--ocean-deep)' }}>
                    {p.partners?.name || p.partner_id}
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>{p.period_month}</td>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 700, color: '#38a169' }}>{formatCents(p.net_cents)}</td>
                  <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-muted)' }}>
                    {p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR') : '-'}
                  </td>
                </tr>
              ))}
              {paid.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum repasse pago ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paid — mobile cards */}
      <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {paid.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: '0.875rem', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--ocean-deep)', fontSize: '0.95rem' }}>
                {p.partners?.name ?? '—'}
              </div>
              <span style={{ background: 'rgba(56,161,105,0.15)', color: '#276749', fontSize: '0.72rem', fontWeight: 700, padding: '0.18rem 0.5rem', borderRadius: '999px', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
                {p.period_month}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Líquido:</span><span style={{ textAlign: 'right', fontWeight: 700, color: '#38a169' }}>{formatCents(p.net_cents)}</span>
              <span style={{ color: 'var(--text-muted)' }}>Pago em:</span><span style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR') : '-'}</span>
            </div>
          </div>
        ))}
        {paid.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>Nenhum repasse pago ainda.</p>
        )}
      </div>

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
