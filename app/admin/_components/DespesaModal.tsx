'use client'
import { useState, useRef } from 'react'

interface Props {
  onClose: () => void
}

export default function DespesaModal({ onClose }: Props) {
  const [description, setDescription] = useState('')
  const [valueReais, setValueReais] = useState('')
  const [recipient, setRecipient] = useState('')
  const [pixKey, setPixKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const backdropRef = useRef<HTMLDivElement>(null)

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === backdropRef.current) onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/financeiro/despesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: recipient ? `${description} — ${recipient}` : description,
          valueCents: Math.round(parseFloat(valueReais) * 100),
          pixKey,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao processar pagamento')
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Erro de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#38a169', marginBottom: '0.5rem' }}>
              Pagamento enviado
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              A transferência PIX foi registrada no ASAAS.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: '0.625rem 1.5rem',
                borderRadius: '0.625rem',
                background: 'var(--ocean-deep)',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <h2
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '1.25rem',
                color: 'var(--ocean-deep)',
                marginBottom: '1.5rem',
              }}
            >
              💸 Nova despesa operacional
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ocean-deep)', marginBottom: '0.3rem' }}>
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="ex: Combustível, Manutenção, Fornecedor..."
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ocean-deep)', marginBottom: '0.3rem' }}>
                  Valor em R$ *
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={valueReais}
                  onChange={e => setValueReais(e.target.value)}
                  placeholder="0,00"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ocean-deep)', marginBottom: '0.3rem' }}>
                  Nome do destinatário
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="ex: João Silva (opcional)"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--ocean-deep)', marginBottom: '0.3rem' }}>
                  Chave PIX *
                </label>
                <input
                  type="text"
                  required
                  value={pixKey}
                  onChange={e => setPixKey(e.target.value)}
                  placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {error && (
                <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.875rem', color: '#c53030' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: '0.625rem',
                    background: 'transparent',
                    color: 'var(--ocean-deep)',
                    border: '1px solid var(--border)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: '0.625rem',
                    background: loading ? '#94a3b8' : 'var(--ocean-deep)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {loading ? 'Processando...' : 'Confirmar pagamento'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
