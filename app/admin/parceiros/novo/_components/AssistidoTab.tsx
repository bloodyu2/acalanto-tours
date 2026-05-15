'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BUSINESS_TYPES = [
  { value: 'escuna', label: 'Escuna' },
  { value: 'pousada', label: 'Pousada' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'guia', label: 'Guia' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'outro', label: 'Outro' },
]

const PIX_KEY_TYPES = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'celular', label: 'Celular' },
  { value: 'aleatoria', label: 'Chave aleatória' },
]

const TIERS = [
  { value: 'tier1', label: 'Tier 1 (15%)' },
  { value: 'tier2', label: 'Tier 2 (30%)' },
]

interface FormData {
  fullName: string
  document: string
  email: string
  businessType: string
  tier: string
  pixKeyType: string
  pixKey: string
}

const INITIAL: FormData = {
  fullName: '',
  document: '',
  email: '',
  businessType: '',
  tier: 'tier1',
  pixKeyType: 'cpf',
  pixKey: '',
}

const segmentStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  height: '6px',
  borderRadius: '3px',
  background: active ? 'var(--ocean-mid, #1A6B8A)' : '#e2e8f0',
  transition: 'background 0.2s',
})

export function AssistidoTab() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const step1Valid = form.fullName.trim() !== '' && form.document.trim() !== '' && form.email.trim() !== '' && form.businessType !== ''

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/partners/assisted-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao cadastrar parceiro')
        setLoading(false)
        return
      }
      router.push('/admin/parceiros')
    } catch {
      setError('Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
        <div style={segmentStyle(step >= 1)} />
        <div style={segmentStyle(step >= 2)} />
        <div style={segmentStyle(step >= 3)} />
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--ocean-deep, #0A3D5C)' }}>
              Passo 1 — Dados do parceiro
            </h3>
            <div className="form-group">
              <label className="form-label">Nome completo / Razão social *</label>
              <input className="form-input" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="ex: João Silva / Escunas Paraty Ltda" />
            </div>
            <div className="form-group">
              <label className="form-label">CPF / CNPJ *</label>
              <input className="form-input" value={form.document} onChange={e => set('document', e.target.value)} placeholder="000.000.000-00 ou 00.000.000/0001-00" />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail de acesso *</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="parceiro@exemplo.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de negócio *</label>
              <select className="form-input" value={form.businessType} onChange={e => set('businessType', e.target.value)}>
                <option value="">Selecionar tipo…</option>
                {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tier *</label>
              <select className="form-input" value={form.tier} onChange={e => set('tier', e.target.value)}>
                {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <button
                className="btn-primary"
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                style={{ opacity: step1Valid ? 1 : 0.5 }}
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--ocean-deep, #0A3D5C)' }}>
              Passo 2 — Dados de recebimento
            </h3>
            <div className="form-group">
              <label className="form-label">Tipo de chave PIX *</label>
              <select className="form-input" value={form.pixKeyType} onChange={e => set('pixKeyType', e.target.value)}>
                {PIX_KEY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Chave PIX *</label>
              <input className="form-input" value={form.pixKey} onChange={e => set('pixKey', e.target.value)} placeholder="Digite a chave PIX" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-outline" onClick={() => setStep(1)}>← Voltar</button>
              <button
                className="btn-primary"
                onClick={() => setStep(3)}
                disabled={form.pixKey.trim() === ''}
                style={{ opacity: form.pixKey.trim() !== '' ? 1 : 0.5 }}
              >
                Próximo →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--ocean-deep, #0A3D5C)' }}>
              Passo 3 — Confirmação
            </h3>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Row label="Nome" value={form.fullName} />
              <Row label="Documento" value={form.document} />
              <Row label="E-mail" value={form.email} />
              <Row label="Tipo de negócio" value={BUSINESS_TYPES.find(t => t.value === form.businessType)?.label ?? form.businessType} />
              <Row label="Tier" value={TIERS.find(t => t.value === form.tier)?.label ?? form.tier} />
              <Row label="Tipo de chave PIX" value={PIX_KEY_TYPES.find(t => t.value === form.pixKeyType)?.label ?? form.pixKeyType} />
              <Row label="Chave PIX" value={form.pixKey} />
            </div>

            {error && (
              <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '0.75rem 1rem', color: '#c53030', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-outline" onClick={() => setStep(2)} disabled={loading}>← Voltar</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Cadastrando…' : 'Cadastrar parceiro'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <span style={{ color: '#64748b', minWidth: '140px' }}>{label}:</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}
