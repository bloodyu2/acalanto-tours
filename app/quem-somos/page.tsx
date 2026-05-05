import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Quem Somos',
  description: 'Conheça a Acalanto Tours — empresa de turismo náutico em Paraty dedicada a criar experiências inesquecíveis nas águas da Costa Verde.',
}

export default function QuemSomosPage() {
  return (
    <>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)',
        padding: '5rem 0 3rem',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white" />
          </svg>
        </div>
        <div className="container" style={{ position: 'relative' }}>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'white', marginBottom: '0.75rem' }}>
            Quem Somos
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.125rem', maxWidth: '600px' }}>
            Da fotografia à plataforma de turismo — a história de como a Acalanto surgiu em Paraty.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: '820px' }}>

          {/* Origin story */}
          <div style={{ marginBottom: '3rem' }}>
            <span className="section-tag">Nossa História</span>
            <h2 className="section-title">De fotógrafos a plataforma</h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
              A Acalanto nasceu do trabalho fotográfico em Paraty. Ao longo do tempo, a equipe foi crescendo, assumindo a gestão de pessoas, criando parcerias e formando o <strong>GFP — Grupo de Fotógrafos de Paraty</strong>, uma associação de profissionais que registram a beleza da cidade e de seus passeios.
            </p>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
              Ao perceber que as embarcações menores não tinham visibilidade digital e que os turistas chegavam sem saber quais passeios escolher, a Acalanto deu um passo além: <strong>tornar-se a plataforma central de turismo de Paraty</strong>. Reunir em um só lugar as melhores escunas, lanchas, jeeps, guias e fotógrafos da cidade — com venda centralizada, gestão de qualidade e experiência garantida.
            </p>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
              Nosso nome carrega um significado especial: <em>acalanto</em> é uma canção de ninar, um abraço suave. É exatamente o que queremos que Paraty seja para cada visitante — um destino que acolhe, encanta e fica na memória.
            </p>
          </div>

          {/* What we do */}
          <div style={{ marginBottom: '3rem' }}>
            <span className="section-tag">O que fazemos</span>
            <h2 className="section-title">Uma plataforma para toda Paraty</h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '2rem' }}>
              A Acalanto atua como gestora e canal de vendas para os melhores fornecedores de turismo da cidade. Cuidamos da divulgação, das reservas e da qualidade — para que o turista tenha uma experiência garantida e o parceiro possa focar no que faz de melhor.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {[
                { icon: '⛵', title: 'Escunas', desc: 'Passeios em grupos pelas ilhas e praias da Baía de Paraty — com gastronomia, roteiros e perfis variados.' },
                { icon: '🚤', title: 'Lanchas Privadas', desc: 'Barcos privativos para até 6 pessoas. O roteiro é seu — vá onde quiser, no seu tempo.' },
                { icon: '🚙', title: 'Jeep e City Tour', desc: 'Percorra a Mata Atlântica, cachoeiras e o centro histórico tombado de Paraty.' },
                { icon: '📸', title: 'Fotografia', desc: 'Serviços fotográficos profissionais para passeios, ensaios e eventos em Paraty.' },
                { icon: '🧭', title: 'Guias', desc: 'Guias locais credenciados que conhecem cada canto da cidade e da natureza ao redor.' },
                { icon: '⛵', title: 'Veleiros', desc: 'Experiências à vela para quem quer navegar de forma mais contemplativa e autêntica.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ background: 'var(--sand)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div style={{ marginBottom: '3rem' }}>
            <span className="section-tag">Nossos valores</span>
            <h2 className="section-title">Por que a Acalanto</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {[
                { icon: '✅', title: 'Curadoria de qualidade', desc: 'Selecionamos e avaliamos cada parceiro para garantir que sua experiência seja sempre de alto nível.' },
                { icon: '💬', title: 'Venda centralizada', desc: 'Chega de ligar para vários barcos. Aqui você encontra tudo, compara e reserva em um só lugar.' },
                { icon: '🤝', title: 'Parceiros locais', desc: 'Trabalhamos com empresas e profissionais de Paraty — o dinheiro fica na cidade e fortalece a economia local.' },
                { icon: '📱', title: 'Reserva fácil', desc: 'Pelo site ou pelo WhatsApp, sem burocracia. Confirmação rápida e atendimento humano.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ padding: '1.5rem 0', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.0625rem', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{title}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--ocean-deep)', borderRadius: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.625rem', color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Pronto para explorar Paraty?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Escolha seu passeio e reserve com facilidade.
            </p>
            <Link href="/#escunas" className="btn-primary">
              Ver Passeios
            </Link>
          </div>

        </div>
      </section>
    </>
  )
}
