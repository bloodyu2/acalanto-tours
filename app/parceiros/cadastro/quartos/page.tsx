'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { WizardSteps } from '../_components/WizardSteps'

const HOSPEDAGEM_STEPS = ['Conta', 'Tipo', 'Dados', 'Anúncio', 'Quartos', 'Pronto']

const AMENITY_OPTIONS = [
  'Ar-condicionado', 'Wi-Fi', 'TV', 'Frigobar', 'Banheira',
  'Vista para o mar', 'Varanda', 'Cozinha', 'Piscina', 'Estacionamento',
]

type RoomDraft = {
  name: string
  description: string
  priceReais: string
  extraGuestReais: string
  maxGuests: string
  minNights: string
  amenities: string[]
}

const emptyRoom = (): RoomDraft => ({
  name: '', description: '', priceReais: '', extraGuestReais: '0',
  maxGuests: '2', minNights: '1', amenities: [],
})

export default function QuartosPage() {
  const router = useRouter()
  const [listingId, setListingId] = useState<string | null>(null)
  const [rooms, setRooms] = useState<RoomDraft[]>([])
  const [editing, setEditing] = useState<RoomDraft | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const pid = sessionStorage.getItem('onboarding_partner_id')
    const lid = sessionStorage.getItem('onboarding_listing_id')
    if (!pid) { router.push('/parceiros/cadastro'); return }
    setListingId(lid)
  }, [router])

  function toggleAmenity(room: RoomDraft, a: string): RoomDraft {
    return {
      ...room,
      amenities: room.amenities.includes(a)
        ? room.amenities.filter(x => x !== a)
        : [...room.amenities, a],
    }
  }

  function saveRoom() {
    if (!editing) return
    if (!editing.name || !editing.priceReais) { setError('Nome e preço são obrigatórios.'); return }
    setRooms(prev => [...prev, editing])
    setEditing(null)
    setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!listingId) { setError('ID do anúncio não encontrado. Volte e tente novamente.'); return }
    if (rooms.length === 0) { setError('Adicione ao menos um tipo de quarto.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const inserts = rooms.map((r, i) => ({
      listing_id:              listingId,
      name:                    r.name,
      description:             r.description || null,
      price_per_night_cents:   Math.round(parseFloat(r.priceReais.replace(',', '.')) * 100),
      price_extra_guest_cents: Math.round(parseFloat(r.extraGuestReais.replace(',', '.')) * 100),
      max_guests:              parseInt(r.maxGuests) || 2,
      min_nights:              parseInt(r.minNights) || 1,
      amenities:               r.amenities,
      display_order:           i,
    }))

    const { error: insertError } = await supabase
      .from('accommodation_rooms')
      .insert(inserts)

    if (insertError) {
      setError('Erro ao salvar quartos. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/parceiros/cadastro/aguardando')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    border: '1px solid var(--border)', borderRadius: '8px',
    fontSize: '0.9375rem', fontFamily: 'inherit',
    outline: 'none', background: 'white', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem',
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', padding: '5rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
            Acalanto Turismo
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <WizardSteps current={5} steps={HOSPEDAGEM_STEPS} />
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Tipos de quarto</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Adicione cada tipo de acomodação que você oferece com preço e capacidade.
          </p>

          {rooms.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {rooms.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sand)', borderRadius: '10px', padding: '0.875rem 1rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.15rem' }}>{r.name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      R${r.priceReais}/noite · máx {r.maxGuests} hóspedes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRooms(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.375rem' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {editing ? (
            <div style={{ border: '1.5px solid var(--ocean-mid)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', margin: 0 }}>Novo quarto</h3>
              <div>
                <label style={labelStyle}>Nome do quarto *</label>
                <input type="text" value={editing.name} onChange={e => setEditing(p => p && ({ ...p, name: e.target.value }))} placeholder="Ex: Quarto Standard" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Descrição</label>
                <textarea value={editing.description} onChange={e => setEditing(p => p && ({ ...p, description: e.target.value }))} rows={2} placeholder="Cama de casal, banheiro privativo..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Preço/noite R$ *</label>
                  <input type="number" step="0.01" min="0" value={editing.priceReais} onChange={e => setEditing(p => p && ({ ...p, priceReais: e.target.value }))} placeholder="280.00" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Extra/hóspede R$</label>
                  <input type="number" step="0.01" min="0" value={editing.extraGuestReais} onChange={e => setEditing(p => p && ({ ...p, extraGuestReais: e.target.value }))} placeholder="0" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Máx hóspedes</label>
                  <input type="number" min="1" value={editing.maxGuests} onChange={e => setEditing(p => p && ({ ...p, maxGuests: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Mín noites</label>
                  <input type="number" min="1" value={editing.minNights} onChange={e => setEditing(p => p && ({ ...p, minNights: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Comodidades</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.375rem' }}>
                  {AMENITY_OPTIONS.map(a => (
                    <button key={a} type="button" onClick={() => setEditing(p => p && toggleAmenity(p, a))}
                      style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', cursor: 'pointer',
                        border: `1.5px solid ${editing.amenities.includes(a) ? 'var(--ocean-mid)' : 'var(--border)'}`,
                        background: editing.amenities.includes(a) ? 'var(--ocean-mid)' : 'white',
                        color: editing.amenities.includes(a) ? 'white' : 'var(--text-primary)',
                      }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={saveRoom} className="btn-primary" style={{ flex: 1, padding: '0.875rem', fontSize: '0.9375rem' }}>
                  Salvar quarto
                </button>
                <button type="button" onClick={() => { setEditing(null); setError('') }} style={{ padding: '0.875rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(emptyRoom())}
              style={{ width: '100%', padding: '0.875rem', border: '1.5px dashed var(--border)', borderRadius: '10px', background: 'none', cursor: 'pointer', fontSize: '0.9375rem', color: 'var(--ocean-mid)', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Adicionar quarto
            </button>
          )}

          <form onSubmit={handleSubmit}>
            {error && !editing && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || rooms.length === 0}
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: (loading || rooms.length === 0) ? 0.6 : 1, cursor: (loading || rooms.length === 0) ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Enviando...' : `Continuar com ${rooms.length} quarto${rooms.length !== 1 ? 's' : ''}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
