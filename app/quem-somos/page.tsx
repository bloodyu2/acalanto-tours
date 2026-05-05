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
              A Acalanto começou com fotografia. A equipe foi crescendo, assumindo a gestão de fotógrafos locais e criando o <strong>GFP (Grupo de Fotógrafos de Paraty)</strong>, uma associação de profissionais que trabalham nos passeios e pontos turísticos da cidade.
            </p>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
              Com o tempo, ficou claro que faltava algo em Paraty: as embarcações menores não tinham presença digital, e o turista que chegava na cidade precisava ligar para vários barcos antes de conseguir uma vaga. A Acalanto passou a centralizar isso, reunindo escunas, lanchas, jeeps, guias e fotógrafos num único canal de vendas.
            </p>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>
              <em>Acalanto</em> é uma canção de ninar, um aconchego. O nome foi escolhido para isso: que Paraty seja um lugar de descanso de verdade para quem vem visitar.
            </p>
          </div>

          {/* What we do */}
          <div style={{ marginBottom: '3rem' }}>
            <span className="section-tag">O que fazemos</span>
            <h2 className="section-title">Uma plataforma para toda Paraty</h2>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '2rem' }}>
              A Acalanto cuida da divulgação e das vendas. Os parceiros cuidam do serviço. O turista reserva tudo em um lugar só, sem precisar pesquisar em seis canais diferentes.
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
                { icon: '✅', title: 'Curadoria dos parceiros', desc: 'A Acalanto seleciona e acompanha cada parceiro. Feedback ruim chega antes para nós do que para o Google.' },
                { icon: '💬', title: 'Tudo em um lugar', desc: 'Sem precisar ligar para cinco barcos diferentes. Você vê os passeios, compara e reserva aqui.' },
                { icon: '🤝', title: 'Parceiros locais', desc: 'Trabalhamos com quem é de Paraty. O dinheiro do turismo fica circulando na cidade.' },
                { icon: '📱', title: 'Reserva pelo WhatsApp', desc: 'Sem formulário longo nem cadastro obrigatório. Manda mensagem e a gente resolve.' },
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
              Quer reservar um passeio?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '1.5rem', fontSize: '1rem' }}>
              Veja as opções e fale com a gente pelo WhatsApp.
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
