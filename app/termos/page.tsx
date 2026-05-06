import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso — Acalanto Tours',
  description: 'Leia os termos e condições de uso da plataforma Acalanto Tours.',
}

export default function TermosPage() {
  return (
    <main style={{ padding: '6rem 0 4rem', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}>
          ← Voltar para o início
        </Link>

        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Termos de Uso
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.875rem' }}>
          Última atualização: maio de 2026
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: 1.75, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Aceitação dos termos</h2>
            <p>Ao realizar uma reserva ou usar qualquer serviço da Acalanto Tours, você concorda com estes termos. Se não concordar, por favor não realize reservas.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Reservas e confirmação</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>A reserva é confirmada apenas após o pagamento integral ser processado.</li>
              <li>Após a confirmação, você receberá um comprovante com os detalhes do passeio.</li>
              <li>As informações prestadas no momento da reserva (nome, contato, número de passageiros) são de responsabilidade do cliente.</li>
              <li>Vagas são limitadas e a confirmação é por ordem de pagamento.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Responsabilidades da Acalanto Tours</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Garantir a realização do passeio conforme descrito, salvo impedimentos climáticos ou de força maior.</li>
              <li>Manter as embarcações em condições de segurança e com os equipamentos obrigatórios.</li>
              <li>Avisar os clientes com antecedência em caso de cancelamento por parte da empresa.</li>
              <li>Em caso de cancelamento pela Acalanto Tours, o cliente receberá reembolso integral ou crédito para nova data.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Responsabilidades do cliente</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Chegar no local e horário indicados. Atrasos podem impossibilitar o embarque sem direito a reembolso.</li>
              <li>Seguir as orientações da tripulação durante todo o passeio.</li>
              <li>Não trazer substâncias ilegais a bordo.</li>
              <li>Responsabilizar-se por danos causados à embarcação por descuido próprio.</li>
              <li>Menores de 18 anos devem estar acompanhados de responsável legal.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Condições climáticas</h2>
            <p>Os passeios dependem de condições climáticas favoráveis. Em caso de mau tempo que comprometa a segurança, o passeio pode ser cancelado ou remarcado. Não haverá cobrança adicional na remarcação. Consulte nossa{' '}<Link href="/cancelamento" style={{ color: 'var(--ocean-mid)', textDecoration: 'none' }}>política de cancelamento</Link>.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Propriedade intelectual</h2>
            <p>Todo o conteúdo deste site (textos, fotos, vídeos, marcas) é de propriedade da Acalanto Tours. A reprodução sem autorização prévia é proibida.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Contato</h2>
            <p>Em caso de dúvidas sobre estes termos, fale conosco pelo{' '}<a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}`} style={{ color: 'var(--ocean-mid)', textDecoration: 'none', fontWeight: 500 }}>WhatsApp</a>.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
