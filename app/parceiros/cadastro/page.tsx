'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { WizardSteps } from './_components/WizardSteps'

function CadastroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const claimSlug = searchParams.get('claim')

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/parceiros/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    sessionStorage.setItem('onboarding_partner_id', data.partnerId)
    if (claimSlug) sessionStorage.setItem('onboarding_claim_slug', claimSlug)

    router.push('/parceiros/cadastro/tipo')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      <div>
        <label className="form-label">Nome do negócio *</label>
        <input
          type="text"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          placeholder="Ex: Pousada do Cais, João Fotografia"
          className="form-input"
        />
      </div>
      <div>
        <label className="form-label">E-mail *</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="seu@email.com"
          className="form-input"
        />
      </div>
      <div>
        <label className="form-label">Senha *</label>
        <input
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
          className="form-input"
        />
      </div>

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
        {loading ? 'Criando conta...' : 'Continuar'}
      </button>
    </form>
  )
}

export default function CadastroStep1Page() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
            Acalanto Turismo
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <WizardSteps current={1} />

          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Crie sua conta</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Comece com e-mail, senha e o nome do seu negócio.
          </p>

          <Suspense fallback={<div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</div>}>
            <CadastroForm />
          </Suspense>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            Já tem conta?{' '}
            <Link href="/conta/login" style={{ color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
