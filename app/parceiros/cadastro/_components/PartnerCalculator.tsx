'use client'

import { useState } from 'react'
import { BALAIO_TOTAL_PCT } from '@/lib/asaas/split'

const COMMISSION_PCT = 70   // parceiro recebe 70%
const CALANTO_PCT    = 30   // Acalanto retém 30% (inclui os 6% da Balaio)

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PartnerCalculator() {
  const [price, setPrice]       = useState('')
  const [qty, setQty]           = useState(5)

  const raw = parseFloat(price.replace(',', '.')) || 0

  const partnerReceives = raw * (COMMISSION_PCT / 100)
  const calaComission   = raw * (CALANTO_PCT / 100)
  // Balaio sempre fica com 6% do TOTAL da venda — sai de dentro da fatia da Acalanto.
  const balaioShare     = raw * (BALAIO_TOTAL_PCT / 100)
  const calaNetShare    = calaComission - balaioShare

  const monthlyPartner  = partnerReceives * qty

  return (
    <div
      style={{
        background: '#f0f9ff',
        border: '1.5px solid #bae6fd',
        borderRadius: '14px',
        padding: '1.375rem 1.5rem',
        marginTop: '0.25rem',
      }}
    >
      <p style={{ fontSize: '0.8125rem', color: '#0369a1', fontWeight: 600, marginBottom: '0.875rem', lineHeight: 1.5 }}>
        Simule quanto você vai receber por venda
      </p>

      {/* Price input */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="calc-price"
          style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.375rem', color: '#0c4a6e' }}
        >
          Preço que você quer cobrar (R$)
        </label>
        <input
          id="calc-price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Ex: 250,00"
          style={{
            width: '100%', padding: '0.75rem 1rem',
            border: '1.5px solid #bae6fd', borderRadius: '8px',
            fontSize: '0.9375rem', fontFamily: 'inherit',
            outline: 'none', background: 'white',
            boxSizing: 'border-box', color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Results */}
      {raw > 0 && (
        <>
          <div
            style={{
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              background: 'white', borderRadius: '10px',
              padding: '1rem 1.125rem', marginBottom: '1rem',
              border: '1px solid #e0f2fe',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 600 }}>
                ✅ Você recebe ({COMMISSION_PCT}%)
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#166534' }}>
                R$ {fmt(partnerReceives)}
              </span>
            </div>
            <div style={{ height: '1px', background: '#e0f2fe' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#0369a1' }}>
                🏢 Comissão Acalanto ({CALANTO_PCT}%)
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0369a1' }}>
                R$ {fmt(calaComission)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingLeft: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                · Balaio Digital (plataforma — {BALAIO_TOTAL_PCT}% do total)
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                R$ {fmt(balaioShare)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingLeft: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                · Acalanto líquido ({CALANTO_PCT - BALAIO_TOTAL_PCT}%)
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                R$ {fmt(calaNetShare)}
              </span>
            </div>
          </div>

          {/* Monthly projection */}
          <div>
            <label
              htmlFor="calc-qty"
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#0c4a6e', marginBottom: '0.375rem' }}
            >
              <span>Serviços vendidos/mês</span>
              <span style={{ color: '#0369a1' }}>{qty}</span>
            </label>
            <input
              id="calc-qty"
              type="range"
              min={1}
              max={30}
              value={qty}
              onChange={e => setQty(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0369a1', cursor: 'pointer' }}
            />
            <div
              style={{
                marginTop: '0.75rem', padding: '0.75rem 1rem',
                background: '#0369a1', borderRadius: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.8125rem', color: 'white' }}>
                Se vender {qty} {qty === 1 ? 'serviço' : 'serviços'}/mês →
              </span>
              <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'white' }}>
                R$ {fmt(monthlyPartner)}/mês
              </span>
            </div>
          </div>
        </>
      )}

      {raw === 0 && (
        <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: '0.5rem 0' }}>
          Digite um preço acima para ver a simulação
        </p>
      )}
    </div>
  )
}
