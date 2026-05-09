'use client'
import { useEffect, useState, useCallback } from 'react'
import type { CartItem } from '@/components/cart/CartProvider'

// ─── helpers ────────────────────────────────────────────────────────────────

function formatBRL(cents: number) {
  if (!cents || isNaN(cents)) return 'R$ 0,00'
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string) {
  if (!iso) return ''
  try {
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  } catch {
    return iso
  }
}

function itemTotal(item: CartItem): number {
  if (item.type === 'hospedagem') return ((item.pricePerNightCents ?? 0) * (item.nights ?? 1))
  if (item.type === 'servico' && item.pricingType === 'per_group') return item.priceAdultCents ?? 0
  return (item.priceAdultCents ?? 0) * (item.adults ?? 0) + (item.priceChildCents ?? 0) * (item.children ?? 0)
}

function itemDetails(item: CartItem): string {
  if (item.type === 'hospedagem') {
    return `${item.nights} noite${item.nights !== 1 ? 's' : ''} · ${item.guests} hóspede${(item.guests ?? 1) !== 1 ? 's' : ''} · ${formatDate(item.checkIn ?? item.date)} → ${formatDate(item.checkOut ?? '')}`
  }
  if (item.type === 'servico' && item.pricingType === 'per_group') {
    return `Grupo de ${item.groupSize ?? item.adults} pessoas · ${formatDate(item.date)}`
  }
  return `${item.adults} adulto${item.adults !== 1 ? 's' : ''}${item.children > 0 ? ` · ${item.children} criança${item.children !== 1 ? 's' : ''}` : ''} · ${formatDate(item.date)}`
}

// ─── CPF validation ──────────────────────────────────────────────────────────

function isValidCpf(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(clean[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(clean[10])
}

function formatCpf(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function formatCardNumber(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 16)
  return d.replace(/(.{4})/g, '$1 ').trim()
}

function formatCardExpiry(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 4)
  if (d.length <= 2) return d
  return `${d.slice(0, 2)}/${d.slice(2)}`
}

// ─── types ───────────────────────────────────────────────────────────────────

type BillingType = 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'DEBIT_CARD'

interface FormState {
  name: string
  email: string
  phone: string
  cpf: string
  billingType: BillingType
  terms: boolean
  // card fields (only used when billingType === 'CREDIT_CARD')
  cardNumber: string
  cardHolder: string
  cardExpiry: string
  cardCvv: string
  cardPostalCode: string
  cardAddressNumber: string
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  cpf?: string
  terms?: string
  cardNumber?: string
  cardHolder?: string
  cardExpiry?: string
  cardCvv?: string
  cardPostalCode?: string
  cardAddressNumber?: string
}

interface CheckoutResult {
  billingType: BillingType
  bookingId: string
  paymentUrl: string | null
  pixQrCode: string | null
  pixCopyPaste: string | null
  totalCents: number
  customerName: string
}

// ─── payment method options ──────────────────────────────────────────────────

const PAYMENT_METHODS: { value: BillingType; label: string; subtitle: string; color: string; bg: string; border: string }[] = [
  {
    value: 'PIX',
    label: 'PIX',
    subtitle: 'Confirmação instantânea',
    color: '#166534',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    value: 'CREDIT_CARD',
    label: 'Cartão de crédito',
    subtitle: 'Confirmado em minutos',
    color: '#1e40af',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    value: 'BOLETO',
    label: 'Boleto bancário',
    subtitle: 'Até 3 dias úteis',
    color: '#854d0e',
    bg: '#fefce8',
    border: '#fef08a',
  },
  {
    value: 'DEBIT_CARD',
    label: 'Débito online',
    subtitle: 'Confirmado em minutos',
    color: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
  },
]

// ─── PixCopyButton ────────────────────────────────────────────────────────────

function PixCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button
      onClick={copy}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        width: '100%', padding: '0.75rem 1rem',
        background: copied ? '#dcfce7' : '#f0fdf4',
        border: `1.5px solid ${copied ? '#86efac' : '#bbf7d0'}`,
        borderRadius: '0.625rem', cursor: 'pointer',
        fontSize: '0.8125rem', fontFamily: 'monospace',
        color: '#166534', wordBreak: 'break-all', textAlign: 'left',
        transition: 'background 0.15s',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        {copied
          ? <><polyline points="20 6 9 17 4 12"/></>
          : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>
        }
      </svg>
      {copied ? 'Copiado!' : text.slice(0, 60) + (text.length > 60 ? '…' : '')}
    </button>
  )
}

