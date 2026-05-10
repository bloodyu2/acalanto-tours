'use client'
import { useCart } from './CartProvider'
import { useRouter } from 'next/navigation'

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string) {
  if (!iso) return 'Sem data'
  try {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  } catch {
    return iso
  }
}

export default function CartDrawer() {
  const { items, totalCents, isOpen, closeCart, removeItem } = useCart()
  const router = useRouter()

  if (!isOpen) return null

  return (
    <>
      <div className="drawer-overlay" onClick={closeCart} />
      <div className="drawer-panel">
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.25rem',
            fontWeight: 700,
            margin: 0,
          }}>
            Seu carrinho
          </h2>
          <button
            onClick={closeCart}
            aria-label="Fechar carrinho"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: '1rem' }}>Nenhum item no carrinho ainda.</p>
              <a
                href="/passeios"
                onClick={closeCart}
                style={{ color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Ver passeios
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map(item => {
                let displayTotal: number
                let displayDetails: string
                if (item.type === 'hospedagem') {
                  displayTotal = (item.pricePerNightCents ?? 0) * (item.nights ?? 1)
                  displayDetails = `${item.nights} noite${item.nights !== 1 ? 's' : ''} · ${item.guests} hóspede${(item.guests ?? 1) !== 1 ? 's' : ''} · ${formatDate(item.checkIn ?? item.date)} → ${formatDate(item.checkOut ?? '')}`
                } else if (item.type === 'servico' && item.pricingType === 'per_group') {
                  displayTotal = item.priceAdultCents
                  displayDetails = `Grupo de ${item.groupSize ?? item.adults} pessoas · ${formatDate(item.date)}`
                } else {
                  displayTotal = item.adults * item.priceAdultCents + item.children * item.priceChildCents
                    + (item.boatPhotographerAddon ? (item.boatPhotographerAddonCents ?? 0) : 0)
                  displayDetails = `${item.adults} adulto${item.adults !== 1 ? 's' : ''}${item.children > 0 ? ` · ${item.children} criança${item.children !== 1 ? 's' : ''}` : ''} · ${formatDate(item.date)}`
                }
                return (
                  <div key={item.id} style={{
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '1rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <span className={`vertical-tag tag-${item.type === 'passeio' ? 'passeios' : item.type}`}>
                          {item.type}
                        </span>
                        <p style={{ fontWeight: 600, marginTop: '0.4rem', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          {displayDetails}
                        </p>
                        <p style={{ fontWeight: 700, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                          {formatBRL(displayTotal)}
                        </p>
                        {item.boatPhotographerAddon && (
                          <div style={{ marginTop: '0.375rem' }}>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--ocean-deep)', fontWeight: 600, margin: 0 }}>
                              📷 Fotógrafo a bordo — +R$ 350,00
                            </p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.1rem 0 0' }}>
                              A Calanto confirmará o fotógrafo após a reserva
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label="Remover item"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: '0.25rem',
                          fontSize: '1rem',
                          flexShrink: 0,
                        }}
                      >
                        ✕
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-playfair)' }}>
                {formatBRL(totalCents)}
              </span>
            </div>

            {/* Checkout CTA */}
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '0.625rem' }}
              onClick={() => { closeCart(); router.push('/checkout') }}
            >
              Ir para o Checkout
            </button>

            {/* Continue shopping */}
            <button
              type="button"
              onClick={closeCart}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'white',
                border: '1.5px solid var(--border)',
                borderRadius: '0.875rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              Continuar comprando
            </button>

            {/* Payment methods */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.875rem', marginBottom: '0.625rem' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.625rem', textAlign: 'center' }}>
                Formas de pagamento
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* Pix */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.75rem', borderRadius: '6px',
                  background: '#f0fdf4', border: '1px solid #bbf7d0',
                  fontSize: '0.75rem', fontWeight: 600, color: '#166534',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.354 2.646a.9.9 0 011.292 0l2.354 2.354 2.354-2.354a.9.9 0 011.292 0l3.708 3.708a.9.9 0 010 1.292L19.646 10 22 12.354a.9.9 0 010 1.292L18.354 17a.9.9 0 01-1.292 0L14.708 14.646 12.354 17a.9.9 0 01-1.292 0L8.708 14.646 6.354 17a.9.9 0 01-1.292 0L1.354 13.646a.9.9 0 010-1.292L3.708 10 1.354 7.646a.9.9 0 010-1.292L5.062 2.646a.9.9 0 011.292 0L8.708 5l2.354-2.354z"/>
                  </svg>
                  Pix
                </div>
                {/* Cartão de crédito */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.75rem', borderRadius: '6px',
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  fontSize: '0.75rem', fontWeight: 600, color: '#1e40af',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Cartão
                </div>
                {/* Boleto */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.75rem', borderRadius: '6px',
                  background: '#fefce8', border: '1px solid #fef08a',
                  fontSize: '0.75rem', fontWeight: 600, color: '#854d0e',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="3" height="18"/><rect x="8" y="3" width="1" height="18"/>
                    <rect x="11" y="3" width="3" height="18"/><rect x="16" y="3" width="1" height="18"/>
                    <rect x="19" y="3" width="2" height="18"/>
                  </svg>
                  Boleto
                </div>
                {/* Débito */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.375rem 0.75rem', borderRadius: '6px',
                  background: '#f0f9ff', border: '1px solid #bae6fd',
                  fontSize: '0.75rem', fontWeight: 600, color: '#0369a1',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                    <circle cx="7" cy="15" r="1" fill="currentColor"/>
                  </svg>
                  Débito
                </div>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
              Pagamento seguro via ASAAS · protegido pela LGPD
            </p>
          </div>
        )}
      </div>
    </>
  )
}
