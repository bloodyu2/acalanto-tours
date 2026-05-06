# Plano 01 — Schema Supabase (migrations + seed)

## Objetivo
Criar migration `002_marketplace.sql` com todas as tabelas novas do marketplace, atualizar `lib/types/database.ts` com os novos tipos, e adicionar seed de parceiros confirmados.

## Contexto
- Projeto Supabase: `hnsbstmzbidfehvycptl`
- Migration existente: `supabase/migrations/001_init.sql` — já tem: profiles, partners, boats, services, gallery, reviews, testimonials, bookings, contacts
- Arquivo de tipos: `lib/types/database.ts`
- NUNCA usar MCP supabase para executar diretamente — apenas criar os arquivos SQL e o arquivo de tipos TypeScript

## Task A — Migration 002_marketplace.sql

Criar `supabase/migrations/002_marketplace.sql` com:

### capacity_overrides
Sobrescrever capacidade de venda por boat+data:
```sql
CREATE TABLE IF NOT EXISTS capacity_overrides (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  boat_id     uuid REFERENCES boats(id) ON DELETE CASCADE NOT NULL,
  tour_date   date NOT NULL,
  capacity    int NOT NULL, -- vagas disponíveis para Acalanto nesta data
  notes       text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(boat_id, tour_date)
);
```

### utm_events
Rastrear UTMs que chegam no site:
```sql
CREATE TABLE IF NOT EXISTS utm_events (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_slug    text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  session_id      text, -- gerado no frontend
  created_at      timestamptz DEFAULT now()
);
```

### payments
Pagamentos Infinity Pay:
```sql
CREATE TABLE IF NOT EXISTS payments (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id          uuid REFERENCES bookings(id) ON DELETE SET NULL,
  infinity_pay_id     text,
  amount_cents        int NOT NULL,
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  pix_code            text,
  pix_expiry          timestamptz,
  commission_rate     numeric(4,2) DEFAULT 30.00, -- 30 ou 15
  utm_campaign        text, -- UTM do parceiro se veio via link deles
  paid_at             timestamptz,
  raw_webhook         jsonb,
  created_at          timestamptz DEFAULT now()
);
```

### photographer_packages
Pacotes de fotografia para o vertical de fotografia:
```sql
CREATE TABLE IF NOT EXISTS photographer_packages (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id      uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text,
  price_label     text,
  price_cents     int, -- null = sob consulta
  duration_label  text, -- "2h", "passeio completo", etc.
  includes        text[], -- lista de itens incluídos
  cover_image     text,
  active          boolean DEFAULT true,
  display_order   int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);
```

