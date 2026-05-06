'use client'

import type { Metadata } from 'next'
import Link from 'next/link'
import { useState } from 'react'

// Note: metadata must be in a separate server component when using 'use client'.
// We export it here for build compatibility but it won't be picked up at runtime
// from a client component. See hotelaria/metadata.ts for the actual export.

export default function HotelariaPage() {
  const [form, setForm] = useState({ nome: '', telefone: '', mensagem: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.nome,
          phone: form.telefone,
          message: form.mensagem,
          source: 'interesse-hotelaria',
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Erro ao enviar. Tente novamente.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Erro de conexao. Tente novamente.')
      setStatus('error')
    }
  }

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)',
          padding: '80px 24px 64px',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <div className="container" style={{ maxWidth: 720 }}>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 999,
              padding: '4px 16px',
              fontSize: 13,
              fontFamily: 'var(--font-jakarta)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            Em Breve
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            Hotelaria em Paraty
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-jakarta)',
              fontSize: 18,
              opacity: 0.88,
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Em breve, os melhores parceiros de hospedagem para complementar seu passeio.
          </p>
        </div>
      </section>

      {/* Description + Form */}
      <section style={{ padding: '64px 24px', background: 'var(--sand)' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <p
            style={{
              fontFamily: 'var(--font-jakarta)',
              fontSize: 16,
              color: 'var(--text-primary)',
              lineHeight: 1.7,
              marginBottom: 48,
              padding: '20px 24px',
              background: '#fff',
              borderRadius: 12,
              border: '1px solid var(--border)',
            }}
          >
            Estamos selecionando hoteis, pousadas e airbnbs parceiros proximos ao pier para criar
            pacotes combinados de hospedagem + passeio de escuna.
          </p>

          {status === 'success' ? (
            <div
              style={{
                background: '#fff',
                border: '1px solid #b7f0c8',
                borderRadius: 12,
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-jakarta)',
                  fontSize: 17,
                  color: '#1a7a3a',
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Mensagem enviada!
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-jakarta)',
                  fontSize: 15,
                  color: 'var(--text-muted)',
                }}
              >
                Obrigado! Entraremos em contato quando tivermos novidades.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: '32px 28px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--ocean-deep)',
                  marginBottom: 8,
                }}
              >
                Quero ser avisado
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-jakarta)',
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  marginBottom: 24,
                }}
              >
                Deixe seus dados e avisaremos quando a parceria de hotelaria estiver disponivel.
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label
                    htmlFor="nome"
                    style={{ fontFamily: 'var(--font-jakarta)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
                  >
                    Nome *
                  </label>
                  <input
                    id="nome"
                    type="text"
                    required
                    value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                    placeholder="Seu nome completo"
                    style={{
                      fontFamily: 'var(--font-jakarta)',
                      fontSize: 15,
                      padding: '10px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      outline: 'none',
                      background: '#fff',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label
                    htmlFor="telefone"
                    style={{ fontFamily: 'var(--font-jakarta)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
                  >
                    Telefone *
                  </label>
                  <input
                    id="telefone"
                    type="text"
                    required
                    value={form.telefone}
                    onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    style={{
                      fontFamily: 'var(--font-jakarta)',
                      fontSize: 15,
                      padding: '10px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      outline: 'none',
                      background: '#fff',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label
                    htmlFor="mensagem"
                    style={{ fontFamily: 'var(--font-jakarta)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
                  >
                    Mensagem (opcional)
                  </label>
                  <textarea
                    id="mensagem"
                    value={form.mensagem}
                    onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                    placeholder="Ex: Preciso de hospedagem para 4 pessoas em julho..."
                    rows={4}
                    style={{
                      fontFamily: 'var(--font-jakarta)',
                      fontSize: 15,
                      padding: '10px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      outline: 'none',
                      background: '#fff',
                      resize: 'vertical',
                    }}
                  />
                </div>
                {status === 'error' && (
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: 13, color: '#c0392b' }}>
                    {errorMsg}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary"
                  style={{ opacity: status === 'loading' ? 0.7 : 1, cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
                >
                  {status === 'loading' ? 'Enviando...' : 'Quero ser avisado'}
                </button>
              </form>
            </div>
          )}

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-jakarta)',
                fontSize: 14,
                color: 'var(--ocean-mid)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Voltar para a pagina inicial
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
