import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hotelaria em Paraty',
  description: 'Em breve: hoteis, pousadas e airbnbs parceiros proximos ao pier para pacotes combinados de hospedagem + passeio de escuna em Paraty.',
}

export default function HotelariaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
