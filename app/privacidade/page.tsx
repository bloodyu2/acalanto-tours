import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Acalanto Tours',
  description: 'Saiba como coletamos e usamos seus dados pessoais. Confira a política de privacidade da Acalanto Tours.',
}

export default function PrivacidadePage() {
  return (
    <main style={{ padding: '6rem 0 4rem', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}>
          ← Voltar para o início
        </Link>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Política de Privacidade
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.875rem' }}>
          Última atualização: maio de 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.75, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Quem somos</h2>
            <p>A Acalanto Tours é uma agência de turismo náutico localizada em Paraty, RJ. Operamos passeios de escuna, fotografia profissional e serviços exclusivos para visitantes da região.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Dados que coletamos</h2>
            <p>Quando você faz uma reserva ou entra em contato conosco, podemos coletar:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Número de telefone/WhatsApp</li>
              <li>Dados da reserva (data, passeio escolhido, número de passageiros)</li>
              <li>Dados de navegação (cookies de análise, com seu consentimento)</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Como usamos seus dados</h2>
            <p>Usamos suas informações exclusivamente para:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Confirmar e processar sua reserva</li>
              <li>Entrar em contato via WhatsApp ou e-mail sobre sua visita</li>
              <li>Enviar informações práticas (horários, ponto de encontro, o que levar)</li>
              <li>Melhorar nosso site e serviços (dados de analytics, de forma agregada e anônima)</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Cookies</h2>
            <p>Utilizamos cookies para análise de acesso (Google Analytics) e funcionamento básico do site. Ao acessar nosso site, você pode aceitar ou recusar cookies opcionais pelo banner de consentimento. Cookies essenciais para o funcionamento do site não podem ser recusados.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Seus direitos (LGPD)</h2>
            <p>Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar, corrigir ou excluir seus dados</li>
              <li>Revogar consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos seus dados</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Contato</h2>
            <p>Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato:</p>
            <p style={{ marginTop: '0.5rem' }}>WhatsApp: <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}`} style={{ color: 'var(--ocean-mid)', textDecoration: 'none', fontWeight: 500 }}>Clique aqui</a></p>
          </section>
        </div>
      </div>
    </main>
  )
}
