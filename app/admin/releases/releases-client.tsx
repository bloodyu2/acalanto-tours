'use client'

const WHATSAPP_NUMBER = '5524999627968'

interface ReleaseItem {
  area: string
  title: string
  description: string
}

interface Release {
  version: string
  date: string
  title: string
  items: ReleaseItem[]
}

const RELEASES: Release[] = [
  {
    version: 'v1.1',
    date: '15 Mai 2026',
    title: 'Sprint Admin & Parceiros',
    items: [
      {
        area: 'Admin',
        title: 'Calculadora de Comissão',
        description: 'Simule o repasse de qualquer tipo de contrato — Tier 1 (15%), Tier 2 (30%), Soberano (40%) e Transfer. Acessível em /admin/calculadora.',
      },
      {
        area: 'Admin',
        title: 'Novo fluxo de cadastro de parceiro',
        description: 'Página /admin/parceiros/novo com duas abas: "Convidar por e-mail" (parceiro cria a própria senha) e "Cadastro assistido" (admin preenche todos os dados e o e-mail de boas-vindas é enviado automaticamente).',
      },
      {
        area: 'Admin',
        title: 'Modal de despesas (DespesaModal)',
        description: 'Registre e pague despesas diretamente do painel de repasses, com seletor de tipo de despesa, valor e observações.',
      },
      {
        area: 'Segurança',
        title: 'Role captador',
        description: 'Novo perfil de acesso para captadores de parceiros. Acesso restrito a /admin/parceiros, /admin/vendas e /admin/calculadora.',
      },
      {
        area: 'Galeria',
        title: 'Fix: imagens quebradas no lightbox',
        description: 'Imagens que falham ao carregar exibem agora um placeholder elegante com ícone e texto "Imagem indisponível", em vez de quebrar o layout.',
      },
      {
        area: 'Marketing',
        title: 'Banner de instalação PWA em /seja-parceiro',
        description: 'Usuários mobile que acessam a página de seja-parceiro recebem sugestão de instalar o app na tela inicial.',
      },
    ],
  },
  {
    version: 'v1.0',
    date: 'Mai 2026',
    title: 'Lançamento da plataforma',
    items: [
      { area: 'Infra',      title: 'Deploy no Vercel + domínio',        description: 'Next.js 16, Supabase, SSL configurado em acalanto-tours.vercel.app.' },
      { area: 'Passeios',   title: 'Catálogo de escunas + booking',      description: '4 embarcações com página individual, seletor de data/passageiros, carrinho e checkout.' },
      { area: 'Hospedagem', title: 'Catálogo de pousadas + booking',     description: 'Listagem de hospedagens com check-in/out, quartos, disponibilidade via iCal.' },
      { area: 'Serviços',   title: 'Fotografia, jeep, transfer',         description: 'Páginas de serviços avulsos com booking inline.' },
      { area: 'Pagamentos', title: 'Checkout ASAAS (PIX, cartão, boleto, débito)', description: 'Integração completa com os 4 métodos. CPF hasheado (LGPD). Webhook de confirmação.' },
      { area: 'Admin',      title: 'Painel admin base',                  description: 'Dashboard KPIs, reservas, capacidade, repasses, contatos, NPS, parceiros, depoimentos, blog.' },
      { area: 'Admin',      title: 'PDV — Vendas presenciais',           description: 'Wizard multi-step para vendas na bilheteria: passeio → passageiros → cliente → pagamento.' },
      { area: 'Parceiros',  title: 'Portal do parceiro',                 description: 'Dashboard com KPIs, reservas, financeiro, disponibilidade, galeria de fotos.' },
      { area: 'Segurança',  title: 'RBAC multi-role',                    description: 'Roles super_admin, pdv, tripulacao, fotografo com acesso granular por rota.' },
      { area: 'Segurança',  title: 'Hardening OWASP',                   description: 'CSP, X-Frame-Options, rate limiting, validação server-side de preços.' },
      { area: 'iCal',       title: 'Sincronização de calendário',        description: 'Feed .ics exportável por hospedagem, botões Google/Apple Calendar.' },
      { area: 'Galeria',    title: 'Lightbox de fotos nas páginas de passeio', description: 'Grid com zoom, navegação por teclado e setas, contador de fotos.' },
    ],
  },
]

const AREA_COLORS: Record<string, { bg: string; color: string }> = {
  Admin:      { bg: '#e0f2fe', color: '#0369a1' },
  Segurança:  { bg: '#fce7f3', color: '#9d174d' },
  Galeria:    { bg: '#f0fdf4', color: '#166534' },
  Marketing:  { bg: '#fef9c3', color: '#854d0e' },
  Passeios:   { bg: '#ede9fe', color: '#5b21b6' },
  Hospedagem: { bg: '#fff7ed', color: '#c2410c' },
  Serviços:   { bg: '#f0fdf4', color: '#166534' },
  Pagamentos: { bg: '#dcfce7', color: '#166534' },
  Parceiros:  { bg: '#fdf4ff', color: '#7e22ce' },
  Infra:      { bg: '#f1f5f9', color: '#475569' },
  iCal:       { bg: '#ecfeff', color: '#0e7490' },
}

function areaStyle(area: string) {
  return AREA_COLORS[area] ?? { bg: '#f1f5f9', color: '#475569' }
}

function buildReportLink(version: string) {
  const text = encodeURIComponent(`Olá! Encontrei um problema no site Acalanto (${version}): `)
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}

export function ReleasesClient() {
  return (
    <div style={{ padding: '2rem', maxWidth: '860px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: 0 }}>
            Releases
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Histórico de versões e funcionalidades entregues
          </p>
        </div>
        <a
          href={buildReportLink('última versão')}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.125rem',
            background: '#25d366', color: 'white',
            border: 'none', borderRadius: '8px',
            fontWeight: 600, fontSize: '0.875rem',
            textDecoration: 'none', cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 0 1-4.032-1.1l-.29-.172-2.868.852.852-2.868-.172-.29A7.952 7.952 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
          </svg>
          Reportar problema
        </a>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {RELEASES.map((release, ri) => (
          <div key={release.version}>
            {/* Release header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              marginBottom: '1rem', flexWrap: 'wrap',
            }}>
              <span style={{
                background: ri === 0 ? 'var(--ocean-deep)' : '#e2e8f0',
                color: ri === 0 ? 'white' : '#475569',
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700,
                padding: '0.25rem 0.75rem', borderRadius: '9999px',
              }}>
                {release.version}
              </span>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--ocean-deep)', margin: 0 }}>
                {release.title}
              </h2>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginLeft: 'auto' }}>
                {release.date}
              </span>
              {ri !== 0 && (
                <a
                  href={buildReportLink(release.version)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '0.75rem', color: '#64748b', textDecoration: 'none',
                    border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.2rem 0.5rem',
                  }}
                >
                  Reportar problema
                </a>
              )}
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '0.25rem' }}>
              {release.items.map((item, ii) => {
                const s = areaStyle(item.area)
                return (
                  <div
                    key={ii}
                    style={{
                      background: 'white', borderRadius: '10px', padding: '0.75rem 1rem',
                      border: '1px solid var(--border)',
                      display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
                    }}
                  >
                    <span style={{
                      background: s.bg, color: s.color,
                      fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                      padding: '0.2rem 0.5rem', borderRadius: '5px',
                      flexShrink: 0, marginTop: '0.1rem', whiteSpace: 'nowrap',
                    }}>
                      {item.area}
                    </span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
