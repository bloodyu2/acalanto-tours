import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Cancelamento — Acalanto Tours',
  description: 'Saiba as condições para cancelamento e reembolso de reservas na Acalanto Tours.',
}

export default function CancelamentoPage() {
  const policies = [
    {
      prazo: 'Mais de 48h antes',
      reembolso: 'Reembolso integral',
      detalhe: 'Você recebe 100% do valor pago de volta.',
      color: '#059669',
    },
    {
      prazo: 'Entre 24h e 48h antes',
      reembolso: 'Reembolso de 50%',
      detalhe: 'Metade do valor é reembolsada. A outra metade cobre os custos de preparação do passeio.',
      color: '#D97706',
    },
    {
      prazo: 'Menos de 24h antes',
      reembolso: 'Sem reembolso',
      detalhe: 'Com menos de 24 horas de antecedência, não é possível reembolsar. Você pode tentar remarcar mediante disponibilidade.',
      color: '#DC2626',
    },
  ]

  return (
    <main style={{ padding: '6rem 0 4rem', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}>
          ← Voltar para o início
        </Link>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Política de Cancelamento
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.875rem' }}>
          Última atualização: maio de 2026
        </p>

        <p style={{ marginBottom: '2rem', lineHeight: 1.75, fontSize: '0.9375rem' }}>
          Entendemos que imprevistos acontecem. Nossa política de cancelamento é baseada na antecedência com que o pedido é feito em relação à data do passeio.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {policies.map(({ prazo, reembolso, detalhe, color }) => (
            <div key={prazo} style={{ background: 'var(--sand)', border: `2px solid ${color}20`, borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{prazo}</span>
                <span style={{ fontWeight: 700, color, fontSize: '0.9rem', background: `${color}18`, padding: '0.2rem 0.75rem', borderRadius: '999px' }}>{reembolso}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{detalhe}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.75, fontSize: '0.9375rem' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Como solicitar o cancelamento</h2>
            <p>Entre em contato diretamente pelo WhatsApp informando seu nome, data do passeio e número da reserva. Processamos o reembolso em até 7 dias úteis para pagamentos via cartão.</p>
            <p style={{ marginTop: '0.75rem' }}>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}?text=Olá, gostaria de solicitar o cancelamento da minha reserva.`}
                style={{ color: 'var(--ocean-mid)', fontWeight: 600, textDecoration: 'none' }}
                target="_blank"
                rel="noreferrer"
              >
                Falar no WhatsApp
              </a>
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Cancelamento por parte da Acalanto Tours</h2>
            <p>Em caso de cancelamento por mau tempo, problemas técnicos ou outro motivo de nossa responsabilidade, você receberá reembolso integral ou a opção de remarcar sem custo adicional.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Remarcação</h2>
            <p>Se preferir remarcar em vez de cancelar, fazemos isso sem custo adicional com mais de 24h de antecedência, sujeito à disponibilidade de vagas na nova data escolhida.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
