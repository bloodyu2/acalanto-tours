'use client'

import { useState, type FormEvent } from 'react'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function SejaParceiroPage() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [tipoServico, setTipoServico] = useState('Fotografia de Passeio')
  const [mensagem, setMensagem] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nome,
          email,
          phone: telefone,
          message: `Tipo de servico: ${tipoServico}\n\n${mensagem}`,
          source: 'candidatura-parceiro',
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setErrorMsg(data.error || 'Erro ao enviar. Tente novamente.')
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setErrorMsg('Erro de conexao. Tente novamente.')
      setState('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1.5px solid var(--border, #d1d5db)',
    borderRadius: '10px',
    fontSize: '1rem',
    fontFamily: 'var(--font-jakarta, sans-serif)',
    background: '#fff',
    color: 'var(--text-primary, #1a1a1a)',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 600,
    fontSize: '0.9rem',
    color: 'var(--text-primary, #1a1a1a)',
    marginBottom: '0.4rem',
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--sand, #F5EDD8)', fontFamily: 'var(--font-jakarta, sans-serif)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--ocean-deep, #0A3D5C) 0%, var(--ocean-mid, #1A6B8A) 100%)',
        padding: '4rem 1.5rem 3rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair, serif)',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          color: '#fff',
          margin: '0 0 1rem',
          lineHeight: 1.2,
        }}>
          Seja um Parceiro Acalanto
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.88)',
          fontSize: '1.1rem',
          maxWidth: '540px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Fotografos, guias e prestadores de servicos em Paraty, junte-se ao marketplace.
        </p>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '640px' }}>
        {/* Highlight box */}
        <div style={{
          background: 'var(--sunset, #F4A623)',
          borderRadius: '14px',
          padding: '1.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🎁</span>
          <p style={{ margin: 0, color: '#1a1a1a', fontWeight: 600, fontSize: '0.98rem', lineHeight: 1.6 }}>
            Todo parceiro que fechar com a plataforma tem direito a um ensaio fotografico gratuito: fotos, video e drone do seu negocio.
          </p>
        </div>

        {state === 'success' ? (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-playfair, serif)', margin: '0 0 0.75rem', color: 'var(--ocean-deep, #0A3D5C)' }}>
              Candidatura recebida!
            </h2>
            <p style={{ color: 'var(--text-muted, #6b7280)', margin: 0, lineHeight: 1.6 }}>
              Recebemos sua candidatura! Entraremos em contato em breve.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div>
              <label style={labelStyle}>Nome *</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                placeholder="Seu nome completo"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Telefone *</label>
              <input
                type="tel"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                required
                placeholder="(24) 99999-9999"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Tipo de servico *</label>
              <select
                value={tipoServico}
                onChange={e => setTipoServico(e.target.value)}
                required
                style={inputStyle}
              >
                <option>Fotografia de Passeio</option>
                <option>Guia de Turismo</option>
                <option>Transfer</option>
                <option>Jeep Tour</option>
                <option>Outro</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Mensagem (opcional)</label>
              <textarea
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                rows={4}
                placeholder="Conte um pouco sobre voce e seu servico..."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            {state === 'error' && (
              <p style={{
                margin: 0,
                color: '#dc2626',
                fontSize: '0.9rem',
                background: '#fef2f2',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
              }}>
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={state === 'loading'}
              className="btn-primary"
              style={{
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 700,
                opacity: state === 'loading' ? 0.7 : 1,
                cursor: state === 'loading' ? 'not-allowed' : 'pointer',
              }}
            >
              {state === 'loading' ? 'Enviando...' : 'Enviar candidatura'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
