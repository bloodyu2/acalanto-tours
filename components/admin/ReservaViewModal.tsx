'use client'
import { useState } from 'react'
import { formatCents } from '@/lib/booking/pricing'
import { BALAIO_TOTAL_PCT, computeSplitCents } from '@/lib/asaas/split'

export interface ReservaRow {
  id: string
  boat_name: string | null
  partner_name: string | null
  partner_wallet_id: string | null
  tour_date: string | null
  adults: number
  children: number
  total_cents: number
  commission_rate: number
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  status: string
  payment_status: string | null
  payment_method: string | null
  asaas_payment_id: string | null
  paid_at: string | null
  photographer_package_id: string | null
  notes: string | null
  vertical: string
  utm_campaign: string | null
  created_at: string
}

interface Props {
  booking: ReservaRow
  onClose: () => void
  canPayPartner: boolean
}

const paymentStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado ✓',
  received: 'Recebido ✓',
  overdue: 'Vencido ⚠',
  refunded: 'Estornado',
  awaiting_payment: 'Aguardando pgto',
}

const paymentStatusColor: Record<string, string> = {
  pending: '#d69e2e',
  confirmed: '#38a169',
  received: '#38a169',
  overdue: '#e53e3e',
  refunded: '#a0aec0',
  awaiting_payment: '#d69e2e',
}

export default function ReservaViewModal({ booking: b, onClose, canPayPartner }: Props) {
  const [syncing, setSyncing] = useState(false)
  const [paying, setPaying] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [payResult, setPayResult] = useState<string | null>(null)

  // commission_rate is stored as integer percentage (e.g. 30 = Acalanto+Balaio retain 30% combined).
  const acalantoGrossPct = Math.round(b.commission_rate ?? 30)
  const partnerPct = 100 - acalantoGrossPct
  const { partnerCents: partnerValueCents, balaioCents: balaioValueCents, acalantoCents: acalantoValueCents } =
    computeSplitCents(b.total_cents, partnerPct, true)
  const balaioPct = balaioValueCents > 0 ? BALAIO_TOTAL_PCT : 0
  const acalantoNetPct = acalantoGrossPct - balaioPct

  const pStatus = (b.payment_status ?? 'pending').toLowerCase()
  const isPaid = ['confirmed', 'received'].includes(pStatus)

  async function handleSync() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/admin/reservas/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro')
      setSyncMsg(`Sync OK — ${data.updated ?? 0} atualizada(s) de ${data.checked ?? 0}`)
    } catch (e) {
      setSyncMsg(`Erro: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSyncing(false)
    }
  }

  async function handlePayPartner() {
    if (!b.partner_wallet_id) {
      setPayResult('Parceiro sem wallet ASAAS configurada — preencher em /admin/parceiros.')
      return
    }
    if (!confirm(`Confirmar repasse de ${formatCents(partnerValueCents)} para ${b.partner_name ?? 'parceiro'}?`)) {
      return
    }
    setPaying(true)
    setPayResult(null)
    try {
      const res = await fetch(`/api/admin/reservas/${b.id}/pay-partner`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro')
      setPayResult(`✓ Repasse de ${data.partnerValueFormatted} enviado para ${data.partnerName}`)
    } catch (e) {
      setPayResult(`Erro: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setPaying(false)
    }
  }

  const detailRows: Array<[string, string]> = [
    ['Data do passeio', b.tour_date ?? '—'],
    ['Passageiros', `${b.adults} adulto${b.adults !== 1 ? 's' : ''}${b.children > 0 ? ` · ${b.children} criança${b.children !== 1 ? 's' : ''}` : ''}`],
    ['Cliente', b.customer_name ?? '—'],
    ['E-mail', b.customer_email ?? '—'],
    ['Telefone', b.customer_phone ?? '—'],
    ['Add-ons', b.photographer_package_id ? '📷 Fotógrafo a bordo' : '—'],
    ['Prestador', b.partner_name ?? '—'],
    ['ID ASAAS', b.asaas_payment_id ? `${b.asaas_payment_id.slice(0, 14)}…` : '—'],
    ['Pago em', b.paid_at ? new Date(b.paid_at).toLocaleString('pt-BR') : '—'],
    ['UTM', b.utm_campaign ?? '—'],
  ]

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000 }}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          background: 'white', borderRadius: '1.25rem', padding: '1.75rem',
          width: 'min(620px, 95vw)', maxHeight: '90vh', overflowY: 'auto',
          zIndex: 1001, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', margin: 0 }}>
              {b.boat_name ?? b.vertical ?? 'Reserva'}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              {b.id.slice(0, 8)}… · criada em {new Date(b.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: `${paymentStatusColor[pStatus] ?? '#a0aec0'}18`,
          color: paymentStatusColor[pStatus] ?? '#a0aec0',
          padding: '0.375rem 0.875rem', borderRadius: '999px',
          fontSize: '0.78rem', fontWeight: 700, marginBottom: '1.25rem',
        }}>
          {paymentStatusLabel[pStatus] ?? pStatus}
          {b.payment_method ? ` · ${b.payment_method}` : ''}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.625rem', marginBottom: '1.25rem' }}>
          {detailRows.map(([label, value]) => (
            <div key={label} style={{ background: '#f7f9fc', borderRadius: '0.625rem', padding: '0.625rem 0.75rem' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '0 0 0.2rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ocean-deep)', margin: 0, wordBreak: 'break-word' }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--sand, #fdf8f0)', borderRadius: '0.875rem', padding: '1.125rem 1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: 'var(--ocean-deep)', margin: '0 0 0.875rem' }}>
            Split de receita
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total do cliente</span>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ocean-deep)' }}>{formatCents(b.total_cents)}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Parceiro {b.partner_name ? `(${b.partner_name})` : ''} — {partnerPct}%</span>
              <span style={{ fontWeight: 600, color: '#38a169' }}>{formatCents(partnerValueCents)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Acalanto — {acalantoNetPct}%</span>
              <span style={{ fontWeight: 600, color: 'var(--ocean-mid)' }}>{formatCents(acalantoValueCents)}</span>
            </div>
            {balaioValueCents > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Balaio Digital — {balaioPct}%</span>
                <span style={{ fontWeight: 600, color: '#64748b' }}>{formatCents(balaioValueCents)}</span>
              </div>
            )}
          </div>
        </div>

        {canPayPartner && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {syncMsg && (
              <p style={{ fontSize: '0.8rem', color: syncMsg.startsWith('Erro') ? '#e53e3e' : '#38a169', margin: 0, textAlign: 'center' }}>
                {syncMsg}
              </p>
            )}
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{
                padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '0.75rem',
                background: 'white', cursor: syncing ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: 600, color: 'var(--ocean-deep)',
                opacity: syncing ? 0.6 : 1,
              }}
            >
              {syncing ? 'Sincronizando…' : '🔄 Sincronizar status com ASAAS'}
            </button>

            {isPaid && (
              <>
                {payResult && (
                  <p style={{ fontSize: '0.8rem', color: payResult.startsWith('✓') ? '#38a169' : '#e53e3e', margin: 0, textAlign: 'center' }}>
                    {payResult}
                  </p>
                )}
                <button
                  onClick={handlePayPartner}
                  disabled={paying}
                  className="btn-primary"
                  style={{ justifyContent: 'center', opacity: paying ? 0.6 : 1, cursor: paying ? 'not-allowed' : 'pointer' }}
                >
                  {paying ? 'Processando…' : `💸 Pagar parceiro — ${formatCents(partnerValueCents)}`}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
