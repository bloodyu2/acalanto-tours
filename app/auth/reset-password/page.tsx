'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  // Supabase sends the token via URL hash — handle it
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const type = hashParams.get('type')
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (type === 'recovery' && accessToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken ?? '' })
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setStatus('error')
      setMessage('As senhas não coincidem.')
      return
    }
    if (password.length < 8) {
      setStatus('error')
      setMessage('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    setStatus('loading')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setStatus('error')
      setMessage(error.message)
    } else {
      setStatus('success')
      setMessage('Senha alterada com sucesso! Redirecionando...')
      setTimeout(() => { window.location.href = '/conta' }, 2000)
    }
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
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.75rem',
          color: 'var(--ocean-deep)',
          marginBottom: '0.5rem',
        }}>
          Nova senha
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Escolha uma senha segura para sua conta Acalanto.
        </p>

        {status === 'success' ? (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '0.75rem',
            padding: '1rem 1.25rem',
            color: '#065f46',
            fontWeight: 500,
          }}>
            ✓ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                Nova senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1.5px solid var(--border)',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
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
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1.5px solid var(--border)',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {status === 'error' && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: '#b91c1c',
                fontSize: '0.875rem',
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {status === 'loading' ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
