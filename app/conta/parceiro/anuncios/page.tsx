'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Listing = {
  id: string
  title: string
  type: string
  status: string
  rejection_reason: string | null
  price_label: string | null
  description: string | null
  cover_image: string | null
  active: boolean
}

type Partner = {
  id: string
  name: string
  status: string
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Em análise', color: '#854d0e', bg: '#fef9c3' },
  approved: { label: 'Aprovado', color: '#166534', bg: '#dcfce7' },
  rejected: { label: 'Rejeitado', color: '#991b1b', bg: '#fef2f2' },
}

const TYPE_LABELS: Record<string, string> = {
  escuna: 'Escuna',
  lancha: 'Lancha',
  passeio: 'Passeio',
  foto: 'Fotografia',
  jeep: 'Jeep',
  outro: 'Outro',
}

export default function MeusAnunciosPage() {
  const supabase = createClient()
  const router = useRouter()

  const [partner, setPartner] = useState<Partner | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Listing>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/conta/login'); return }

      const { data: partnerRow } = await supabase
        .from('partners')
        .select('id, name, status')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (!partnerRow) { setNotFound(true); setLoading(false); return }
      setPartner(partnerRow)

      const { data: rows } = await supabase
        .from('partner_listings')
        .select('id, title, type, status, rejection_reason, price_label, description, cover_image, active')
        .eq('partner_id', partnerRow.id)
        .order('created_at', { ascending: false })

      setListings(rows ?? [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(listing: Listing) {
    setEditingId(listing.id)
    setEditForm({
      title: listing.title,
      type: listing.type,
      price_label: listing.price_label ?? '',
      description: listing.description ?? '',
      cover_image: listing.cover_image ?? '',
    })
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
    setError(null)
  }

  async function saveEdit(listingId: string) {
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('partner_listings')
      .update({
        title: editForm.title,
        type: editForm.type,
        price_label: editForm.price_label || null,
        description: editForm.description || null,
        cover_image: editForm.cover_image || null,
        status: 'pending', // revert to pending on edit
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)

    if (err) {
      setError('Erro ao salvar. Tente novamente.')
      setSaving(false)
      return
    }

    // Refresh listings
    const { data: rows } = await supabase
      .from('partner_listings')
      .select('id, title, type, status, rejection_reason, price_label, description, cover_image, active')
      .eq('partner_id', partner!.id)
      .order('created_at', { ascending: false })

    setListings(rows ?? [])
    setEditingId(null)
    setEditForm({})
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--sand)', padding: '2rem 0' }}>
        <div className="container" style={{ maxWidth: '640px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Cadastro de parceiro não encontrado.</p>
          <Link href="/parceiros/cadastro" style={{ color: 'var(--ocean-mid)', fontWeight: 600 }}>
            Completar cadastro
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sand)', padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Link
              href="/conta/parceiro"
              style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}
            >
              ← Painel do Parceiro
            </Link>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.875rem', color: 'var(--ocean-deep)', margin: 0 }}>
              Meus Anúncios
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {partner?.name}
            </p>
          </div>
          <Link
            href="/parceiros/cadastro/anuncio"
            style={{ background: 'var(--ocean-deep)', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            + Novo Anúncio
          </Link>
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '1.25rem', padding: '3rem 1.5rem', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Você ainda não tem anúncios cadastrados.</p>
            <Link
              href="/parceiros/cadastro/anuncio"
              style={{ background: 'var(--ocean-deep)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.625rem', textDecoration: 'none', fontWeight: 600 }}
            >
              Criar primeiro anúncio
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {listings.map(listing => {
              const statusInfo = STATUS_LABELS[listing.status] ?? STATUS_LABELS.pending
              const isEditing = editingId === listing.id

              return (
                <div
                  key={listing.id}
                  style={{ background: 'white', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                >
                  {/* Listing header row */}
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--ocean-deep)', margin: 0 }}>
                          {listing.title}
                        </h2>
                        <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '999px', padding: '0.2rem 0.65rem', fontWeight: 600 }}>
                          {TYPE_LABELS[listing.type] ?? listing.type}
                        </span>
                        <span style={{ fontSize: '0.75rem', background: statusInfo.bg, color: statusInfo.color, borderRadius: '999px', padding: '0.2rem 0.65rem', fontWeight: 600 }}>
                          {statusInfo.label}
                        </span>
                      </div>
                      {listing.price_label && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
                          {listing.price_label}
                        </p>
                      )}
                      {listing.status === 'rejected' && listing.rejection_reason && (
                        <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          Motivo: {listing.rejection_reason}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(listing)}
                          style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--ocean-deep)', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {isEditing && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '1.5rem', background: '#f9fafb' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '1rem', marginTop: 0 }}>
                        Editar anúncio
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                            Título *
                          </label>
                          <input
                            type="text"
                            value={editForm.title ?? ''}
                            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                            style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                            Tipo *
                          </label>
                          <select
                            value={editForm.type ?? ''}
                            onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                            style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.9rem', background: 'white', boxSizing: 'border-box' }}
                          >
                            {Object.entries(TYPE_LABELS).map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                            Preço / Valor
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: R$ 110 por pessoa"
                            value={editForm.price_label ?? ''}
                            onChange={e => setEditForm(f => ({ ...f, price_label: e.target.value }))}
                            style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                            URL da imagem de capa
                          </label>
                          <input
                            type="url"
                            placeholder="https://..."
                            value={editForm.cover_image ?? ''}
                            onChange={e => setEditForm(f => ({ ...f, cover_image: e.target.value }))}
                            style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.9rem', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                          Descrição
                        </label>
                        <textarea
                          rows={4}
                          value={editForm.description ?? ''}
                          onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                          style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '0.5rem', padding: '0.6rem 0.75rem', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                      </div>
                      {error && (
                        <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>
                      )}
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                        Ao salvar, o anúncio voltará para análise antes de ser publicado novamente.
                      </p>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          onClick={() => saveEdit(listing.id)}
                          disabled={saving || !editForm.title}
                          style={{ background: 'var(--ocean-deep)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.65rem 1.25rem', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.9rem', opacity: saving ? 0.7 : 1 }}
                        >
                          {saving ? 'Salvando...' : 'Salvar alterações'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-muted)', borderRadius: '0.5rem', padding: '0.65rem 1.25rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
