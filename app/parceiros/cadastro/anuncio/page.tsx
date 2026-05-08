'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { WizardSteps } from '../_components/WizardSteps'

type ListingType = 'fotografia' | 'hospedagem' | 'jeep' | 'guia'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    + '-' + Math.random().toString(36).slice(2, 7)
}

export default function CadastroAnuncioPage() {
  const router = useRouter()
  const [type, setType] = useState<ListingType | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceLabel, setPriceLabel] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [especialidade, setEspecialidade] = useState('')
  const [hotelType, setHotelType] = useState('pousada')
  const [maxGuests, setMaxGuests] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [servicoTipo, setServicoTipo] = useState('')
  const [capacidade, setCapacidade] = useState('')
  const [lingua, setLingua] = useState('')

  useEffect(() => {
    const t = sessionStorage.getItem('onboarding_type') as ListingType | null
    const pid = sessionStorage.getItem('onboarding_partner_id')
    if (!t || !pid) { router.push('/parceiros/cadastro'); return }
    setType(t)
    setPartnerId(pid)
  }, [router])

  const amenityOptions = ['Piscina', 'Estacionamento', 'Café da manhã', 'Wi-Fi', 'Ar-condicionado', 'Pet-friendly', 'Academia', 'Churrasqueira']

  function toggleAmenity(a: string) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!type || !partnerId) return
    setLoading(true)
    setError('')

    const supabase = createClient()

    const metadata: Record<string, unknown> = { whatsapp }
    if (type === 'fotografia') { metadata.especialidade = especialidade; metadata.instagram = instagram }
    if (type === 'hospedagem') { metadata.hotel_type = hotelType; metadata.max_guests = maxGuests; metadata.amenities = amenities }
    if (type === 'jeep') { metadata.servico_tipo = servicoTipo; metadata.capacidade = capacidade }
    if (type === 'guia') { metadata.lingua = lingua; metadata.instagram = instagram }

    const { error: listingError } = await supabase
      .from('partner_listings')
      .insert({
        partner_id: partnerId,
        type,
        title,
        slug: slugify(title),
        description,
        price_label: priceLabel,
        metadata,
        status: 'pending',
      })

    if (listingError) {
      setError('Erro ao salvar anúncio. Tente novamente.')
      setLoading(false)
      return
    }

    if (type === 'hospedagem') {
      const { data: created } = await supabase
        .from('partner_listings')
        .select('id')
        .eq('partner_id', partnerId)
        .eq('type', 'hospedagem')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (created) sessionStorage.setItem('onboarding_listing_id', created.id)
      router.push('/parceiros/cadastro/quartos')
    } else {
      router.push('/parceiros/cadastro/aguardando')
    }
  }

  if (!type) return null

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.8125rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9375rem', fontFamily: 'inherit', outline: 'none', background: 'white', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }

  const typeLabels: Record<ListingType, string> = {
    fotografia: 'Fotógrafo',
    hospedagem: 'Hospedagem',
    jeep: 'Jeep / Transfer',
    guia: 'Guia de Turismo',
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
          <WizardSteps
            current={4}
            steps={type === 'hospedagem'
              ? ['Conta', 'Tipo', 'Dados', 'Anúncio', 'Quartos', 'Pronto']
              : undefined}
          />
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Seu anúncio</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Tipo: <strong>{typeLabels[type]}</strong>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={labelStyle}>Título do anúncio *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Pousada Canto do Mar" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Descrição *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} placeholder="Conte sobre seu serviço, localização, diferenciais..." style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}/>
            </div>
            <div>
              <label style={labelStyle}>Preço (texto livre)</label>
              <input type="text" value={priceLabel} onChange={e => setPriceLabel(e.target.value)} placeholder="Ex: A partir de R$150/pessoa" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>WhatsApp</label>
              <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="5524999XXXXXX" style={inputStyle}/>
            </div>

            {type === 'fotografia' && (
              <>
                <div>
                  <label style={labelStyle}>Especialidade</label>
                  <input type="text" value={especialidade} onChange={e => setEspecialidade(e.target.value)} placeholder="Ex: Fotografia de casamentos, retratos" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Instagram</label>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@seuperfil" style={inputStyle}/>
                </div>
              </>
            )}

            {type === 'hospedagem' && (
              <>
                <div>
                  <label style={labelStyle}>Tipo de hospedagem</label>
                  <select value={hotelType} onChange={e => setHotelType(e.target.value)} style={inputStyle}>
                    <option value="pousada">Pousada</option>
                    <option value="hotel">Hotel</option>
                    <option value="airbnb">Airbnb / Aluguel por temporada</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Máximo de hóspedes</label>
                  <input type="number" value={maxGuests} onChange={e => setMaxGuests(e.target.value)} placeholder="Ex: 10" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Comodidades</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.375rem' }}>
                    {amenityOptions.map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        style={{
                          padding: '0.375rem 0.875rem', borderRadius: '999px', fontSize: '0.8rem', cursor: 'pointer',
                          border: `1.5px solid ${amenities.includes(a) ? 'var(--ocean-mid)' : 'var(--border)'}`,
                          background: amenities.includes(a) ? 'var(--ocean-mid)' : 'white',
                          color: amenities.includes(a) ? 'white' : 'var(--text-primary)',
                        }}
                      >{a}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {type === 'jeep' && (
              <>
                <div>
                  <label style={labelStyle}>Tipo de serviço</label>
                  <input type="text" value={servicoTipo} onChange={e => setServicoTipo(e.target.value)} placeholder="Ex: Transfer, passeio de jeep" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Capacidade (pessoas)</label>
                  <input type="number" value={capacidade} onChange={e => setCapacidade(e.target.value)} placeholder="Ex: 8" style={inputStyle}/>
                </div>
              </>
            )}

            {type === 'guia' && (
              <>
                <div>
                  <label style={labelStyle}>Idiomas que fala</label>
                  <input type="text" value={lingua} onChange={e => setLingua(e.target.value)} placeholder="Ex: Português, Inglês, Espanhol" style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Instagram</label>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@seuperfil" style={inputStyle}/>
                </div>
              </>
            )}

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '8px', margin: 0 }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ padding: '1rem', fontSize: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Salvando...' : 'Enviar para análise'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