### partner_pages
Página pública de cada parceiro (UTM page):
```sql
CREATE TABLE IF NOT EXISTS partner_pages (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id      uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL UNIQUE,
  slug            text NOT NULL UNIQUE,
  headline        text,
  bio             text,
  cover_image     text,
  instagram_url   text,
  whatsapp_number text,
  active          boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

### nps_surveys
Pesquisas NPS pós-passeio:
```sql
CREATE TABLE IF NOT EXISTS nps_surveys (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id      uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  token           text NOT NULL UNIQUE, -- HMAC-SHA256
  token_expires   timestamptz NOT NULL,
  score           int CHECK (score BETWEEN 0 AND 10),
  comment         text,
  submitted_at    timestamptz,
  sent_at         timestamptz,
  created_at      timestamptz DEFAULT now()
);
```

### payouts
Repasses mensais para parceiros:
```sql
CREATE TABLE IF NOT EXISTS payouts (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id      uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  period_month    text NOT NULL, -- "2026-05"
  gross_cents     int NOT NULL DEFAULT 0, -- total vendido
  commission_cents int NOT NULL DEFAULT 0, -- taxa Acalanto
  net_cents       int NOT NULL DEFAULT 0, -- repasse ao parceiro
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(partner_id, period_month)
);
```

### evolution_tasks
Kanban de evoluções do produto:
```sql
CREATE TABLE IF NOT EXISTS evolution_tasks (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog','doing','done','cancelled')),
  priority    text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  category    text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
```

### Atualizar bookings — adicionar colunas para marketplace
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vertical text DEFAULT 'passeios' CHECK (vertical IN ('passeios','fotografia','servicos'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS photographer_package_id uuid REFERENCES photographer_packages(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_rate numeric(4,2) DEFAULT 30.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at timestamptz;
```

### RLS para novas tabelas
```sql
-- RLS enable
ALTER TABLE capacity_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_tasks ENABLE ROW LEVEL SECURITY;

-- Public reads
CREATE POLICY "public_read_photographer_packages" ON photographer_packages FOR SELECT USING (active = true);
CREATE POLICY "public_read_partner_pages" ON partner_pages FOR SELECT USING (active = true);

-- Public inserts
CREATE POLICY "public_insert_utm_events" ON utm_events FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_nps_surveys_response" ON nps_surveys FOR UPDATE USING (true) WITH CHECK (submitted_at IS NULL OR submitted_at IS NOT NULL);

-- Admin full access
CREATE POLICY "admin_all_capacity" ON capacity_overrides FOR ALL USING (is_admin());
CREATE POLICY "admin_all_utm" ON utm_events FOR ALL USING (is_admin());
CREATE POLICY "admin_all_payments" ON payments FOR ALL USING (is_admin());
CREATE POLICY "admin_all_photographer_packages" ON photographer_packages FOR ALL USING (is_admin());
CREATE POLICY "admin_all_partner_pages" ON partner_pages FOR ALL USING (is_admin());
CREATE POLICY "admin_all_nps" ON nps_surveys FOR ALL USING (is_admin());
CREATE POLICY "admin_all_payouts" ON payouts FOR ALL USING (is_admin());
CREATE POLICY "admin_all_evolution" ON evolution_tasks FOR ALL USING (is_admin());

-- Service role bypass
CREATE POLICY "service_role_nps" ON nps_surveys FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_payments" ON payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bookings" ON bookings FOR ALL USING (auth.role() = 'service_role');
```

### Função utilitária is_partner()
```sql
CREATE OR REPLACE FUNCTION is_partner()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid() AND role = 'partner'
  );
$$;
```

## Task B — Seed de Parceiros (003_seed_partners.sql)

Criar `supabase/migrations/003_seed_partners.sql`:

```sql
-- Parceiros confirmados
INSERT INTO partners (name, email, phone, type, active) VALUES
  ('Ilha Rasa IV', NULL, NULL, 'boat', true),
  ('Ilha Rasa V (Bob Esponja)', NULL, NULL, 'boat', true),
  ('Tânia', NULL, NULL, 'boat', true),
  ('Soberano', NULL, NULL, 'boat', true),
  ('Cherry I (Lancha Privativa)', NULL, NULL, 'boat', true),
  ('Juliane Liberato', NULL, NULL, 'photo', true),
  ('Arthur (Fotógrafo)', NULL, NULL, 'photo', true),
  ('Magno (Fotógrafo)', NULL, NULL, 'photo', true),
  ('Kai (Fotógrafo)', NULL, NULL, 'photo', true)
ON CONFLICT DO NOTHING;

-- Pacotes de fotografia
INSERT INTO photographer_packages (partner_id, name, slug, description, price_label, price_cents, duration_label, includes, display_order)
SELECT p.id, 'Registro no Passeio de Escuna', 'registro-escuna-' || lower(replace(p.name,' ','-')),
  'Fotografo(a) embarca junto e registra os melhores momentos do seu grupo durante todo o passeio.',
  'R$250', 25000, 'Passeio completo (5h)',
  ARRAY['Fotos editadas em alta resolução','Entrega digital em 48h','Até 60 fotos selecionadas'],
  1
FROM partners p WHERE p.type = 'photo' AND p.active = true;

-- Seed inicial de evolution_tasks
INSERT INTO evolution_tasks (title, description, status, priority, category) VALUES
  ('Infinity Pay — integração checkout', 'Criar endpoint /api/infinity-pay/create e webhook', 'backlog', 'urgent', 'Pagamento'),
  ('CartDrawer — componente global', 'Drawer lateral com itens, resumo e botão checkout', 'backlog', 'urgent', 'UI'),
  ('CapacityBar — barra de vagas', 'Mostrar vagas restantes na página do passeio', 'backlog', 'high', 'UI'),
  ('Magic Link Auth — Supabase', 'Login sem senha para clientes e parceiros', 'backlog', 'high', 'Auth'),
  ('Área /conta — cliente', 'Ver histórico de reservas e dados pessoais', 'backlog', 'high', 'Auth'),
  ('Área /conta/parceiro — dashboard', 'Ver reservas, capacidade e repasses', 'backlog', 'high', 'Parceiros'),
  ('NPS Survey — envio automático', 'Vercel Cron envia pesquisa 2 dias após passeio', 'backlog', 'medium', 'Email'),
  ('Admin CRM — KPIs', 'Dashboard admin com métricas do marketplace', 'backlog', 'high', 'Admin'),
  ('PWA — service worker', 'Instalar no celular, funcionar offline', 'backlog', 'medium', 'PWA'),
  ('Vertical Fotografia', 'Listagem de fotógrafos com pacotes e booking', 'backlog', 'high', 'Verticais'),
  ('Vertical Hotelaria (coming soon)', 'Página coming-soon com formulário de interesse', 'backlog', 'low', 'Verticais'),
  ('UTM tracking — comissão variável', 'Detectar UTM e calcular 30% ou 15%', 'backlog', 'high', 'Negócio'),
  ('Repasses mensais — admin', 'Calcular e marcar repasses pagos', 'backlog', 'medium', 'Financeiro'),
  ('Emails transacionais — Resend', 'Confirmação reserva, NPS, repasse', 'backlog', 'medium', 'Email'),
  ('Página /seja-parceiro', 'Formulário de candidatura de parceiros', 'backlog', 'medium', 'Parceiros'),
  ('Kanban /evolucoes', 'Dashboard de roadmap para Acalanto + Balaio', 'doing', 'high', 'Produto'),
  ('Design system Airbnb tokens', 'Tokens de cor e tipografia placeholder Airbnb', 'done', 'high', 'Design'),
  ('Homepage Phase 1', 'Hero, escunas, serviços, depoimentos, contato', 'done', 'high', 'Homepage'),
  ('Página /escunas', 'Listagem e detalhe das escunas', 'done', 'high', 'Passeios'),
  ('WhatsApp booking Phase 1', 'Booking widget que monta link WA', 'done', 'high', 'Passeios'),
  ('Admin básico', 'Login, reservas, contatos, depoimentos', 'done', 'medium', 'Admin'),
  ('SEO — metadata e sitemap', 'Title, description, OG, robots, sitemap', 'done', 'medium', 'SEO'),
  ('Humanizer pass', 'Remover textos AI gerados e travessões', 'done', 'low', 'Conteúdo'),
  ('Deploy Vercel', 'Site em produção no Vercel', 'done', 'high', 'Infra')
ON CONFLICT DO NOTHING;
```

## Task C — Atualizar lib/types/database.ts

Adicionar tipos TypeScript para todas as novas tabelas ao arquivo `lib/types/database.ts`:

Adicionar dentro da interface `Database['public']['Tables']`:

```typescript
capacity_overrides: {
  Row: {
    id: string; boat_id: string; tour_date: string; capacity: int; notes: string | null; created_at: string;
  }
  Insert: Omit<..., 'id' | 'created_at'>
  Update: Partial<Insert>
}
utm_events: {
  Row: { id: string; partner_slug: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; session_id: string | null; created_at: string; }
  Insert: Omit<..., 'id' | 'created_at'>
  Update: Partial<Insert>
}
payments: {
  Row: { id: string; booking_id: string | null; infinity_pay_id: string | null; amount_cents: number; status: 'pending'|'paid'|'failed'|'refunded'; pix_code: string | null; pix_expiry: string | null; commission_rate: number; utm_campaign: string | null; paid_at: string | null; raw_webhook: Json | null; created_at: string; }
  Insert: Omit<..., 'id' | 'created_at'>
  Update: Partial<Insert>
}
photographer_packages: {
  Row: { id: string; partner_id: string; name: string; slug: string; description: string | null; price_label: string | null; price_cents: number | null; duration_label: string | null; includes: string[]; cover_image: string | null; active: boolean; display_order: number; created_at: string; }
  Insert: Omit<..., 'id' | 'created_at'>
  Update: Partial<Insert>
}
partner_pages: {
  Row: { id: string; partner_id: string; slug: string; headline: string | null; bio: string | null; cover_image: string | null; instagram_url: string | null; whatsapp_number: string | null; active: boolean; created_at: string; updated_at: string; }
  Insert: Omit<..., 'id' | 'created_at' | 'updated_at'>
  Update: Partial<Insert>
}
nps_surveys: {
  Row: { id: string; booking_id: string; token: string; token_expires: string; score: number | null; comment: string | null; submitted_at: string | null; sent_at: string | null; created_at: string; }
  Insert: Omit<..., 'id' | 'created_at'>
  Update: Partial<Insert>
}
payouts: {
  Row: { id: string; partner_id: string; period_month: string; gross_cents: number; commission_cents: number; net_cents: number; status: 'pending'|'paid'; paid_at: string | null; notes: string | null; created_at: string; }
  Insert: Omit<..., 'id' | 'created_at'>
  Update: Partial<Insert>
}
evolution_tasks: {
  Row: { id: string; title: string; description: string | null; status: 'backlog'|'doing'|'done'|'cancelled'; priority: 'low'|'medium'|'high'|'urgent'; category: string | null; created_at: string; updated_at: string; }
  Insert: Omit<..., 'id' | 'created_at' | 'updated_at'>
  Update: Partial<Insert>
}
```

Também exportar type aliases no final do arquivo:
```typescript
export type CapacityOverride = Database['public']['Tables']['capacity_overrides']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type PhotographerPackage = Database['public']['Tables']['photographer_packages']['Row']
export type PartnerPage = Database['public']['Tables']['partner_pages']['Row']
export type NpsSurvey = Database['public']['Tables']['nps_surveys']['Row']
export type Payout = Database['public']['Tables']['payouts']['Row']
export type EvolutionTask = Database['public']['Tables']['evolution_tasks']['Row']
export type UtmEvent = Database['public']['Tables']['utm_events']['Row']
```

## Deliverables
1. `supabase/migrations/002_marketplace.sql` — schema completo
2. `supabase/migrations/003_seed_partners.sql` — seed de parceiros e evolution_tasks
3. `lib/types/database.ts` — atualizado com todos os novos tipos

## Commit
`feat(db): add marketplace schema — payments, NPS, capacity, photographer packages, partner pages, payouts, evolution tasks`
