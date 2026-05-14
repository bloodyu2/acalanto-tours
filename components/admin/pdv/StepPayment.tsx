// components/admin/pdv/StepPayment.tsx
'use client'
import { useState, useEffect } from 'react'
import { formatCents } from '@/lib/booking/pricing'
import { PaymentBadge, ALL_PAYMENT_BRANDS } from '@/components/payments/PaymentBadge'
import { usePaymentStatus } from './usePaymentStatus'

interface Props {
  bookingId: string
  totalCents: number
  pixQrCode: string | null         // data:image/png;base64,...
  pixCopyPaste: string | null
  cardCheckoutUrl: string | null   // iframe URL pro cartão (vem do POST inicial)
  onPaid: () => void
}

export default function StepPayment({ bookingId, totalCents, pixQrCode, pixCopyPaste, cardCheckoutUrl, onPaid }: Props) {
  const [tab, setTab] = useState<'pix' | 'card'>('pix')
  const [copied, setCopied] = useState(false)
  const { status, elapsedSec, canConfirmManually } = usePaymentStatus(bookingId)

  useEffect(() => {
    if (['received', 'confirmed'].includes(status)) {
      onPaid()
    }
  }, [status, onPaid])

  async function copyPix() {
    if (!pixCopyPaste) return
    await navigator.clipboard.writeText(pixCopyPaste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', maxWidth: '560px' }}>
      {/* Tabs */}
      <div role="tablist" aria-label="Método de pagamento" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['pix', 'card'] as const).map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '0.75rem', border: `2px solid ${tab === t ? 'var(--ocean-mid)' : 'var(--border)'}`,
              borderRadius: '0.625rem', background: tab === t ? 'rgba(26,107,138,0.08)' : 'white',
              cursor: 'pointer', fontWeight: 700, color: 'var(--ocean-deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            <PaymentBadge brand={t === 'pix' ? 'pix' : 'visa'} size={24} />
            {t === 'pix' ? 'PIX' : 'Cartão'}
          </button>
        ))}
      </div>

      {tab === 'pix' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {pixQrCode ? (
              <img
                src={pixQrCode}
                alt="QR code PIX"
                width={260}
                height={260}
                style={{ borderRadius: '0.625rem', border: '1px solid var(--border)' }}
              />
            ) : (
              <div style={{ width: 260, height: 260, margin: '0 auto', background: 'var(--sand)', borderRadius: '0.625rem' }} />
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
            Aponte a câmera do celular do cliente pra esse código.
          </p>
          {pixCopyPaste && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                readOnly
                value={pixCopyPaste}
                style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem', background: 'var(--sand)' }}
              />
              <button onClick={copyPix} style={{ padding: '0.5rem 1rem', background: 'var(--ocean-mid)', color: 'white', border: 0, borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                {copied ? 'Copiado ✓' : 'Copiar'}
              </button>
            </div>
          )}
          <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--sand)', borderRadius: '0.625rem', marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.25rem' }}>Total</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>{formatCents(totalCents)}</p>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {status === 'pending' && `⏳ Aguardando pagamento… (${String(Math.floor(elapsedSec/60)).padStart(2,'0')}:${String(elapsedSec%60).padStart(2,'0')})`}
            {['received','confirmed'].includes(status) && '✅ Pagamento recebido!'}
            {status === 'error' && '⚠ Erro ao consultar status — vamos tentar de novo'}
          </p>
          {canConfirmManually && (
            <button
              onClick={onPaid}
              style={{ marginTop: '0.75rem', width: '100%', padding: '0.75rem', background: 'white', border: '1.5px dashed var(--ocean-mid)', borderRadius: '0.625rem', cursor: 'pointer', color: 'var(--ocean-deep)', fontWeight: 600 }}
            >
              Já recebi (confirmar manualmente)
            </button>
          )}
        </div>
      )}

      {tab === 'card' && (
        <div>
          {cardCheckoutUrl ? (
            <iframe
              src={cardCheckoutUrl}
              title="Pagamento por cartão"
              style={{ width: '100%', height: '480px', border: 0, borderRadius: '0.625rem' }}
            />
          ) : (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Carregando formulário de cartão…
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {ALL_PAYMENT_BRANDS.map(b => (
          <PaymentBadge key={b} brand={b} size={24} />
        ))}
      </div>
    </div>
  )
}
