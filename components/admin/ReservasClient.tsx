'use client'
import { useState } from 'react'
import { formatCents } from '@/lib/booking/pricing'
import ReservaViewModal, { type ReservaRow } from './ReservaViewModal'

interface Props {
  bookings: ReservaRow[]
  canPayPartner: boolean
}

const statusColors: Record<string, string> = {
  pending: '#805ad5',
  whatsapp_initiated: '#d69e2e',
  confirmed: '#38a169',
  cancelled: '#e53e3e',
  no_show: '#a0aec0',
}
const statusLabels: Record<string, string> = {
  pending: 'Aguardando pagto',
  whatsapp_initiated: 'Iniciada WA',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  no_show: 'No-show',
}
const paymentBadge: Record<string, { bg: string; color: string; label: string }> = {
  pending:           { bg: 'rgba(214,158,46,0.15)',  color: '#9c6b14', label: 'Pendente' },
  awaiting_payment:  { bg: 'rgba(214,158,46,0.15)',  color: '#9c6b14', label: 'Aguardando' },
  confirmed:         { bg: 'rgba(56,161,105,0.15)',  color: '#1f6d40', label: 'Pago ✓' },
  received:          { bg: 'rgba(56,161,105,0.15)',  color: '#1f6d40', label: 'Recebido ✓' },
  overdue:           { bg: 'rgba(229,62,62,0.15)',   color: '#9b1c1c', label: 'Vencido' },
  refunded:          { bg: 'rgba(160,174,192,0.18)', color: '#4a5568', label: 'Estornado' },
}

function paymentChip(rawStatus: string | null) {
  const key = (rawStatus ?? 'pending').toLowerCase()
  const conf = paymentBadge[key] ?? { bg: '#eef2f5', color: '#4a5568', label: key || '—' }
  return (
    <span style={{
      background: conf.bg, color: conf.color,
      fontSize: '0.72rem', fontWeight: 700, padding: '0.18rem 0.55rem', borderRadius: '999px',
      whiteSpace: 'nowrap',
    }}>
      {conf.label}
    </span>
  )
}

export default function ReservasClient({ bookings, canPayPartner }: Props) {
  const [selected, setSelected] = useState<ReservaRow | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  async function handleBulkSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/admin/reservas/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro')
      setSyncResult(`✓ ${data.updated ?? 0} atualizada(s) de ${data.checked ?? 0}`)
      if ((data.updated ?? 0) > 0) {
        setTimeout(() => window.location.reload(), 1200)
      }
    } catch (e) {
      setSyncResult(`Erro: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: 0 }}>
          Reservas
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {syncResult && (
            <span style={{
              fontSize: '0.8rem', fontWeight: 600,
              color: syncResult.startsWith('Erro') ? '#e53e3e' : '#1f6d40',
            }}>
              {syncResult}
            </span>
          )}
          {canPayPartner && (
            <button
              onClick={handleBulkSync}
              disabled={syncing}
              style={{
                padding: '0.5rem 1rem', border: '1.5px solid var(--border)', borderRadius: '0.75rem',
                background: 'white', cursor: syncing ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem', fontWeight: 600, color: 'var(--ocean-deep)',
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                opacity: syncing ? 0.6 : 1,
              }}
            >
              🔄 {syncing ? 'Sincronizando…' : 'Sync ASAAS'}
            </button>
          )}
          <a
            href="/admin/vendas"
            className="btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            + Nova Venda
          </a>
        </div>
      </div>

      <div className="hidden-mobile" style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ background: 'var(--sand)' }}>
              <tr>
                {['', 'Embarcação', 'Data', 'Pax', 'Total', 'Pgto', 'Cliente', 'Status', 'Criada em'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 0.875rem', textAlign: 'left', fontWeight: 700, color: 'var(--ocean-deep)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr
                  key={b.id}
                  style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : '#fafbfc' }}
                >
                  <td style={{ padding: '0.625rem 0.5rem 0.625rem 0.875rem' }}>
                    <button
                      onClick={() => setSelected(b)}
                      title="Ver detalhes"
                      aria-label="Ver detalhes"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--ocean-mid)', padding: '0.25rem',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                  <td style={{ padding: '0.875rem', fontWeight: 600, color: 'var(--ocean-deep)', whiteSpace: 'nowrap' }}>
                    {b.boat_name || b.vertical || '—'}
                  </td>
                  <td style={{ padding: '0.875rem', whiteSpace: 'nowrap' }}>{b.tour_date ?? '—'}</td>
                  <td style={{ padding: '0.875rem', whiteSpace: 'nowrap' }}>
                    {b.adults}A{b.children > 0 ? ` ${b.children}C` : ''}
                  </td>
                  <td style={{ padding: '0.875rem', fontWeight: 700, color: 'var(--sunset)', whiteSpace: 'nowrap' }}>
                    {formatCents(b.total_cents)}
                  </td>
                  <td style={{ padding: '0.875rem' }}>{paymentChip(b.payment_status)}</td>
                  <td style={{ padding: '0.875rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {b.customer_name || '—'}
                  </td>
                  <td style={{ padding: '0.875rem' }}>
                    <span style={{
                      background: `${statusColors[b.status] ?? '#a0aec0'}20`,
                      color: statusColors[b.status] ?? '#4a5568',
                      fontSize: '0.72rem', fontWeight: 700, padding: '0.18rem 0.55rem', borderRadius: '999px',
                      whiteSpace: 'nowrap',
                    }}>
                      {statusLabels[b.status] || b.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(b.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhuma reserva ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="show-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {bookings.map(b => (
          <div key={b.id} style={{ background: 'white', borderRadius: '0.875rem', padding: '0.875rem 1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}
               onClick={() => setSelected(b)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.375rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--ocean-deep)', fontSize: '0.95rem' }}>
                {b.boat_name || b.vertical || 'Reserva'}
              </div>
              {paymentChip(b.payment_status)}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 0.875rem', marginBottom: '0.5rem' }}>
              <span>📅 {b.tour_date ?? '—'}</span>
              <span>👥 {b.adults}A{b.children > 0 ? ` ${b.children}C` : ''}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ocean-deep)', marginBottom: '0.375rem' }}>
              {b.customer_name ?? 'Sem nome'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ocean-deep)' }}>
                {formatCents(b.total_cents)}
              </span>
              <span style={{ background: `${statusColors[b.status] || '#94a3b8'}20`, color: statusColors[b.status] || '#475569', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
                {statusLabels[b.status] || b.status}
              </span>
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <p style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma reserva ainda.</p>
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

      {selected && (
        <ReservaViewModal
          booking={selected}
          onClose={() => setSelected(null)}
          canPayPartner={canPayPartner}
        />
      )}
    </>
  )
}
