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
            Nascemos de um amor profundo pelo mar de Paraty e pela hospitalidade caiçara.
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '4rem 0 5rem' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <div style={{ marginBottom: '3rem' }}>
            <span className="section-tag">Nossa História</span>
            <h2 className="section-title">A Acalanto</h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1rem' }}>
              A Acalanto Tours nasceu da paixão de uma família caiçara pelas águas de Paraty. Com décadas de experiência no turismo náutico local, reunimos as melhores embarcações e os roteiros mais bonitos da Baía de Paraty para criar experiências que vão muito além de um simples passeio de barco.
            </p>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
              Nosso nome carrega um significado especial: <em>acalanto</em> é uma canção de ninar, um abraço suave — exatamente o que queremos que cada passeio seja para nossos visitantes. Um momento de paz, beleza e conexão com a natureza exuberante da Costa Verde.
            </p>
          </div>

          {/* Values */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              { icon: '⚓', title: 'Segurança', desc: 'Embarcações certificadas e equipamentos de segurança em conformidade com a CAPITANIA DOS PORTOS.' },
              { icon: '🌊', title: 'Sustentabilidade', desc: 'Navegamos com respeito ao meio ambiente e às comunidades locais que dependem do mar.' },
              { icon: '❤️', title: 'Hospitalidade', desc: 'A tradição caiçara de acolher bem está no DNA de cada passeio que oferecemos.' },
              { icon: '⭐', title: 'Experiência', desc: 'Anos navegando as baías de Paraty nos tornaram especialistas em criar memórias inesquecíveis.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'var(--sand)', borderRadius: '1rem', padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', color: 'var(--ocean-deep)', marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--ocean-deep)', borderRadius: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.625rem', color: 'white', marginBottom: '0.75rem' }}>
              Pronto para navegar com a gente?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.72)', marginBottom: '1.5rem' }}>
              Escolha sua escuna e reserve pelo WhatsApp.
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
