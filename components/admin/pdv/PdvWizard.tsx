'use client'
import { useState } from 'react'
import { formatCents } from '@/lib/booking/pricing'
import { BOAT_PHOTOGRAPHER_ADDON_CENTS } from '@/lib/constants'
import type { AdminRole } from '@/lib/admin-roles'
import type { EnabledVertical, Vertical } from '@/lib/pdv/role-permissions'
import StepVertical from './StepVertical'
import StepPayment from './StepPayment'
import StepDone from './StepDone'

export interface PdvBoat {
  id: string; name: string; slug: string; price_adult: number; price_child: number
}
export interface PdvPhotographer {
  id: string; name: string; slug: string; price_cents: number | null; cover_image: string | null
}
export interface PdvService {
  id: string; name: string; slug: string; price_cents: number | null
}

interface Props {
  verticals: EnabledVertical[]
  boats: PdvBoat[]
  photographers: PdvPhotographer[]
  services: PdvService[]
  sellerRole: AdminRole
}

type Step = 'vertical' | 'tour' | 'passengers' | 'customer' | 'payment' | 'done'

interface PdvResult {
  bookingId: string
  totalCents: number
  paymentUrl: string | null
  pixQrCode: string | null
  pixCopyPaste: string | null
  cardCheckoutUrl: string | null
  asaasChargeId: string | null
  asaasError: string | null
}

const cardStyle: React.CSSProperties = {
  background: 'white', borderRadius: '1rem', padding: '1.75rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)', maxWidth: '560px',
}
const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid var(--border)',
  borderRadius: '0.625rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--ocean-deep)', marginBottom: '0.375rem',
}

const tourStepLabel: Record<string, string> = {
  passeio: 'Passeio', fotografia: 'Pacote', servico: 'Serviço', hospedagem: 'Quarto',
}
const stepOrder: Step[] = ['tour', 'passengers', 'customer', 'payment']

