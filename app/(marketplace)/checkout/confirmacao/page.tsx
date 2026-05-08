'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function ConfirmacaoContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('paymentId') || ''
  const method = searchParams.get('method') || ''

  // Read large fields from sessionStorage (stored before redirect to avoid URL crash)
  let paymentUrl = ''
  let pixQrCode = ''
  let pixCopyPaste = ''
  try {
    const stored = sessionStorage.getItem('acalanto_checkout_result')
    if (stored) {
      const parsed = JSON.parse(stored)
      paymentUrl = parsed.paymentUrl || ''
      pixQrCode = parsed.pixQrCode || ''
      pixCopyPaste = parsed.pixCopyPaste || ''
    }
  } catch {}

  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCopyPaste).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const isPix = method === 'PIX'
  const isBoleto = method === 'BOLETO'
  const isCard = method === 'CREDIT_CARD' || method === 'DEBIT_CARD'

  return (
    <main
      style={{ background: 'var(--sand, #F5EDD8)', minHeight: '100vh' }}
      className="flex items-center justify-center px-4 py-12"
    >
      <div
        style={{ background: '#fff', borderRadius: '1.25rem', maxWidth: '520px', width: '100%' }}
        className="shadow-lg p-8"
      >
        {/* Green checkmark */}
        <div className="flex justify-center mb-6">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="32" cy="32" r="32" fill="#22c55e" />
            <path
              d="M20 33l9 9 15-16"
              stroke="#fff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Heading */}
        {isPix && (
          <h1
            style={{ fontFamily: 'var(--font-playfair, serif)', color: 'var(--ocean-deep, #0A3D5C)' }}
            className="text-2xl font-bold text-center mb-2"
          >
            Quase lá! Pague via PIX
          </h1>
        )}
        {isBoleto && (
          <h1
            style={{ fontFamily: 'var(--font-playfair, serif)', color: 'var(--ocean-deep, #0A3D5C)' }}
            className="text-2xl font-bold text-center mb-2"
          >
            Boleto gerado com sucesso
          </h1>
        )}
        {isCard && (
          <h1
            style={{ fontFamily: 'var(--font-playfair, serif)', color: 'var(--ocean-deep, #0A3D5C)' }}
            className="text-2xl font-bold text-center mb-2"
          >
            Finalize seu pagamento
          </h1>
        )}

        {/* Order reference */}
        {paymentId && (
          <p
            style={{ fontFamily: 'var(--font-jakarta, sans-serif)', color: '#6b7280' }}
            className="text-sm text-center mb-6"
          >
            Pedido #{paymentId}
          </p>
        )}

        {/* PIX content */}
        {isPix && (
          <div className="flex flex-col items-center gap-4">
            {pixQrCode && (
              <img
                src={pixQrCode}
                alt="QR Code PIX"
                style={{ width: '200px', height: '200px', borderRadius: '0.5rem' }}
              />
            )}

            {pixCopyPaste && (
              <div style={{ width: '100%' }}>
                <p
                  style={{ fontFamily: 'var(--font-jakarta, sans-serif)', color: 'var(--ocean-deep, #0A3D5C)', fontWeight: 600 }}
                  className="text-sm mb-1"
                >
                  Código copia-e-cola
                </p>
                <div
                  style={{ background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.75rem', wordBreak: 'break-all' }}
                  className="flex items-start gap-2"
                >
                  <span
                    style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#374151', flex: 1 }}
                  >
                    {pixCopyPaste}
                  </span>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: copied ? '#22c55e' : 'var(--ocean-mid, #1A6B8A)',
                      color: '#fff',
                      borderRadius: '0.375rem',
                      padding: '0.375rem 0.75rem',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-jakarta, sans-serif)',
                      whiteSpace: 'nowrap',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            <ol
              style={{ fontFamily: 'var(--font-jakarta, sans-serif)', color: '#374151', fontSize: '0.9rem', paddingLeft: '1.25rem' }}
              className="list-decimal space-y-1 w-full"
            >
              <li>Abra o app do seu banco</li>
              <li>Pague com PIX</li>
              <li>Escaneie o QR code ou use o código copia-e-cola</li>
            </ol>

            <p
              style={{ fontFamily: 'var(--font-jakarta, sans-serif)', color: '#6b7280', fontSize: '0.85rem', textAlign: 'center' }}
            >
              Sua reserva será confirmada automaticamente após o pagamento.
            </p>
          </div>
        )}

        {/* Boleto content */}
        {isBoleto && (
          <div className="flex flex-col items-center gap-4">
            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--ocean-mid, #1A6B8A)',
                  color: '#fff',
                  borderRadius: '0.625rem',
                  padding: '0.875rem 2rem',
                  fontFamily: 'var(--font-jakarta, sans-serif)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Visualizar Boleto
              </a>
            )}
            <p
              style={{ fontFamily: 'var(--font-jakarta, sans-serif)', color: '#6b7280', fontSize: '0.85rem', textAlign: 'center' }}
            >
              O pagamento pode levar até 3 dias úteis para ser compensado.
            </p>
          </div>
        )}

        {/* Card content */}
        {isCard && (
          <div className="flex flex-col items-center gap-4">
            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--ocean-mid, #1A6B8A)',
                  color: '#fff',
                  borderRadius: '0.625rem',
                  padding: '0.875rem 2rem',
                  fontFamily: 'var(--font-jakarta, sans-serif)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Ir para o pagamento
              </a>
            )}
            <p
              style={{ fontFamily: 'var(--font-jakarta, sans-serif)', color: '#6b7280', fontSize: '0.85rem', textAlign: 'center' }}
            >
              Você será redirecionado para o ambiente seguro de pagamento.
            </p>
          </div>
        )}

        {/* Divider */}
        <hr style={{ margin: '1.75rem 0', borderColor: '#e5e7eb' }} />

        {/* WhatsApp CTA */}
        <div className="flex justify-center">
          <a
            href="https://wa.me/5524999627968"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#25d366',
              color: '#fff',
              borderRadius: '0.625rem',
              padding: '0.75rem 1.5rem',
              fontFamily: 'var(--font-jakarta, sans-serif)',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Dúvidas? Fale conosco pelo WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}

export default function ConfirmacaoPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{ background: 'var(--sand, #F5EDD8)', minHeight: '100vh' }}
          className="flex items-center justify-center"
        >
          <p style={{ fontFamily: 'var(--font-jakarta, sans-serif)', color: 'var(--ocean-deep, #0A3D5C)' }}>
            Carregando...
          </p>
        </main>
      }
    >
      <ConfirmacaoContent />
    </Suspense>
  )
}