// ─── PaymentConfirmation ──────────────────────────────────────────────────────

function PaymentConfirmation({ result }: { result: CheckoutResult }) {
  const isPix = result.billingType === 'PIX'
  const isBoleto = result.billingType === 'BOLETO'
  const isCard = result.billingType === 'CREDIT_CARD' || result.billingType === 'DEBIT_CARD'

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) 1.25rem' }}>
      {/* Success header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.5rem' }}>
          Reserva confirmada!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
          {isPix && 'Escaneie o QR Code ou copie o código PIX para efetuar o pagamento.'}
          {isBoleto && 'Seu boleto foi gerado. Pague até a data de vencimento para confirmar sua reserva.'}
          {isCard && 'Pagamento processado. Em breve você receberá a confirmação por e-mail.'}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Pedido <strong style={{ color: 'var(--ocean-deep)' }}>#{result.bookingId.slice(0, 8).toUpperCase()}</strong>
        </p>
      </div>

      {/* PIX block */}
      {isPix && (
        <div style={{
          background: 'white', border: '1px solid var(--border)', borderRadius: '1rem',
          padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '1.25rem' }}>
            Pagar com PIX — {formatBRL(result.totalCents)}
          </p>

          {result.pixQrCode ? (
            <>
              <img
                src={`data:image/png;base64,${result.pixQrCode}`}
                alt="QR Code PIX"
                style={{ width: '200px', height: '200px', margin: '0 auto 1.25rem', display: 'block', borderRadius: '8px' }}
              />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Ou copie o código abaixo:
              </p>
              {result.pixCopyPaste && <PixCopyButton text={result.pixCopyPaste} />}
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Use o código copia e cola:
              </p>
              {result.pixCopyPaste
                ? <PixCopyButton text={result.pixCopyPaste} />
                : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    O código PIX será enviado por e-mail em instantes.
                  </p>
                )
              }
            </>
          )}

          <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: '#f0fdf4', borderRadius: '0.625rem', border: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: '0.8125rem', color: '#166534', margin: 0 }}>
              ✓ O pagamento PIX é confirmado automaticamente em segundos
            </p>
          </div>
        </div>
      )}

      {/* Boleto block */}
      {isBoleto && result.paymentUrl && (
        <div style={{
          background: 'white', border: '1px solid var(--border)', borderRadius: '1rem',
          padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '1rem' }}>
            Boleto bancário — {formatBRL(result.totalCents)}
          </p>
          <a
            href={result.paymentUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 2rem', background: '#854d0e', color: 'white',
              borderRadius: '0.875rem', fontWeight: 700, textDecoration: 'none',
              fontSize: '0.9375rem',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Abrir boleto
          </a>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            Pague em qualquer banco, lotérica ou app bancário até a data de vencimento.
          </p>
        </div>
      )}

      {/* Card block */}
      {isCard && result.paymentUrl && (
        <div style={{
          background: 'white', border: '1px solid var(--border)', borderRadius: '1rem',
          padding: '1.5rem', marginBottom: '1.25rem', textAlign: 'center',
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--ocean-deep)', marginBottom: '0.5rem' }}>
            Pagamento aprovado
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {formatBRL(result.totalCents)} debitado do cartão. Confirmação enviada por e-mail.
          </p>
        </div>
      )}

      {/* Next steps */}
      <div style={{
        background: 'var(--sand)', border: '1px solid var(--border)', borderRadius: '1rem',
        padding: '1.25rem', marginBottom: '1.25rem',
      }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ocean-deep)', marginBottom: '0.875rem' }}>
          Próximos passos
        </p>
        {[
          isPix ? 'Efetue o pagamento via PIX acima' : isBoleto ? 'Pague o boleto até o vencimento' : 'Guarde o comprovante do cartão',
          'Você receberá um e-mail de confirmação da Acalanto Turismo',
          'Nossa equipe pode entrar em contato para detalhes da experiência',
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: i < 2 ? '0.625rem' : 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--ocean-mid)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>
              {i + 1}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>{step}</p>
          </div>
        ))}
      </div>

      {/* CTA back */}
      <a
        href="/passeios"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          padding: '0.875rem', background: 'var(--ocean-deep)', color: 'white',
          borderRadius: '0.875rem', fontWeight: 700, textDecoration: 'none', fontSize: '0.9375rem',
          textAlign: 'center',
        }}
      >
        Ver mais passeios
      </a>
    </div>
  )
}

