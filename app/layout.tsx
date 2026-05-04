import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Acalanto Tours — Passeios de Escuna em Paraty",
  description: "Passeios inesquecíveis de escuna em Paraty. Conheça as baías e ilhas da Costa Verde a bordo das nossas embarcações.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
