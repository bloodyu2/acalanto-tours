'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { WizardSteps } from '../_components/WizardSteps'

function cleanDigits(v: string) {
  return v.replace(/\D/g, '')
}

function isValidCpf(cpf: string): boolean {
  const d = cleanDigits(cpf)
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(d[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === parseInt(d[10])
}

function isValidCnpj(cnpj: string): boolean {
  const d = cleanDigits(cnpj)
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false
  const calc = (s: string, weights: number[]) =>
    weights.reduce((acc, w, i) => acc + parseInt(s[i]) * w, 0)
  const mod = (n: number) => { const r = n % 11; return r < 2 ? 0 : 11 - r }
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  return mod(calc(d, w1)) === parseInt(d[12]) && mod(calc(d, w2)) === parseInt(d[13])
}

export default function DadosFiscaisPage() {
  const router = useRouter()
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [cpfCnpj, setCpfCnpj] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')
  const [address, setAddress] = useState('')
  const [addressNumber, setAddressNumber] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')

  useEffect(() => {
    const pid = sessionStorage.getItem('onboarding_partner_id')
    if (!pid) { router.push('/parceiros/cadastro'); return }
    setPartnerId(pid)
  }, [router])

  const digits = cleanDigits(cpfCnpj)
  const isPf = digits.length <= 11
  const cpfCnpjValid = isPf ? isValidCpf(digits) : isValidCnpj(digits)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!partnerId) return
    if (!cpfCnpjValid) { setError('CPF ou CNPJ inválido.'); return }
    if (cleanDigits(postalCode).length !== 8) { setError('CEP deve ter 8 dígitos.'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('partners')
      .update({
        cpf_cnpj:       cleanDigits(cpfCnpj),
        birth_date:     birthDate,
        mobile_phone:   cleanDigits(mobilePhone),
        address,
        address_number: addressNumber,
        province,
        postal_code:    cleanDigits(postalCode),
      })
      .eq('id', partnerId)

    if (updateError) {
      setError('Erro ao salvar dados. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/parceiros/cadastro/anuncio')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.8125rem 1rem',
    border: '1px solid var(--border)', borderRadius: '8px',
    fontSize: '0.9375rem', fontFamily: 'inherit',
    outline: 'none', background: 'white', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.8125rem',
    fontWeight: 600, marginBottom: '0.375rem',
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
          <WizardSteps current={3} />
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Dados para recebimento</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Necessários para configurar sua conta de recebimento. Seus dados são protegidos e criptografados.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={labelStyle}>CPF ou CNPJ *</label>
              <input
                type="text"
                value={cpfCnpj}
                onChange={e => setCpfCnpj(e.target.value)}
                required
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                style={{ ...inputStyle, borderColor: cpfCnpj && !cpfCnpjValid ? '#dc2626' : undefined }}
              />
              {cpfCnpj && !cpfCnpjValid && (
                <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                  {isPf ? 'CPF inválido' : 'CNPJ inválido'}
                </p>
              )}
              {cpfCnpj && cpfCnpjValid && (
                <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
                  ✓ {isPf ? 'CPF válido' : 'CNPJ válido'}
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>{isPf ? 'Data de nascimento' : 'Data de abertura da empresa'} *</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Celular *</label>
              <input
                type="tel"
                value={mobilePhone}
                onChange={e => setMobilePhone(e.target.value)}
                required
                placeholder="(24) 99999-9999"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Endereço *</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  placeholder="Rua, Avenida..."
                  style={inputStyle}
                />
              </div>
              <div style={{ width: '90px' }}>
                <label style={labelStyle}>Número *</label>
                <input
                  type="text"
                  value={addressNumber}
                  onChange={e => setAddressNumber(e.target.value)}
                  required
                  placeholder="123"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Bairro *</label>
              <input
                type="text"
                value={province}
                onChange={e => setProvince(e.target.value)}
                required
                placeholder="Centro"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>CEP *</label>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                required
                placeholder="23970-000"
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '8px', margin: 0 }}>
                {error}
              </p>
            )}

            <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '10px', padding: '1rem 1.125rem' }}>
              <p style={{ margin: '0 0 0.375rem', fontSize: '0.8125rem', fontWeight: 700, color: '#92400e' }}>
                ⚠️ Emissão de Nota Fiscal
              </p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#92400e', lineHeight: 1.6 }}>
                Você é responsável por emitir suas próprias notas fiscais no seu CNPJ/CPF para cada serviço prestado.
                A Acalanto repassa os valores brutos conforme o split acordado — a tributação e emissão de NF é de sua responsabilidade como prestador independente.
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !cpfCnpjValid}
              style={{ padding: '1rem', fontSize: '1rem', opacity: (loading || !cpfCnpjValid) ? 0.7 : 1, cursor: (loading || !cpfCnpjValid) ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Salvando...' : 'Continuar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
