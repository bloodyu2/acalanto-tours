'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function ContaLoginForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    setLoading(false)
    if (err) {
      setError('Não foi possível enviar o link. Tente novamente.')
    } else {
      setSent(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sand)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: '0 8px 40px rgba(10,61,92,0.12)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '0.375rem' }}>
            Entrar na sua conta
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Acesse suas reservas e histórico de passeios
          </p>
        </div>

        {urlError === 'link_expirado' && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#92400e', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Este link expirou ou já foi usado. Solicite um novo link abaixo.
          </div>
        )}

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ marginBottom: '1rem', color: 'var(--ocean-mid)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>
              Verifique seu email
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Enviamos um link de acesso para <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              Clique no link para entrar.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
              Não recebeu? Verifique a pasta de spam ou{' '}
              <button
                onClick={() => setSent(false)}
                style={{ background: 'none', border: 'none', color: 'var(--ocean-mid)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}
              >
                tente novamente
              </button>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid var(--border)',
                  borderRadius: '0.75rem',
                  fontSize: '0.9375rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--ocean-mid)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {error && (
              <p style={{ color: '#e53e3e', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Enviando...' : 'Receber link de acesso'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          É parceiro?{' '}
          <Link href="/parceiros/login" style={{ color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}>
            Acessar painel de parceiro
          </Link>
        </p>

        {/* Note for partners/admins */}
        <div style={{ marginTop: '1.75rem', padding: '1rem', background: 'var(--sand)', borderRadius: '0.75rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Sou parceiro ou admin:</strong> o mesmo link magico funciona para todos os perfis. Basta informar seu e-mail cadastrado.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ContaLoginPage() {
  return (
    <Suspense fallback={null}>
      <ContaLoginForm />
    </Suspense>
  )
}
