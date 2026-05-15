'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PARTNER_TYPES = [
  { value: 'boat', label: 'Embarcação' },
  { value: 'photo', label: 'Fotografia' },
  { value: 'jeep', label: 'Jeep' },
  { value: 'guide', label: 'Guia Turístico' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'hotel', label: 'Hotel / Pousada' },
  { value: 'other', label: 'Outro' },
]

export function InviteTab() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const fd = new FormData(e.currentTarget)
    const body = {
      name: fd.get('name'),
      type: fd.get('type'),
      email: fd.get('email'),
      phone: fd.get('phone') || undefined,
      notes: fd.get('notes') || undefined,
      internal_rating: fd.get('internal_rating') ? Number(fd.get('internal_rating')) : undefined,
    }

    const res = await fetch('/api/admin/partners/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok && res.status !== 207) {
      setError(data.error ?? 'Erro ao criar parceiro')
      return
    }
    if (data.inviteError) {
      setSuccess(`Parceiro criado, mas o convite falhou: ${data.inviteError}`)
    } else {
      setSuccess(`Parceiro criado e convite enviado para ${body.email}!`)
      setTimeout(() => router.push('/admin/parceiros'), 2000)
    }
  }

  return (
    <>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Preencha os dados do negócio. O responsável receberá um e-mail de convite para criar sua senha e acessar o portal de parceiro.
      </p>

      {error && (
        <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '8px', padding: '0.75rem 1rem', color: '#c53030', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: '8px', padding: '0.75rem 1rem', color: '#276749', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="form-group">
          <label className="form-label">Nome do negócio *</label>
          <input className="form-input" name="name" required placeholder="ex: Fotografia Marina" />
        </div>
        <div className="form-group">
          <label className="form-label">Tipo *</label>
          <select className="form-input" name="type" required>
            <option value="">Selecionar tipo…</option>
            {PARTNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">E-mail do responsável * (receberá o convite)</label>
          <input className="form-input" name="email" type="email" required placeholder="responsavel@exemplo.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input className="form-input" name="phone" type="tel" placeholder="(24) 99999-0000" />
        </div>
        <div className="form-group">
          <label className="form-label">Avaliação interna (0–5)</label>
          <input className="form-input" name="internal_rating" type="number" min="0" max="5" step="0.1" placeholder="4.5" />
        </div>
        <div className="form-group">
          <label className="form-label">Notas internas</label>
          <textarea className="form-input" name="notes" rows={3} style={{ resize: 'vertical' }} placeholder="Observações internas sobre este parceiro…" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Cadastrando…' : 'Cadastrar e Enviar Convite'}
          </button>
          <Link href="/admin/parceiros" className="btn-outline" style={{ textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </>
  )
}
