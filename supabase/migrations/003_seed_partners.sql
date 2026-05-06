-- =====================================================
-- Acalanto — Seed Parceiros Confirmados + Evolution Tasks
-- Migration 003
-- =====================================================

-- Confirmed partners (boats + photographers)
-- NOTE: "Resta 1" is NOT included (exclusivity with another agency)
INSERT INTO partners (name, type, active) VALUES
  ('Ilha Rasa IV', 'boat', true),
  ('Ilha Rasa V', 'boat', true),
  ('Tania', 'boat', true),
  ('Soberano', 'boat', true),
  ('Cherry I', 'boat', true),
  ('Juliane Liberato', 'photo', true),
  ('Arthur', 'photo', true),
  ('Magno', 'photo', true),
  ('Kai', 'photo', true)
ON CONFLICT DO NOTHING;

-- Photographer packages (one base package per photographer)
INSERT INTO photographer_packages (partner_id, name, slug, description, price_label, price_cents, duration_label, includes, display_order)
SELECT
  p.id,
  'Registro no Passeio de Escuna',
  'registro-escuna-' || lower(regexp_replace(p.name, '[^a-zA-Z0-9]', '-', 'g')),
  'Fotografo(a) embarca junto e registra os melhores momentos do seu grupo durante todo o passeio. Fotos editadas entregues em 48h.',
  'R$250',
  25000,
  'Passeio completo (5h)',
  ARRAY['Fotos editadas em alta resolucao','Entrega digital em 48h','Ate 60 fotos selecionadas'],
  1
FROM partners p
WHERE p.type = 'photo' AND p.active = true;

-- Evolution tasks seed (30 items)
INSERT INTO evolution_tasks (title, description, status, priority, category) VALUES
  ('Infinity Pay checkout', 'Endpoint /api/infinity-pay/create e webhook', 'backlog', 'urgent', 'Pagamento'),
  ('CartDrawer componente global', 'Drawer lateral com itens e botao checkout', 'backlog', 'urgent', 'UI'),
  ('CapacityBar vagas restantes', 'Barra de vagas na pagina do passeio', 'backlog', 'high', 'UI'),
  ('Magic Link Auth', 'Login sem senha para clientes e parceiros', 'backlog', 'high', 'Auth'),
  ('Area /conta cliente', 'Historico de reservas e dados pessoais', 'backlog', 'high', 'Auth'),
  ('Area /conta/parceiro dashboard', 'Ver reservas, capacidade e repasses', 'backlog', 'high', 'Parceiros'),
  ('NPS Survey envio automatico', 'Vercel Cron envia pesquisa 2 dias apos passeio', 'backlog', 'medium', 'Email'),
  ('Admin CRM KPIs', 'Dashboard admin com metricas do marketplace', 'backlog', 'high', 'Admin'),
  ('PWA Service Worker', 'Instalar no celular, funcionar offline', 'backlog', 'medium', 'PWA'),
  ('Vertical Fotografia', 'Listagem de fotografos com pacotes', 'backlog', 'high', 'Verticais'),
  ('Vertical Hotelaria coming soon', 'Pagina coming-soon com formulario interesse', 'backlog', 'low', 'Verticais'),
  ('UTM tracking comissao variavel', 'Detectar UTM e calcular 30% ou 15%', 'backlog', 'high', 'Negocio'),
  ('Repasses mensais admin', 'Calcular e marcar repasses pagos', 'backlog', 'medium', 'Financeiro'),
  ('Emails transacionais Resend', 'Confirmacao reserva, NPS, repasse', 'backlog', 'medium', 'Email'),
  ('Pagina seja-parceiro', 'Formulario de candidatura de parceiros', 'backlog', 'medium', 'Parceiros'),
  ('Kanban /evolucoes', 'Dashboard de roadmap para Acalanto + Balaio', 'doing', 'high', 'Produto'),
  ('Admin moderacao avaliacoes', 'Aprovar e responder avaliacoes de clientes', 'backlog', 'medium', 'Admin'),
  ('Admin gestao capacidade', 'Override de capacidade por data e barco', 'backlog', 'medium', 'Admin'),
  ('Paginas /parceiros/[slug]', 'Landing page UTM de cada parceiro', 'backlog', 'medium', 'Parceiros'),
  ('Vertical Servicos coming soon', 'Jeep, transfer e lancha privativa', 'backlog', 'low', 'Verticais'),
  ('SearchBar global', 'Busca por passeios, datas e servicos', 'backlog', 'medium', 'UI'),
  ('Mobile bottom nav', 'Navegacao inferior para mobile', 'backlog', 'medium', 'UI'),
  ('Checkout /sucesso pagina', 'Confirmacao pos-pagamento', 'backlog', 'high', 'Pagamento'),
  ('Relatório noturno parceiro', 'Cron manda disponibilidade do dia seguinte', 'backlog', 'medium', 'Email'),
  ('Design system Airbnb tokens', 'Tokens de cor e tipografia placeholder', 'done', 'high', 'Design'),
  ('Homepage Phase 1', 'Hero, escunas, servicos, depoimentos, contato', 'done', 'high', 'Homepage'),
  ('Pagina escunas listagem e detalhe', 'Listagem e pagina individual de cada escuna', 'done', 'high', 'Passeios'),
  ('WhatsApp booking Phase 1', 'Booking widget com link WA pre-preenchido', 'done', 'high', 'Passeios'),
  ('Admin basico login reservas contatos', 'Login, reservas, contatos, depoimentos', 'done', 'medium', 'Admin'),
  ('Deploy Vercel CI/CD', 'Site em producao com deploy automatico', 'done', 'high', 'Infra')
ON CONFLICT DO NOTHING;
