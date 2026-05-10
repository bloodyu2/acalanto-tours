'use client'
import { useEffect, useState } from 'react'
import type { AdminRole } from '@/lib/admin-auth'

const WELCOME_SLIDES: Record<AdminRole, Array<{ icon: string; title: string; desc: string }>> = {
  super_admin: [
    { icon: '🏠', title: 'Dashboard', desc: 'Visão geral de reservas, receita, NPS e contatos em tempo real.' },
    { icon: '📅', title: 'Reservas', desc: 'Gerencie reservas, sincronize status com ASAAS e pague parceiros direto da tela.' },
    { icon: '🧾', title: 'PDV — Vendas', desc: 'Faça uma venda presencial em poucos cliques (PIX ou cartão).' },
    { icon: '⚓', title: 'Capacidade', desc: 'Controle de vagas por data e embarcação.' },
    { icon: '💰', title: 'Repasses', desc: 'Histórico de repasses para parceiros e splits ASAAS.' },
    { icon: '🤝', title: 'Parceiros', desc: 'Cadastro, subcontas ASAAS e configuração de splits.' },
  ],
  pdv: [
    { icon: '🧾', title: 'Ponto de Venda', desc: 'Faça vendas presenciais. Selecione passeio, data e passageiros.' },
    { icon: '💳', title: 'Pagamento', desc: 'O cliente paga por PIX ou cartão direto pelo ASAAS, na mesma tela.' },
    { icon: '📧', title: 'Confirmação', desc: 'Após o pagamento, o cliente recebe e-mail de confirmação automaticamente.' },
  ],
  tripulacao: [
    { icon: '⚓', title: 'Capacidade do dia', desc: 'Veja as reservas e passageiros de hoje para cada embarcação.' },
    { icon: '📅', title: 'Reservas', desc: 'Consulte detalhes: nome, adultos, crianças, add-ons e observações.' },
  ],
  fotografo: [
    { icon: '📷', title: 'Agenda do dia', desc: 'Veja os embarques com fotógrafo agendado para hoje.' },
    { icon: '✅', title: 'Confirmação', desc: 'Confirme presença e embarques diretamente aqui.' },
  ],
}

interface Props {
  role: AdminRole
  userName?: string | null
}

export default function WelcomeModal({ role, userName }: Props) {
  const storageKey = `acalanto_welcome_v1_${role}`
  const [open, setOpen] = useState(false)
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!localStorage.getItem(storageKey)) setOpen(true)
  }, [storageKey])

  function close() {
    localStorage.setItem(storageKey, '1')
    setOpen(false)
  }

  const slides = WELCOME_SLIDES[role] ?? []
  if (!open || slides.length === 0) return null

  const current = slides[slide]
  const isLast = slide === slides.length - 1

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      <div style={{
        background: 'white', borderRadius: '1.25rem', padding: '2.5rem 2rem 2rem',
        maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        zIndex: 9999, textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
          Bem-vindo{userName ? `, ${userName}` : ''}
        </p>

        <div style={{ fontSize: '3.25rem', margin: '0.5rem 0 0.75rem' }}>{current.icon}</div>

        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.35rem', color: 'var(--ocean-deep)', margin: '0 0 0.5rem' }}>
          {current.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.55, marginBottom: '1.75rem' }}>
          {current.desc}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginBottom: '1.5rem' }}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === slide ? '22px' : '8px',
                height: '8px',
                borderRadius: '999px',
                background: i === slide ? 'var(--ocean-mid)' : 'var(--border)',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {slide > 0 && (
            <button
              onClick={() => setSlide(s => s - 1)}
              style={{
                padding: '0.625rem 1.25rem', border: '1.5px solid var(--border)', borderRadius: '0.75rem',
                background: 'white', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              ← Voltar
            </button>
          )}
          {isLast ? (
            <button
              onClick={close}
              className="btn-primary"
              style={{ padding: '0.625rem 1.5rem', justifyContent: 'center' }}
            >
              Entendi, começar ✓
            </button>
          ) : (
            <button
              onClick={() => setSlide(s => s + 1)}
              className="btn-primary"
              style={{ padding: '0.625rem 1.5rem', justifyContent: 'center' }}
            >
              Próximo →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