export default function PdvWizard({ verticals, boats, photographers, services, sellerRole }: Props) {
  // Auto-skip vertical step if only one is enabled
  const initialStep: Step = verticals.length === 1 ? 'tour' : 'vertical'
  const [step, setStep] = useState<Step>(initialStep)
  const [vertical, setVertical] = useState<Vertical | null>(
    verticals.length === 1 ? verticals[0].vertical : null
  )

  const stepLabel: Record<Step, string> = {
    vertical: 'Categoria',
    tour: (vertical && tourStepLabel[vertical]) || 'Passeio',
    passengers: 'Pax',
    customer: 'Cliente',
    payment: 'Pagamento',
    done: 'OK',
  }

  const [boatId, setBoatId] = useState('')
  const [photographerId, setPhotographerId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [tourDate, setTourDate] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [photographerAddon, setPhotographerAddon] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerCpf, setCustomerCpf] = useState('')

  const [billingType, setBillingType] = useState<'PIX' | 'CREDIT_CARD'>('PIX')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PdvResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedBoat = boats.find(b => b.id === boatId)
  const selectedPhotographer = photographers.find(p => p.id === photographerId)
  const selectedService = services.find(s => s.id === serviceId)

  const totalCents = (() => {
    const addonCents = photographerAddon ? BOAT_PHOTOGRAPHER_ADDON_CENTS : 0
    if (vertical === 'passeio' && selectedBoat) {
      return adults * selectedBoat.price_adult +
        children * (selectedBoat.price_child || Math.round(selectedBoat.price_adult / 2)) +
        addonCents
    }
    if (vertical === 'fotografia' && selectedPhotographer) {
      return (selectedPhotographer.price_cents ?? 0) + addonCents
    }
    if (vertical === 'servico' && selectedService) {
      return (selectedService.price_cents ?? 0) * adults + addonCents
    }
    return 0
  })()

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/pdv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boat_id: boatId || undefined,
          photographer_id: photographerId || undefined,
          service_id: serviceId || undefined,
          tour_date: tourDate,
          adults,
          children,
          photographer_addon: photographerAddon,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || null,
          customer_cpf: customerCpf || null,
          billing_type: billingType,
          vertical: vertical || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))
      setResult(data as PdvResult)
      // Stay on 'payment' step — StepPayment will render once result is set
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setStep(initialStep); setVertical(verticals.length === 1 ? verticals[0].vertical : null)
    setBoatId(''); setPhotographerId(''); setServiceId(''); setTourDate(''); setAdults(1); setChildren(0)
    setPhotographerAddon(false); setCustomerName(''); setCustomerEmail('')
    setCustomerPhone(''); setCustomerCpf(''); setBillingType('PIX')
    setResult(null); setError(null)
  }

  const currentIdx = stepOrder.indexOf(step as Step)

  return (
    <div>
      {step !== 'done' && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.75rem', gap: 0 }}>
          {stepOrder.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: i <= currentIdx ? 'var(--ocean-mid)' : 'var(--border)',
                color: i <= currentIdx ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                {i < currentIdx ? '✓' : i + 1}
              </div>
              <span style={{
                marginLeft: '0.5rem', fontSize: '0.78rem',
                fontWeight: i === currentIdx ? 700 : 500,
                color: i === currentIdx ? 'var(--ocean-deep)' : 'var(--text-muted)',
              }}>
                {stepLabel[s]}
              </span>
              {i < stepOrder.length - 1 && (
                <div style={{
                  flex: 1, height: '2px', margin: '0 0.5rem',
                  background: i < currentIdx ? 'var(--ocean-mid)' : 'var(--border)',
                }} />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'vertical' && (
        <StepVertical
          verticals={verticals}
          onSelect={v => { setVertical(v); setStep('tour') }}
        />
      )}

      {step === 'tour' && vertical === 'passeio' && (
        <div style={cardStyle}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.2rem', color: 'var(--ocean-deep)', marginTop: 0, marginBottom: '1.25rem' }}>
            Selecione o passeio
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
            {boats.map(boat => (
              <button
                key={boat.id}
                type="button"
                onClick={() => setBoatId(boat.id)}
                style={{
                  padding: '0.875rem 1rem',
                  border: `2px solid ${boatId === boat.id ? 'var(--ocean-mid)' : 'var(--border)'}`,
                  borderRadius: '0.75rem',
                  background: boatId === boat.id ? 'rgba(26,107,138,0.06)' : 'white',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', margin: '0 0 0.2rem' }}>{boat.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  {formatCents(boat.price_adult)}/adulto · {formatCents(boat.price_child || Math.round(boat.price_adult / 2))}/criança
                </p>
              </button>
            ))}
            {boats.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhuma embarcação ativa cadastrada.</p>
            )}
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Data do passeio</label>
            <input
              type="date"
              value={tourDate}
              onChange={e => setTourDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={fieldStyle}
            />
          </div>
          <button
            type="button"
            onClick={() => setStep('passengers')}
            disabled={!boatId || !tourDate}
            className="btn-primary"
            style={{ justifyContent: 'center', width: '100%', opacity: !boatId || !tourDate ? 0.5 : 1 }}
          >
            Próximo →
          </button>
        </div>
      )}

      {step === 'tour' && vertical === 'fotografia' && (
        <div style={cardStyle}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.2rem', color: 'var(--ocean-deep)', marginTop: 0, marginBottom: '1.25rem' }}>
            Selecione o pacote fotográfico
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {photographers.map(pkg => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => { setPhotographerId(pkg.id); setStep('passengers') }}
                style={{
                  padding: '0.875rem 1rem',
                  border: `2px solid ${photographerId === pkg.id ? 'var(--ocean-mid)' : 'var(--border)'}`,
                  borderRadius: '0.75rem',
                  background: photographerId === pkg.id ? 'rgba(26,107,138,0.06)' : 'white',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', margin: '0 0 0.2rem' }}>{pkg.name}</p>
                {pkg.price_cents != null && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    {formatCents(pkg.price_cents)}
                  </p>
                )}
              </button>
            ))}
            {photographers.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhum pacote fotográfico cadastrado.</p>
            )}
          </div>
        </div>
      )}

      {step === 'tour' && vertical === 'servico' && (
        <div style={cardStyle}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.2rem', color: 'var(--ocean-deep)', marginTop: 0, marginBottom: '1.25rem' }}>
            Selecione o serviço
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {services.map(svc => (
              <button
                key={svc.id}
                type="button"
                onClick={() => { setServiceId(svc.id); setStep('passengers') }}
                style={{
                  padding: '0.875rem 1rem',
                  border: `2px solid ${serviceId === svc.id ? 'var(--ocean-mid)' : 'var(--border)'}`,
                  borderRadius: '0.75rem',
                  background: serviceId === svc.id ? 'rgba(26,107,138,0.06)' : 'white',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', margin: '0 0 0.2rem' }}>{svc.name}</p>
                {svc.price_cents != null && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    {formatCents(svc.price_cents)}/pessoa
                  </p>
                )}
              </button>
            ))}
            {services.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhum serviço ativo cadastrado.</p>
            )}
          </div>
        </div>
      )}

      {step === 'tour' && vertical === 'hospedagem' && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '2.5rem 1.75rem' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏨</p>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.2rem', color: 'var(--ocean-deep)', marginTop: 0, marginBottom: '0.5rem' }}>
            Hospedagem em breve
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Esta vertical está sendo integrada.
          </p>
        </div>
      )}

      {step === 'passengers' && (
        <div style={cardStyle}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.2rem', color: 'var(--ocean-deep)', marginTop: 0, marginBottom: '1.25rem' }}>
            Passageiros e add-ons
          </h2>
          {[
            { label: 'Adultos (13+ anos)', value: adults, set: setAdults, min: 1 },
            { label: 'Crianças', value: children, set: setChildren, min: 0 },
          ].map(({ label: l, value, set, min }) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--ocean-deep)', fontSize: '0.95rem' }}>{l}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <button
                  type="button"
                  onClick={() => set(v => Math.max(min, v - 1))}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '1.5px solid var(--border)', background: 'white',
                    cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem',
                  }}
                >
                  −
                </button>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', minWidth: '24px', textAlign: 'center' }}>
                  {value}
                </span>
                <button
                  type="button"
                  onClick={() => set(v => v + 1)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'var(--ocean-mid)', border: 'none', color: 'white',
                    cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ))}

          <div
            onClick={() => setPhotographerAddon(v => !v)}
            role="checkbox"
            aria-checked={photographerAddon}
            tabIndex={0}
            style={{
              padding: '0.875rem 1rem',
              border: `2px solid ${photographerAddon ? 'var(--ocean-mid)' : 'var(--border)'}`,
              borderRadius: '0.75rem', cursor: 'pointer', marginBottom: '1.25rem',
              background: photographerAddon ? 'rgba(26,107,138,0.06)' : 'white',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>📷 Fotógrafo a bordo</span>
              <span style={{ fontWeight: 700, color: 'var(--ocean-mid)' }}>
                + {formatCents(BOAT_PHOTOGRAPHER_ADDON_CENTS)}
              </span>
            </div>
          </div>

          <div style={{
            background: 'var(--sand, #fdf8f0)', borderRadius: '0.75rem', padding: '0.875rem 1rem',
            marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontWeight: 600, color: 'var(--ocean-deep)' }}>Total estimado</span>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--ocean-deep)' }}>
              {formatCents(totalCents)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button
              type="button"
              onClick={() => setStep('tour')}
              style={{
                flex: 1, padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '0.75rem',
                background: 'white', cursor: 'pointer', fontWeight: 600,
              }}
            >
              ← Voltar
            </button>
            <button
              type="button"
              onClick={() => setStep('customer')}
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center' }}
            >
              Próximo →
            </button>
          </div>
        </div>
      )}

      {step === 'customer' && (
        <div style={cardStyle}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.2rem', color: 'var(--ocean-deep)', marginTop: 0, marginBottom: '1.25rem' }}>
            Dados do cliente
          </h2>
          {[
            { l: 'Nome completo *', v: customerName, set: setCustomerName, type: 'text', placeholder: 'João Silva' },
            { l: 'E-mail *', v: customerEmail, set: setCustomerEmail, type: 'email', placeholder: 'joao@email.com' },
            { l: 'WhatsApp (opcional)', v: customerPhone, set: setCustomerPhone, type: 'tel', placeholder: '(24) 99999-9999' },
            { l: 'CPF (opcional — para nota fiscal)', v: customerCpf, set: setCustomerCpf, type: 'text', placeholder: '000.000.000-00' },
          ].map(({ l, v, set, type, placeholder }) => (
            <div key={l} style={{ marginBottom: '0.875rem' }}>
              <label style={labelStyle}>{l}</label>
              <input
                type={type}
                value={v}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                style={fieldStyle}
              />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setStep('passengers')}
              style={{
                flex: 1, padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '0.75rem',
                background: 'white', cursor: 'pointer', fontWeight: 600,
              }}
            >
              ← Voltar
            </button>
            <button
              type="button"
              onClick={() => setStep('payment')}
              disabled={!customerName || !customerEmail}
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center', opacity: !customerName || !customerEmail ? 0.5 : 1 }}
            >
              Próximo →
            </button>
          </div>
        </div>
      )}

      {step === 'payment' && !result && (
        <div style={cardStyle}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.2rem', color: 'var(--ocean-deep)', marginTop: 0, marginBottom: '1.25rem' }}>
            Pagamento
          </h2>

          {(() => {
            const productLabel =
              vertical === 'passeio' ? selectedBoat?.name :
              vertical === 'fotografia' ? selectedPhotographer?.name :
              vertical === 'servico' ? selectedService?.name :
              'Hospedagem'
            return (
              <div style={{ background: 'var(--sand, #fdf8f0)', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 600, margin: '0 0 0.25rem', color: 'var(--ocean-deep)' }}>
                  {productLabel} — {tourDate}
                </p>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {adults}A{children > 0 ? ` ${children}C` : ''}{photographerAddon ? ' · Fotógrafo' : ''}
                  {' · '}
                  {customerName}
                </p>
                <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--ocean-deep)', margin: 0 }}>
                  {formatCents(totalCents)}
                </p>
              </div>
            )
          })()}

          <p style={labelStyle}>Forma de pagamento</p>
          <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem' }}>
            {(['PIX', 'CREDIT_CARD'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setBillingType(type)}
                style={{
                  flex: 1, padding: '0.875rem',
                  border: `2px solid ${billingType === type ? 'var(--ocean-mid)' : 'var(--border)'}`,
                  borderRadius: '0.75rem',
                  background: billingType === type ? 'rgba(26,107,138,0.06)' : 'white',
                  cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s',
                }}
              >
                {type === 'PIX' ? '⚡ PIX' : '💳 Cartão'}
              </button>
            ))}
          </div>

          {billingType === 'CREDIT_CARD' && (
            <p style={{ background: '#fffaf0', border: '1px solid #fed7aa', borderRadius: '0.625rem', padding: '0.75rem', fontSize: '0.8rem', color: '#9c4221', marginBottom: '1rem' }}>
              Para cartão presencial, oriente o cliente a usar o link ASAAS que será aberto após criar o pedido (mais seguro que digitar o cartão aqui).
            </p>
          )}

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '1rem', color: '#9b2c2c', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button
              type="button"
              onClick={() => setStep('customer')}
              style={{
                flex: 1, padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '0.75rem',
                background: 'white', cursor: 'pointer', fontWeight: 600,
              }}
            >
              ← Voltar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Processando…' : `Cobrar ${formatCents(totalCents)}`}
            </button>
          </div>
        </div>
      )}

      {step === 'payment' && result && (
        <StepPayment
          bookingId={result.bookingId}
          totalCents={result.totalCents}
          pixQrCode={result.pixQrCode}
          pixCopyPaste={result.pixCopyPaste}
          cardCheckoutUrl={result.cardCheckoutUrl ?? null}
          onPaid={() => setStep('done')}
        />
      )}

      {step === 'done' && result && (
        <StepDone bookingId={result.bookingId} onNewSale={() => window.location.reload()} />
      )}
    </div>
  )
}
