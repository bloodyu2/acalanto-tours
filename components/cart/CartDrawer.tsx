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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-playfair)' }}>
                {formatBRL(totalCents)}
              </span>
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { closeCart(); router.push('/checkout') }}
            >
              Ir para o Checkout
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Pagamento seguro via Pix
            </p>
          </div>
        )}
      </div>
    </>
  )
}
