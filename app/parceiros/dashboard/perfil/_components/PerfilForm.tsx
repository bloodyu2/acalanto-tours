'use client'
import { useState, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

type Partner = { id: string; name: string; email: string | null; phone: string | null; type: string }
type PartnerPage = { id: string; slug: string; headline: string | null; bio: string | null; instagram_url: string | null; whatsapp_number: string | null; cover_image: string | null } | null

type Props = { partner: Partner | null; partnerPage: PartnerPage }

export default function PerfilForm({ partner, partnerPage }: Props) {
  const [name, setName] = useState(partner?.name ?? '')
  const [phone, setPhone] = useState(partner?.phone ?? '')
  const [headline, setHeadline] = useState(partnerPage?.headline ?? '')
  const [bio, setBio] = useState(partnerPage?.bio ?? '')
  const [instagram, setInstagram] = useState(partnerPage?.instagram_url ?? '')
  const [whatsapp, setWhatsapp] = useState(partnerPage?.whatsapp_number ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()

    if (partner) {
      const { error: err } = await supabase
        .from('partners')
        .update({ name, phone: phone || null })
        .eq('id', partner.id)
      if (err) { setError(err.message); setSaving(false); return }
    }

    if (partnerPage) {
      const { error: err } = await supabase
        .from('partner_pages')
        .update({ headline: headline || null, bio: bio || null, instagram_url: instagram || null, whatsapp_number: whatsapp || null })
        .eq('id', partnerPage.id)
      if (err) { setError(err.message); setSaving(false); return }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle = {
    width: '100%', padding: '0.625rem 0.875rem', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '0.9375rem', background: 'white', outline: 'none',
    boxSizing: 'border-box' as const,
  }
  const labelStyle = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }
  const groupStyle = { marginBottom: '1.25rem' }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
      <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '1.25rem', marginTop: 0 }}>
        Dados básicos
      </h2>

      <div style={groupStyle}>
        <label style={labelStyle}>Nome / Razão social</label>
        <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div style={groupStyle}>
        <label style={labelStyle}>Telefone</label>
        <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="55 24 99999-9999" />
      </div>

      {partnerPage && (
        <>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: '1.25rem', marginTop: '1.75rem' }}>
            Página pública
          </h2>
          <div style={groupStyle}>
            <label style={labelStyle}>Título / Headline</label>
            <input style={inputStyle} value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Ex: Fotografia profissional de passeios em Paraty" />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>Bio / Apresentação</label>
            <textarea
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você ou seu negócio..."
            />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>Instagram URL</label>
            <input style={inputStyle} type="url" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/seu_perfil" />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>WhatsApp (número com DDI)</label>
            <input style={inputStyle} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5524999999999" />
          </div>
        </>
      )}

      {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}

      <button
        type="submit"
        disabled={saving}
        style={{
          background: saved ? '#16a34a' : 'var(--ocean-mid, #1A6B8A)',
          color: 'white', border: 'none', borderRadius: '8px',
          padding: '0.75rem 1.5rem', fontSize: '0.9375rem', fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          transition: 'background 0.2s',
        }}
      >
        {saved ? '✓ Salvo!' : saving ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </form>
  )
}
