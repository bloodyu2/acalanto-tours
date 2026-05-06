'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ServicosComingSoonPage() {
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
          source: 'interesse-servicos',
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

  const upcomingServices = [
    {
      icon: (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>),
      title: 'Jeep Tour pela Mata Atlantica',
      description:
        'Exploracao em jeep pelas trilhas e cachoeiras da Serra da Bocaina. Em breve.',
    },
    {
      icon: (<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>),
      title: 'Transfer do Aeroporto',
      description:
        'Transfer confortavel de SP/RJ ate Paraty. Em breve.',
    },
  ]

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #3d2b1f 0%, #6b4c35 100%)',
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
            Servicos em Breve
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
            Mais opcoes para completar sua experiencia em Paraty.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section style={{ padding: '64px 24px 40px', background: 'var(--sand)' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
              marginBottom: 56,
            }}
          >
            {upcomingServices.map(svc => (
              <div
                key={svc.title}
                className="card"
                style={{ padding: '28px 24px', position: 'relative', overflow: 'hidden' }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: 'var(--sand)',
                    border: '1px solid var(--border)',
                    borderRadius: 999,
                    padding: '2px 10px',
                    fontSize: 11,
                    fontFamily: 'var(--font-jakarta)',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Em breve
                </span>
                <div style={{ marginBottom: 12, color: 'var(--ocean-mid)' }}>{svc.icon}</div>
                <h3
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--ocean-deep)',
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}
                >
                  {svc.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-jakarta)',
                    fontSize: 14,
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}
                >
                  {svc.description}
                </p>
              </div>
            ))}
          </div>

          {/* Interest Form */}
          {status === 'success' ? (
            <div
              style={{
                background: '#fff',
                border: '1px solid #b7f0c8',
                borderRadius: 12,
                padding: '32px 24px',
                textAlign: 'center',
                maxWidth: 560,
                margin: '0 auto',
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
            <div className="card" style={{ padding: '32px 28px', maxWidth: 560, margin: '0 auto' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--ocean-deep)',
                  marginBottom: 8,
                }}
              >
                Tenho interesse
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-jakarta)',
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  marginBottom: 24,
                }}
              >
                Deixe seus dados e avisaremos quando estes servicos estiverem disponiveis.
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label
                    htmlFor="cs-nome"
                    style={{ fontFamily: 'var(--font-jakarta)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
                  >
                    Nome *
                  </label>
                  <input
                    id="cs-nome"
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
                    htmlFor="cs-telefone"
                    style={{ fontFamily: 'var(--font-jakarta)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
                  >
                    Telefone *
                  </label>
                  <input
                    id="cs-telefone"
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
                    htmlFor="cs-mensagem"
                    style={{ fontFamily: 'var(--font-jakarta)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}
                  >
                    Mensagem (opcional)
                  </label>
                  <textarea
                    id="cs-mensagem"
                    value={form.mensagem}
                    onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                    placeholder="Ex: Tenho interesse no jeep tour para 5 pessoas..."
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
              href="/servicos"
              style={{
                fontFamily: 'var(--font-jakarta)',
                fontSize: 14,
                color: 'var(--ocean-mid)',
                textDecoration: 'none',
                fontWeight: 500,
                marginRight: 24,
              }}
            >
              Ver servicos disponiveis
            </Link>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-jakarta)',
                fontSize: 14,
                color: 'var(--text-muted)',
                textDecoration: 'none',
              }}
            >
              Pagina inicial
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
