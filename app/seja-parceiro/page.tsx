import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Seja Parceiro — Acalanto Turismo',
  description: 'Junte-se ao marketplace da Acalanto Turismo: fotógrafos, hospedagens, jeep/transfer e guias. Aprovação em 24h, página própria com SEO e suporte WhatsApp.',
}

const partnerTypes = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
    title: 'Fotógrafo',
    desc: 'Ofereça pacotes de fotografia profissional a bordo das escunas e em terra. Seus clientes saem de Paraty com fotos inesquecíveis.',
    gains: ['Pacotes listados no marketplace', 'Reservas diretas pela plataforma', 'Link UTM para comissão rastreável'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: 'Hospedagem',
    desc: 'Pousadas, hotéis e Airbnbs próximos ao pier. Apareça na página de hospedagem e receba contatos diretos de turistas.',
    gains: ['Galeria com fotos do seu espaço', 'Página própria com SEO', 'Contato via WhatsApp direto'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    title: 'Jeep / Transfer',
    desc: 'Serviços de transfer e passeios de jeep pelos arredores de Paraty. Alcance turistas que precisam chegar ou explorar a região.',
    gains: ['Roteiros listados na plataforma', 'Solicitações diretas de clientes', 'Visibilidade para turistas nacionais e internacionais'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Guia de Turismo',
    desc: 'Conduza experiências culturais, gastronômicas e históricas em Paraty. Conecte-se com viajantes que querem mais do que um passeio comum.',
    gains: ['Bio e foto de perfil no marketplace', 'Agenda de experiências', 'Reservas e repasses pela plataforma'],
  },
]

const steps = [
  { n: '1', label: 'Cadastro', desc: 'Crie sua conta com e-mail e senha' },
  { n: '2', label: 'Tipo', desc: 'Escolha: fotógrafo, hospedagem, jeep ou guia' },
  { n: '3', label: 'Anúncio', desc: 'Preencha seu perfil com fotos, preço e descrição' },
  { n: '4', label: 'Aprovação', desc: 'Análise em até 24h e publicação automática' },
]

const guarantees = [
  { label: 'Aprovação em 24h', desc: 'Nossa equipe analisa cada cadastro com agilidade.' },
  { label: 'Suporte WhatsApp', desc: 'Tire dúvidas diretamente com nossa equipe.' },
  { label: 'Página própria com SEO', desc: 'Seu negócio encontrado no Google por turistas.' },
  { label: 'Link UTM próprio', desc: 'Rastreie os clientes que chegaram pela Acalanto.' },
]

export default function SejaParceiroPage() {
  return (
    <main style={{ fontFamily: 'var(--font-jakarta)', color: 'var(--text-primary)' }}>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #111111 0%, #1a1a2e 55%, #2d0f20 100%)',
        padding: 'clamp(5rem, 12vw, 8rem) 1.5rem clamp(4rem, 8vw, 6rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(146,23,77,0.3)', color: 'rgba(255,255,255,0.85)',
            fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '0.3rem 0.85rem', borderRadius: '999px', marginBottom: '1.5rem',
            fontFamily: 'var(--font-mono)',
          }}>
            Marketplace de Parceiros
          </span>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', color: 'white', marginBottom: '1.25rem', lineHeight: 1.1 }}>
            Faça parte da Acalanto
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'clamp(1rem, 2vw, 1.125rem)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Conecte seu negócio a turistas de todo o Brasil. Fotógrafos, hospedagens, jeep/transfer e guias: todos têm espaço na plataforma.
          </p>
          <Link href="/parceiros/cadastro" className="btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.25rem' }}>
            Cadastrar meu negócio
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '60px' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Como funciona */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: 'white' }}>
        <div className="container" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', marginBottom: '0.75rem' }}>Como funciona</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>4 passos simples para seu negócio estar no ar.</p>
        </div>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {steps.map(({ n, label, desc }) => (
            <div key={n} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{
                width: '3rem', height: '3rem', background: 'linear-gradient(135deg, var(--ocean-mid), var(--sunset))',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'white', fontSize: '1rem',
              }}>{n}</div>
              <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', marginBottom: '0.5rem' }}>{label}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tipos de parceiro */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: 'var(--sand)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', marginBottom: '0.75rem' }}>Tipos de parceiro</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.65 }}>Cada tipo de negócio tem seu próprio perfil, benefícios e visibilidade.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {partnerTypes.map(({ icon, title, desc, gains }) => (
              <div key={title} style={{ background: 'white', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--ocean-mid)', marginBottom: '1rem' }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.125rem', marginBottom: '0.625rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '1rem' }}>{desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {gains.map(g => (
                    <li key={g} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ocean-mid)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comissionamento */}
      <section style={{ padding: 'clamp(4rem, 8vw, 5rem) 1.5rem', background: 'white' }}>
        <div className="container" style={{ maxWidth: '640px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', marginBottom: '0.75rem' }}>Comissionamento</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Nossa estrutura de comissão é transparente e alinhada com o crescimento do seu negócio. Entre em contato para conhecer as condições completas.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}?text=Olá, tenho interesse em ser parceiro da Acalanto Turismo. Gostaria de saber as condições de comissionamento.`}
            className="btn-outline"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex' }}
          >
            Falar pelo WhatsApp
          </a>
        </div>
      </section>

      {/* Garantias */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: 'var(--sand)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', marginBottom: '0.75rem' }}>Garantias da plataforma</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {guarantees.map(({ label, desc }) => (
              <div key={label} style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.5rem' }}>{label}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: 'linear-gradient(160deg, #111111 0%, #1a1a2e 55%, #2d0f20 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'white', marginBottom: '1rem' }}>
            Pronto para começar?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Cadastro gratuito, aprovação em 24h e seu negócio no ar para turistas de todo o Brasil.
          </p>
          <Link href="/parceiros/cadastro" className="btn-white" style={{ fontSize: '1rem', padding: '1rem 2.25rem' }}>
            Cadastrar meu negócio
          </Link>
        </div>
      </section>

    </main>
  )
}