// ─── component ───────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [result, setResult] = useState<CheckoutResult | null>(null)

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    billingType: 'PIX',
    terms: false,
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardCvv: '',
    cardPostalCode: '',
    cardAddressNumber: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [cpfTouched, setCpfTouched] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('acalanto_cart')
      if (raw) setItems(JSON.parse(raw) as CartItem[])
    } catch {
      setItems([])
    }
    setHydrated(true)
  }, [])

  const totalCents = items.reduce((sum, item) => sum + itemTotal(item), 0)

  // ── field handlers ──────────────────────────────────────────────────────────

  const handleCpf = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, cpf: formatCpf(e.target.value) }))
    if (errors.cpf) setErrors(prev => ({ ...prev, cpf: undefined }))
  }, [errors.cpf])

  const handlePhone = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }))
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }))
  }, [errors.phone])

  const handleField = useCallback((field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }, [errors])

  const handleCardNumber = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))
    if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: undefined }))
  }, [errors.cardNumber])

  const handleCardExpiry = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, cardExpiry: formatCardExpiry(e.target.value) }))
    if (errors.cardExpiry) setErrors(prev => ({ ...prev, cardExpiry: undefined }))
  }, [errors.cardExpiry])

  // ── validation ──────────────────────────────────────────────────────────────

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.name.trim()) e.name = 'Nome é obrigatório'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) e.phone = 'Telefone inválido'
    if (!form.cpf.trim()) {
      e.cpf = 'CPF é obrigatório'
    } else if (!isValidCpf(form.cpf)) {
      e.cpf = 'CPF inválido'
    }
    if (!form.terms) e.terms = 'Você precisa aceitar os termos para continuar'

    if (form.billingType === 'CREDIT_CARD') {
      const cardDigits = form.cardNumber.replace(/\s/g, '')
      if (cardDigits.length < 13) e.cardNumber = 'Número de cartão inválido'
      if (!form.cardHolder.trim()) e.cardHolder = 'Nome no cartão é obrigatório'
      const expiryParts = form.cardExpiry.split('/')
      if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
        e.cardExpiry = 'Validade inválida (MM/AA)'
      }
      if (form.cardCvv.replace(/\D/g, '').length < 3) e.cardCvv = 'CVV inválido'
      const cepDigits = form.cardPostalCode.replace(/\D/g, '')
      if (cepDigits.length !== 8) e.cardPostalCode = 'CEP inválido'
      if (!form.cardAddressNumber.trim()) e.cardAddressNumber = 'Número é obrigatório'
    }

    return e
  }

  // ── submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setCpfTouched(true)
      return
    }
    setSubmitting(true)
    setApiError(null)
    try {
      const body: Record<string, unknown> = {
        items,
        billingType: form.billingType,
        customer: {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.replace(/\D/g, ''),
          cpf: form.cpf.replace(/\D/g, ''),
        },
      }

      if (form.billingType === 'CREDIT_CARD') {
        const [month, year] = form.cardExpiry.split('/')
        body.creditCard = {
          holderName: form.cardHolder.trim(),
          number: form.cardNumber.replace(/\s/g, ''),
          expiryMonth: month,
          expiryYear: `20${year}`,
          ccv: form.cardCvv.replace(/\D/g, ''),
        }
        body.creditCardHolderInfo = {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          cpfCnpj: form.cpf.replace(/\D/g, ''),
          phone: form.phone.replace(/\D/g, ''),
          postalCode: form.cardPostalCode.replace(/\D/g, ''),
          addressNumber: form.cardAddressNumber.trim(),
        }
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data?.error ?? 'Erro ao processar pagamento. Tente novamente.')
        return
      }
      localStorage.removeItem('acalanto_cart')
      setResult({
        billingType: form.billingType,
        bookingId: data.bookingId ?? '',
        paymentUrl: data.paymentUrl ?? null,
        pixQrCode: data.pixQrCode ?? null,
        pixCopyPaste: data.pixCopyPaste ?? null,
        totalCents,
        customerName: form.name.trim(),
      })
    } catch {
      setApiError('Erro de conexão. Por favor, tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── cpf live validation indicator ──────────────────────────────────────────

  const cpfDigits = form.cpf.replace(/\D/g, '')
  const cpfComplete = cpfDigits.length === 11
  const cpfValid = cpfComplete && isValidCpf(form.cpf)
  const cpfError = errors.cpf || (cpfTouched && cpfComplete && !cpfValid ? 'CPF inválido' : undefined)

  const isCard = form.billingType === 'CREDIT_CARD'

  // ── result screen ───────────────────────────────────────────────────────────

  if (result) {
    return (
      <>
        <section style={{ background: 'var(--ocean-deep)', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-jakarta)', marginBottom: '0.5rem' }}>
              Pagamento
            </p>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: 'white', margin: 0 }}>
              Confirmação de Reserva
            </h1>
          </div>
        </section>
        <PaymentConfirmation result={result} />
      </>
    )
  }

  // ── empty cart state ────────────────────────────────────────────────────────

  if (hydrated && items.length === 0) {
    return (
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--ocean-deep)' }}>
            Seu carrinho está vazio
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Adicione um passeio ou serviço antes de finalizar a compra.
          </p>
          <a
            href="/passeios"
            style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              background: 'var(--ocean-deep)',
              color: 'white',
              borderRadius: '0.875rem',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '0.9375rem',
            }}
          >
            Ver passeios
          </a>
        </div>
      </main>
    )
  }

  if (!hydrated) {
    return (
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Carregando...</div>
      </main>
    )
  }

  // ── main render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Page header */}
      <section style={{
        background: 'var(--ocean-deep)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-jakarta)', marginBottom: '0.5rem' }}>
            Finalizar compra
          </p>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: 'white', margin: 0 }}>
            Confirmação de Reserva
          </h1>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ background: '#f8f9fa', borderBottom: '1px solid var(--border)', padding: '0.75rem 1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <a href="/" style={{ color: 'var(--ocean-mid)', textDecoration: 'none' }}>Início</a>
          <span>›</span>
          <a href="/passeios" style={{ color: 'var(--ocean-mid)', textDecoration: 'none' }}>Passeios</a>
          <span>›</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Checkout</span>
        </div>
      </div>

      {/* Main layout */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) 1.25rem' }}>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '2rem',
          }}
          className="checkout-grid"
          >

            {/* ── LEFT: Form ─────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Payment methods */}
              <div style={cardStyle}>
                <SectionTitle>Forma de Pagamento</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {PAYMENT_METHODS.map(method => {
                    const selected = form.billingType === method.value
                    return (
                      <label
                        key={method.value}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.625rem',
                          padding: '0.875rem',
                          borderRadius: '0.75rem',
                          border: `2px solid ${selected ? method.border : 'var(--border)'}`,
                          background: selected ? method.bg : 'white',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                      >
                        <input
                          type="radio"
                          name="billingType"
                          value={method.value}
                          checked={selected}
                          onChange={() => setForm(prev => ({ ...prev, billingType: method.value }))}
                          style={{ marginTop: '2px', accentColor: method.color, flexShrink: 0 }}
                        />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: selected ? method.color : 'var(--text-primary)', margin: 0 }}>
                            {method.label}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: selected ? method.color : 'var(--text-muted)', margin: 0, marginTop: '1px' }}>
                            {method.subtitle}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Credit card fields */}
              {isCard && (
                <div style={cardStyle}>
                  <SectionTitle>Dados do Cartão</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <FieldGroup label="Número do cartão *" error={errors.cardNumber}>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={form.cardNumber}
                        onChange={handleCardNumber}
                        style={inputStyle(!!errors.cardNumber)}
                        inputMode="numeric"
                        maxLength={19}
                        autoComplete="cc-number"
                      />
                    </FieldGroup>
                    <FieldGroup label="Nome no cartão *" error={errors.cardHolder}>
                      <input
                        type="text"
                        placeholder="Como aparece no cartão"
                        value={form.cardHolder}
                        onChange={handleField('cardHolder')}
                        style={inputStyle(!!errors.cardHolder)}
                        autoComplete="cc-name"
                      />
                    </FieldGroup>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <FieldGroup label="Validade *" error={errors.cardExpiry}>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={form.cardExpiry}
                          onChange={handleCardExpiry}
                          style={inputStyle(!!errors.cardExpiry)}
                          inputMode="numeric"
                          maxLength={5}
                          autoComplete="cc-exp"
                        />
                      </FieldGroup>
                      <FieldGroup label="CVV *" error={errors.cardCvv}>
                        <input
                          type="text"
                          placeholder="123"
                          value={form.cardCvv}
                          onChange={(e) => {
                            setForm(prev => ({ ...prev, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))
                            if (errors.cardCvv) setErrors(prev => ({ ...prev, cardCvv: undefined }))
                          }}
                          style={inputStyle(!!errors.cardCvv)}
                          inputMode="numeric"
                          maxLength={4}
                          autoComplete="cc-csc"
                        />
                      </FieldGroup>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <FieldGroup label="CEP de cobrança *" error={errors.cardPostalCode}>
                        <input
                          type="text"
                          placeholder="00000-000"
                          value={form.cardPostalCode}
                          onChange={(e) => {
                            const d = e.target.value.replace(/\D/g, '').slice(0, 8)
                            const fmt = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
                            setForm(prev => ({ ...prev, cardPostalCode: fmt }))
                            if (errors.cardPostalCode) setErrors(prev => ({ ...prev, cardPostalCode: undefined }))
                          }}
                          style={inputStyle(!!errors.cardPostalCode)}
                          inputMode="numeric"
                          maxLength={9}
                          autoComplete="postal-code"
                        />
                      </FieldGroup>
                      <FieldGroup label="Número *" error={errors.cardAddressNumber}>
                        <input
                          type="text"
                          placeholder="Nº da residência"
                          value={form.cardAddressNumber}
                          onChange={handleField('cardAddressNumber')}
                          style={inputStyle(!!errors.cardAddressNumber)}
                          autoComplete="address-line2"
                        />
                      </FieldGroup>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer info */}
              <div style={cardStyle}>
                <SectionTitle>Seus Dados</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  <FieldGroup label="Nome completo *" error={errors.name}>
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      value={form.name}
                      onChange={handleField('name')}
                      style={inputStyle(!!errors.name)}
                      autoComplete="name"
                    />
                  </FieldGroup>

                  <FieldGroup label="E-mail *" error={errors.email}>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={form.email}
                      onChange={handleField('email')}
                      style={inputStyle(!!errors.email)}
                      autoComplete="email"
                    />
                  </FieldGroup>

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '0.75rem' }}
                    className="phone-cpf-row">
                    <FieldGroup label="Telefone *" error={errors.phone}>
                      <input
                        type="tel"
                        placeholder="(XX) XXXXX-XXXX"
                        value={form.phone}
                        onChange={handlePhone}
                        style={inputStyle(!!errors.phone)}
                        autoComplete="tel"
                        inputMode="numeric"
                      />
                    </FieldGroup>

                    <FieldGroup
                      label="CPF *"
                      error={cpfError}
                      hint={cpfComplete && cpfValid ? '✓ CPF válido' : undefined}
                      hintColor={cpfComplete && cpfValid ? '#166534' : undefined}
                    >
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        value={form.cpf}
                        onChange={handleCpf}
                        onBlur={() => setCpfTouched(true)}
                        style={{
                          ...inputStyle(!!cpfError),
                          borderColor: cpfComplete && cpfValid && !cpfError ? '#bbf7d0' : undefined,
                        }}
                        inputMode="numeric"
                        maxLength={14}
                        autoComplete="off"
                      />
                    </FieldGroup>
                  </div>

                </div>
              </div>

              {/* Terms */}
              <div style={{ ...cardStyle, background: errors.terms ? '#fff5f5' : 'white', border: `1px solid ${errors.terms ? '#fecaca' : 'var(--border)'}` }}>
                <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={handleField('terms')}
                    style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0, accentColor: 'var(--ocean-deep)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                    Aceito os{' '}
                    <a href="/termos" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ocean-mid)', textDecoration: 'underline' }}>
                      Termos de Serviço
                    </a>
                    {' '}e a{' '}
                    <a href="/cancelamento" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ocean-mid)', textDecoration: 'underline' }}>
                      Política de Cancelamento
                    </a>
                  </span>
                </label>
                {errors.terms && (
                  <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.625rem', marginLeft: '1.75rem' }}>
                    {errors.terms}
                  </p>
                )}
              </div>

              {/* API error */}
              {apiError && (
                <div style={{
                  padding: '1rem 1.25rem',
                  background: '#fff5f5',
                  border: '1px solid #fecaca',
                  borderRadius: '0.75rem',
                  color: '#dc2626',
                  fontSize: '0.9rem',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    {apiError}
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.625rem',
                  width: '100%',
                  padding: '1rem 2rem',
                  background: submitting ? '#6b8ca4' : 'var(--ocean-deep)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.875rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-jakarta)',
                  letterSpacing: '0.04em',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s, transform 0.1s',
                }}
              >
                {submitting ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: '1rem' }}>⟳</span>
                    Processando...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    {' '}CONFIRMAR RESERVA
                  </>
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-0.5rem' }}>
                Pagamento seguro via ASAAS · Seus dados estão protegidos pela LGPD
              </p>
            </div>

            {/* ── RIGHT: Order Summary ────────────────────────────────────────── */}
            <aside>
              <div style={{ position: 'sticky', top: '1.5rem' }}>
                <div style={cardStyle}>
                  <SectionTitle>Resumo do Pedido</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
                    {items.map(item => {
                      const total = itemTotal(item)
                      return (
                        <div key={item.id} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, var(--ocean-deep), var(--ocean-mid))',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {item.type === 'passeio' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1"/><path d="M4 18l-2-5h20l-2 5"/><path d="M12 2v3"/><path d="M3 13l3-8 6 2 6-2 3 8"/></svg>
                            ) : item.type === 'fotografia' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                            ) : item.type === 'hospedagem' ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.125rem', lineHeight: '1.3' }}>
                              {item.name}
                            </p>
                            <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                              {itemDetails(item)}
                            </p>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem', flexShrink: 0, whiteSpace: 'nowrap', color: 'var(--ocean-deep)' }}>
                            {formatBRL(total)}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Subtotal</span>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{formatBRL(totalCents)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Taxa de serviço</span>
                      <span style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 500 }}>Incluída</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '2px solid var(--ocean-deep)' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-playfair)' }}>Total</span>
                      <span style={{ fontWeight: 700, fontSize: '1.25rem', fontFamily: 'var(--font-playfair)', color: 'var(--ocean-deep)' }}>
                        {formatBRL(totalCents)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '1rem',
                  padding: '0.875rem 1rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  {[
                    { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, text: 'Pagamento seguro e criptografado' },
                    { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text: 'Proteção total via LGPD' },
                    { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, text: 'ASAAS — fintech regulamentada pelo Banco Central' },
                  ].map((item, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78125rem', color: '#166534', fontWeight: 500 }}>
                      {item.icon} {item.text}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

          </div>
        </form>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (min-width: 768px) {
          .checkout-grid {
            grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) !important;
          }
        }

        @media (max-width: 480px) {
          .phone-cpf-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}

// ─── small helper components ─────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid var(--border)',
  borderRadius: '1rem',
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-playfair)',
      fontSize: '1.125rem',
      fontWeight: 700,
      color: 'var(--ocean-deep)',
      marginTop: 0,
      marginBottom: '1.125rem',
      paddingBottom: '0.75rem',
      borderBottom: '2px solid var(--sand)',
    }}>
      {children}
    </h2>
  )
}

function FieldGroup({
  label, error, hint, hintColor, children,
}: {
  label: string
  error?: string
  hint?: string
  hintColor?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.78125rem', marginTop: '0.25rem' }}>{error}</p>
      )}
      {!error && hint && (
        <p style={{ color: hintColor ?? 'var(--text-muted)', fontSize: '0.78125rem', marginTop: '0.25rem' }}>{hint}</p>
      )}
    </div>
  )
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '0.6875rem 0.875rem',
    border: `1.5px solid ${hasError ? '#fca5a5' : 'var(--border)'}`,
    borderRadius: '0.625rem',
    fontSize: '0.9375rem',
    color: 'var(--text-primary)',
    background: hasError ? '#fff5f5' : 'white',
    outline: 'none',
    fontFamily: 'var(--font-jakarta)',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }
}
