export const dynamic = 'force-dynamic'

import HeroSection from '@/components/home/HeroSection'
import ToursSection from '@/components/home/ToursSection'
import ServicesSection from '@/components/home/ServicesSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import ContactSection from '@/components/home/ContactSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ToursSection />
      <ServicesSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  )
}
