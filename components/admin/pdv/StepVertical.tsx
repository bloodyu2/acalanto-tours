'use client'
import type { Vertical } from '@/lib/pdv/role-permissions'

interface Props {
  verticals: Array<{ vertical: Vertical; priority: number }>
  onSelect: (v: Vertical) => void
}

const META: Record<Vertical, { icon: string; label: string; desc: string }> = {
  passeio:    { icon: '⚓', label: 'Passeio de escuna',  desc: 'Vender uma reserva em uma das escunas.' },
  fotografia: { icon: '📷', label: 'Fotografia',         desc: 'Pacote de fotos no embarque.' },
  servico:    { icon: '🛟', label: 'Serviço avulso',     desc: 'Lancha privativa, transfer, etc.' },
  hospedagem: { icon: '🏠', label: 'Hospedagem',         desc: 'Reserva de quarto/casa.' },
}

export default function StepVertical({ verticals, onSelect }: Props) {
  if (verticals.length === 0) {
    return (
      <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Você não tem permissão para vender nenhuma categoria. Fale com o administrador.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
      {verticals.map(({ vertical }) => {
        const m = META[vertical]
        return (
          <button
            key={vertical}
            onClick={() => onSelect(vertical)}
            style={{
              padding: '1.5rem', background: 'white', borderRadius: '1rem',
              border: '2px solid var(--border)', cursor: 'pointer', textAlign: 'left',
              transition: 'border-color 0.15s, transform 0.1s',
            }}
            onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--ocean-mid)')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{m.icon}</div>
            <p style={{ fontWeight: 700, color: 'var(--ocean-deep)', margin: '0 0 0.25rem' }}>{m.label}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{m.desc}</p>
          </button>
        )
      })}
    </div>
  )
}
