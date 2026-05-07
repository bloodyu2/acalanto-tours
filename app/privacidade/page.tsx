import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Acalanto Turismo',
  description: 'Saiba como coletamos e usamos seus dados pessoais. Confira a política de privacidade da Acalanto Turismo.',
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
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>1. Quem somos</h2>
            <p>A Acalanto Turismo opera uma <strong>plataforma digital de intermediação</strong> que conecta viajantes a prestadores de serviços turísticos independentes em Paraty, RJ — incluindo armadores de embarcações, fotógrafos, guias e outros parceiros.</p>
            <p style={{ marginTop: '0.75rem' }}>Somos o controlador dos dados que você nos fornece diretamente ao usar esta plataforma. Os dados que você fornece diretamente ao prestador de serviço (parceiro) durante ou após a execução do serviço estão sujeitos à política de privacidade daquele parceiro.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>2. Dados que coletamos</h2>
            <p>Coletamos apenas os dados necessários para intermediar sua reserva e melhorar a plataforma:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Dados de contato:</strong> nome, e-mail, número de telefone/WhatsApp.</li>
              <li><strong>Dados da solicitação:</strong> serviço escolhido, data pretendida, número de participantes, faixa etária (adulto/criança).</li>
              <li><strong>Dados de navegação:</strong> páginas acessadas, origem do acesso, dispositivo — coletados via Google Analytics apenas com seu consentimento.</li>
              <li><strong>Avaliações:</strong> nota e comentário que você opte por deixar sobre um serviço contratado.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>Não coletamos dados de pagamento diretamente. Quando aplicável, o processamento de pagamentos ocorre por meio de parceiros financeiros (ex.: Pix, cartão) que possuem suas próprias políticas de privacidade.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>3. Finalidade do tratamento</h2>
            <p>Usamos seus dados exclusivamente para:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Encaminhar sua solicitação de reserva ao parceiro prestador do serviço escolhido.</li>
              <li>Confirmar disponibilidade e facilitar o contato entre você e o parceiro via WhatsApp.</li>
              <li>Enviar informações logísticas relevantes (ponto de embarque, horário, o que levar).</li>
              <li>Melhorar a plataforma com base em dados de uso agregados e anônimos.</li>
              <li>Cumprir obrigações legais e regulatórias.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>Não utilizamos seus dados para publicidade de terceiros nem os vendemos, alugamos ou cedemos para fins comerciais a nenhuma empresa.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>4. Compartilhamento de dados</h2>
            <p>Seus dados são compartilhados <strong>apenas com o parceiro responsável pelo serviço que você solicitou</strong>, na medida necessária para a execução da reserva. Esse compartilhamento é condição essencial para a prestação do serviço intermediado.</p>
            <p style={{ marginTop: '0.75rem' }}>Também podemos compartilhar dados com:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Autoridades públicas, quando exigido por lei ou ordem judicial.</li>
              <li>Provedores de infraestrutura tecnológica (ex.: Supabase, Vercel) que processam dados em nosso nome, sob contrato e com garantias de segurança.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>5. Cookies e rastreamento</h2>
            <p>Utilizamos dois tipos de cookies:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li><strong>Essenciais:</strong> necessários para o funcionamento básico da plataforma. Não podem ser recusados.</li>
              <li><strong>Analíticos (Google Analytics):</strong> coletam dados de navegação de forma agregada para melhorar o site. Ativados apenas após seu consentimento, que pode ser revogado a qualquer momento pelo banner de cookies.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>6. Retenção de dados</h2>
            <p>Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política ou por prazo exigido pela legislação aplicável. Dados de reservas são retidos por até 5 anos para fins fiscais e de defesa em processos judiciais ou administrativos.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>7. Seus direitos (LGPD)</h2>
            <p>Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Confirmar a existência de tratamento dos seus dados.</li>
              <li>Acessar os dados que temos sobre você.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Solicitar a portabilidade dos seus dados a outro fornecedor.</li>
              <li>Revogar o consentimento a qualquer momento, sem prejuízo da licitude do tratamento anterior.</li>
              <li>Opor-se a tratamentos realizados com fundamento em legítimo interesse.</li>
            </ul>
            <p style={{ marginTop: '0.75rem' }}>Para exercer qualquer desses direitos, entre em contato conosco pelo canal abaixo. Responderemos em até 15 dias úteis.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>8. Segurança</h2>
            <p>Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, perda, alteração ou divulgação indevida — incluindo criptografia em trânsito (HTTPS) e controle de acesso restrito aos sistemas internos.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>9. Alterações nesta política</h2>
            <p>Esta política pode ser atualizada periodicamente. A versão vigente estará sempre disponível nesta página, com a data da última revisão. O uso continuado da plataforma após alterações implica aceitação da nova versão.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>10. Contato</h2>
            <p>Para exercer seus direitos, esclarecer dúvidas ou registrar uma reclamação sobre privacidade, entre em contato:</p>
            <p style={{ marginTop: '0.5rem' }}>
              WhatsApp:{' '}
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5524999627968'}`} style={{ color: 'var(--ocean-mid)', textDecoration: 'none', fontWeight: 500 }}>
                Clique aqui
              </a>
            </p>
            <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Encarregado de dados (DPO): a ser designado — enquanto não designado, o responsável é o próprio controlador.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
