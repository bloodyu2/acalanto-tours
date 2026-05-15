'use client'
import { useState } from 'react'
import PartnerCalculator from '@/app/parceiros/cadastro/_components/PartnerCalculator'
import type { Tier } from '@/app/parceiros/cadastro/_components/PartnerCalculator'

export default function CalculadoraPage() {
  const [tier, setTier] = useState<Tier>('tier2')
  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2rem)', maxWidth: '600px' }}>
      <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '1.5rem' }}>
        Calculadora de Comissão
      </h1>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
          Tipo de contrato
        </label>
        <select
          value={tier}
          onChange={e => setTier(e.target.value as Tier)}
          style={{ padding: '0.625rem 1rem', borderRadius: '0.625rem', border: '1px solid var(--border)', fontSize: '0.9375rem', background: 'white' }}
        >
          <option value="tier1">Tier 1 — Self-service (15%)</option>
          <option value="tier2">Tier 2 — Gerenciado (30%)</option>
          <option value="soberano">Soberano — Caso especial (40%)</option>
          <option value="transfer">Transfer — Consultar condições</option>
        </select>
      </div>
      <PartnerCalculator tier={tier} />
    </div>
  )
}
