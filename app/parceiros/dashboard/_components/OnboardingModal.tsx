'use client'

import { useEffect, useState } from 'react'

interface OnboardingModalProps {
  partnerId: string
}

export default function OnboardingModal({ partnerId }: OnboardingModalProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const key = `acalanto_partner_onboarded_${partnerId}`
    const alreadySeen = localStorage.getItem(key)
    if (!alreadySeen) {
      setVisible(true)
    }
  }, [partnerId])

  function handleClose() {
    const key = `acalanto_partner_onboarded_${partnerId}`
    localStorage.setItem(key, 'true')
    setVisible(false)
  }

  if (!visible) return null

  const steps = [
    {
      icon: '📋',
      title: 'Cadastre seu serviço',
      description: 'Vá em "Perfil" e complete os dados do seu anúncio. Quanto mais informações, mais chances de reservas!',
      repasses: null,
    },
    {
      icon: '✅',
      title: 'Aprovação pela Acalanto',
      description: 'Nossa equipe analisará seu cadastro em até 2 dias úteis. Você receberá um e-mail quando for aprovado.',
      repasses: null,
    },
    {
      icon: '💰',
      title: 'Conta de pagamentos',
      description: 'Após aprovação, criaremos sua subconta no Asaas. Você receberá os pagamentos diretamente lá.',
      repasses: null,
    },
    {
      icon: '⏱️',
      title: 'Prazos de repasse',
      description: null,
      repasses: [
        { label: 'Pix', detail: 'instantâneo (assim que o cliente paga)' },
        { label: 'Cartão de crédito', detail: '~30 dias corridos' },
        { label: 'Boleto', detail: '~2 dias úteis após compensação' },
      ],
    },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1rem',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'var(--ocean-deep)',
            borderRadius: '1rem 1rem 0 0',
            padding: '2rem 2rem 1.5rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
          <h2
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Bem-vindo ao Portal do Parceiro!
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.95rem',
              marginTop: '0.5rem',
              marginBottom: 0,
            }}
          >
            Sua conta foi criada com sucesso. Veja o que acontece a seguir:
          </p>
        </div>

        {/* Steps */}
        <div style={{ padding: '1.5rem 2rem' }}>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {steps.map((step, index) => (
              <li
                key={index}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  background: '#f7f9fc',
                  borderRadius: '0.625rem',
                  padding: '1rem 1.25rem',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    fontSize: '1.375rem',
                    lineHeight: 1,
                    flexShrink: 0,
                    marginTop: '0.125rem',
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        background: 'var(--ocean-deep)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '1.25rem',
                        height: '1.25rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </span>
                    <strong
                      style={{
                        fontSize: '0.95rem',
                        color: 'var(--ocean-deep)',
                        fontFamily: 'var(--font-jakarta)',
                      }}
                    >
                      {step.title}
                    </strong>
                  </div>
                  {step.description && (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#555', lineHeight: 1.5 }}>
                      {step.description}
                    </p>
                  )}
                  {step.repasses && (
                    <ul style={{ margin: '0.25rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {step.repasses.map((r) => (
                        <li key={r.label} style={{ fontSize: '0.875rem', color: '#555', display: 'flex', gap: '0.4rem' }}>
                          <span style={{ color: 'var(--ocean-deep)', fontWeight: 600, flexShrink: 0 }}>{r.label}:</span>
                          <span>{r.detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              display: 'block',
              width: '100%',
              marginTop: '1.5rem',
              padding: '0.875rem 1.5rem',
              background: 'var(--ocean-deep)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-jakarta)',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Entendido, vamos lá!
          </button>
        </div>
      </div>
    </div>
  )
}
