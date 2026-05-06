export const dynamic = 'force-dynamic'

import HeroSection from '@/components/home/HeroSection'
import VerticalsSection from '@/components/home/VerticalsSection'
import ToursSection from '@/components/home/ToursSection'
import ServicesSection from '@/components/home/ServicesSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import ContactSection from '@/components/home/ContactSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <VerticalsSection />
      <ToursSection />
      <ServicesSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  )
}
