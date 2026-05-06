export const dynamic = 'force-dynamic'

import Link from 'next/link'
import HeroSection from '@/components/home/HeroSection'
import VerticalsSection from '@/components/home/VerticalsSection'
import ToursSection from '@/components/home/ToursSection'
import ServicesSection from '@/components/home/ServicesSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <VerticalsSection />
      <ToursSection />
      <ServicesSection />
      <TestimonialsSection />

      {/* Fale Conosco CTA */}
      <section style={{ padding: '5rem 0', background: 'white', textAlign: 'center' }}>
        <div className="container">
          <span className="section-tag">Fale Conosco</span>
          <h2 className="section-title" style={{ maxWidth: '480px', margin: '0 auto 1rem' }}>
            Pronto para navegar?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', lineHeight: 1.65, maxWidth: '460px', margin: '0 auto 2.5rem' }}>
            Nossa equipe responde rapidamente pelo WhatsApp ou e-mail. Tire todas as suas dúvidas.
          </p>
          <Link href="/contato" className="btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
            Entrar em contato
          </Link>
        </div>
      </section>
    </>
  )
}
