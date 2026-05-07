'use client'
import { useState } from 'react'
import { useCart } from '@/components/cart/CartProvider'
import Link from 'next/link'

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

export default function CheckoutPage() {
  const { items, totalCents, clearCart } = useCart()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const utmCampaign = items[0]?.utmCampaign ?? null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/infinity-pay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerName: nome,
          customerEmail: email,
          customerPhone: telefone,
          utmCampaign,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao processar pagamento. Tente novamente.')
        return
      }
      clearCart()
      window.location.href = data.redirectUrl
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Seu carrinho está vazio.</p>
          <Link href="/passeios" className="btn-primary">Ver passeios</Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '640px', margin: '0 auto' }}>
      {/* Breadcrumb */}
      <Link
        href="/passeios"
        style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem' }}
      >
        &larr; Voltar ao passeio
      </Link>

      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', marginBottom: '1.5rem' }}>
        Checkout
      </h1>

      {/* Order summary */}
      <div style={{ background: 'var(--sand)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Resumo do pedido
        </h2>
        {items.map(item => {
          const itemTotal = item.adults * item.priceAdultCents + item.children * item.priceChildCents
          return (
            <div key={item.id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{item.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {formatDate(item.date)} &bull; {item.adults} adulto{item.adults !== 1 ? 's' : ''}
                    {item.children > 0 ? `, ${item.children} crianca${item.children !== 1 ? 's' : ''}` : ''}
                  </p>
                </div>
                <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{formatBRL(itemTotal)}</span>
              </div>
            </div>
          )
        })}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.0625rem', marginTop: '0.5rem' }}>
          <span>Total</span>
          <span style={{ fontFamily: 'var(--font-playfair)' }}>{formatBRL(totalCents)}</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="nome">Nome completo *</label>
          <input
            id="nome"
            className="form-input"
            type="text"
            required
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Seu nome"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">E-mail *</label>
          <input
            id="email"
            className="form-input"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="telefone">Telefone *</label>
          <input
            id="telefone"
            className="form-input"
            type="tel"
            required
            value={telefone}
            onChange={e => setTelefone(e.target.value)}
            placeholder="(xx) 9xxxx-xxxx"
          />
        </div>

        {error && (
          <p style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '1rem', padding: '0.75rem', background: '#FEF2F2', borderRadius: '8px' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Processando...' : 'Pagar com Pix'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          Pagamento seguro via Pix
        </p>
      </form>
    </main>
  )
}
