'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function InviteAcceptForm() {
  const [status, setStatus] = useState<'loading' | 'set-password' | 'success' | 'error'>('loading')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    // Supabase invite sends access_token in hash
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const type = hashParams.get('type')
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (type === 'invite' && accessToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken ?? '' })
        .then(() => setStatus('set-password'))
        .catch(() => { setStatus('error'); setMessage('Link de convite inválido ou expirado.') })
    } else if (type === 'recovery' && accessToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken ?? '' })
        .then(() => setStatus('set-password'))
        .catch(() => { setStatus('error'); setMessage('Link inválido ou expirado.') })
    } else {
      setStatus('error')
      setMessage('Link de convite inválido. Solicite um novo convite.')
    }
  }, [supabase])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setMessage('As senhas não coincidem.'); return }
    if (password.length < 8) { setMessage('Mínimo 8 caracteres.'); return }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
    } else {
      setStatus('success')
    }
  }

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Verificando convite...
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>
          Conta ativada!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Sua conta de parceiro está pronta. Acesse o painel para começar.
        </p>
        <Link href="/parceiros/dashboard" className="btn-primary">
          Acessar painel
        </Link>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ fontFamily: 'var(--font-playfair)', color: 'var(--ocean-deep)', marginBottom: '0.75rem' }}>
          Link inválido
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{message}</p>
        <Link href="/contato" className="btn-primary">Entrar em contato</Link>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--sand-warm)',
      padding: '2rem 1rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1.25rem',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', marginBottom: '0.5rem' }}>
          Ativar conta de parceiro
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Escolha uma senha para acessar seu painel de parceiro Acalanto.
        </p>

        <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1.5px solid var(--border)', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={8}
              placeholder="Repita a senha"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1.5px solid var(--border)', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
          {message && (
            <div style={{ background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#b91c1c', fontSize: '0.875rem' }}>
              {message}
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            Ativar conta
          </button>
        </form>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense>
      <InviteAcceptForm />
    </Suspense>
  )
}
