import type { Metadata } from 'next'
import ContactSection from '@/components/home/ContactSection'

export const metadata: Metadata = {
  title: 'Fale Conosco | Acalanto Tours',
  description: 'Entre em contato com a Acalanto Tours. Tire suas dúvidas sobre passeios de escuna em Paraty, reservas e serviços. Respondemos pelo WhatsApp e e-mail.',
}

export default function ContatoPage() {
  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, var(--ocean-deep) 0%, var(--ocean-mid) 100%)',
          padding: '8rem 0 4rem',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div className="container">
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              padding: '0.35rem 1rem',
              borderRadius: '2rem',
              marginBottom: '1.25rem',
              fontFamily: 'var(--font-jakarta)',
            }}
          >
            Fale Conosco
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}
          >
            Pronto para navegar?
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: '1.0625rem',
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: 1.65,
            }}
          >
            Nossa equipe responde rapidamente pelo WhatsApp ou e-mail. Estamos aqui para tornar sua experiência em Paraty inesquecível.
          </p>
        </div>
      </section>

      {/* Contact form section */}
      <ContactSection />
    </>
  )
}
