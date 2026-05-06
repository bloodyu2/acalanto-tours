import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Servicos em Breve',
  description: 'Em breve: jeep tour pela Mata Atlantica e transfer do aeroporto para completar sua experiencia em Paraty.',
}

export default function ServicosComingSoonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
