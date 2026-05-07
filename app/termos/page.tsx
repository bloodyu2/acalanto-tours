import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso — Acalanto Turismo',
  description: 'Leia os termos e condições de uso da plataforma Acalanto Turismo.',
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
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>1. Sobre a Acalanto Turismo</h2>
            <p>A Acalanto Turismo opera uma <strong>plataforma digital de intermediação</strong> que conecta viajantes a prestadores de serviços turísticos independentes em Paraty e região — incluindo armadores de embarcações, fotógrafos profissionais, guias turísticos e outros parceiros.</p>
            <p style={{ marginTop: '0.75rem' }}>A Acalanto <strong>não é proprietária</strong> das embarcações, equipamentos fotográficos, veículos nem de qualquer outro ativo operacional anunciado na plataforma. Cada serviço é prestado por um parceiro independente, devidamente habilitado, que responde diretamente pela sua execução.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>2. Aceitação dos termos</h2>
            <p>Ao acessar o site, solicitar uma reserva ou contratar qualquer serviço intermediado pela plataforma, você declara ter lido, compreendido e concordado com estes Termos de Uso. Se não concordar, não utilize a plataforma.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>3. Serviços intermediados</h2>
            <p>A plataforma disponibiliza a contratação dos seguintes serviços, prestados por parceiros independentes:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Passeios de escuna</strong> — realizados por armadores independentes com embarcações próprias, devidamente registradas na Capitania dos Portos.</li>
              <li><strong>Fotografia profissional</strong> — realizada por fotógrafos autônomos ou microempreendedores individuais parceiros da plataforma.</li>
              <li><strong>Passeio de jeep e trilhas</strong> — realizados por guias e operadoras locais independentes.</li>
              <li><strong>Lancha privativa</strong> — operada por armadores parceiros com frota própria.</li>
              <li><strong>Transfer</strong> — realizado por motoristas e transportadoras parceiras.</li>
              <li><strong>Hospedagem</strong> — oferecida por pousadas e meios de hospedagem parceiros, não vinculados à Acalanto.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>A lista de serviços pode ser alterada a qualquer momento, sem aviso prévio.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>4. Papel da plataforma</h2>
            <p>A Acalanto Turismo atua exclusivamente como <strong>intermediária</strong> entre o cliente e o prestador de serviço. Nossa responsabilidade se limita a:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Exibir informações sobre os serviços conforme fornecidas pelos parceiros.</li>
              <li>Facilitar o contato e a confirmação da reserva entre cliente e parceiro.</li>
              <li>Garantir que os parceiros listados possuam as habilitações mínimas exigidas pela legislação aplicável, ao tempo do seu cadastro.</li>
              <li>Oferecer canal de atendimento para dúvidas e resolução de conflitos.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>A Acalanto <strong>não responde</strong> por danos, atrasos, cancelamentos, acidentes, perdas ou quaisquer prejuízos decorrentes da execução (ou não execução) do serviço pelo parceiro, salvo dolo ou culpa grave comprovados da própria plataforma.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>5. Reservas e confirmação</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>A solicitação de reserva é enviada via WhatsApp ao parceiro responsável pelo serviço escolhido.</li>
              <li>A confirmação definitiva ocorre mediante contato do parceiro e, quando aplicável, comprovação de pagamento.</li>
              <li>As informações prestadas pelo cliente (nome, contato, número de participantes, data) são de sua exclusiva responsabilidade.</li>
              <li>Vagas são limitadas e atendidas por ordem de solicitação confirmada.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>6. Responsabilidades do cliente</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Apresentar-se no local, data e horário combinados. Atrasos podem inviabilizar o embarque sem direito a reembolso.</li>
              <li>Seguir todas as orientações de segurança da tripulação ou do prestador de serviço durante a atividade.</li>
              <li>Não portar ou consumir substâncias ilegais durante o serviço contratado.</li>
              <li>Responsabilizar-se por danos causados à embarcação, equipamentos ou propriedades do parceiro por negligência ou descuido próprio.</li>
              <li>Garantir que menores de 18 anos estejam acompanhados de responsável legal.</li>
              <li>Observar as regras e limitações específicas de cada serviço, conforme informadas pelo parceiro.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>7. Cancelamentos e remarcações</h2>
            <p>As condições de cancelamento e remarcação são definidas por cada parceiro prestador e informadas no momento da confirmação da reserva. A Acalanto recomenda que o cliente confirme diretamente com o parceiro as políticas vigentes antes de concluir a contratação.</p>
            <p style={{ marginTop: '0.75rem' }}>Em caso de condições climáticas adversas que comprometam a segurança, o parceiro responsável poderá cancelar ou remarcar o serviço. Nessas situações, não haverá acréscimo de custo para o cliente na remarcação.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>8. Parceiros e prestadores</h2>
            <p>Ao se cadastrar na plataforma, o parceiro declara possuir todas as licenças, habilitações, seguros e autorizações exigidas por lei para a prestação dos serviços anunciados. A Acalanto não realiza vistoria contínua das embarcações, equipamentos ou credenciais dos parceiros, sendo a manutenção dessas condições responsabilidade exclusiva do prestador.</p>
            <p style={{ marginTop: '0.75rem' }}>A Acalanto reserva-se o direito de remover ou suspender parceiros que não atendam aos padrões de qualidade ou segurança da plataforma, a seu critério exclusivo.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>9. Propriedade intelectual</h2>
            <p>O nome, logotipo, design e conteúdos originais do site são de propriedade da Acalanto Turismo. As fotos e descrições dos serviços podem ser de propriedade dos parceiros respectivos. A reprodução de qualquer conteúdo sem autorização prévia e por escrito é proibida.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>10. Limitação de responsabilidade</h2>
            <p>Na máxima extensão permitida pela legislação brasileira, a Acalanto Turismo não será responsável por danos indiretos, incidentais, especiais ou consequentes decorrentes do uso da plataforma ou da prestação dos serviços pelos parceiros — incluindo, sem limitação, danos pessoais, perda de objetos, atrasos ou quaisquer prejuízos financeiros.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>11. Legislação aplicável</h2>
            <p>Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de Paraty, RJ, para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>12. Contato</h2>
            <p>Em caso de dúvidas sobre estes termos ou sobre os serviços intermediados, fale conosco pelo{' '}
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}`} style={{ color: 'var(--ocean-mid)', textDecoration: 'none', fontWeight: 500 }}>WhatsApp</a>.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
