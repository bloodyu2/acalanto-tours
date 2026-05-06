-- =====================================================
-- Acalanto Marketplace — Schema Extensions
-- Migration 002
-- =====================================================

-- Capacity overrides per boat per date (admin can override default 50%)
CREATE TABLE IF NOT EXISTS capacity_overrides (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  boat_id     uuid REFERENCES boats(id) ON DELETE CASCADE NOT NULL,
  tour_date   date NOT NULL,
  capacity    int NOT NULL,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(boat_id, tour_date)
);

-- UTM tracking events
CREATE TABLE IF NOT EXISTS utm_events (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_slug    text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  session_id      text,
  created_at      timestamptz DEFAULT now()
);

-- Infinity Pay payments
CREATE TABLE IF NOT EXISTS payments (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id          uuid REFERENCES bookings(id) ON DELETE SET NULL,
  infinity_pay_id     text,
  amount_cents        int NOT NULL,
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  pix_code            text,
  pix_expiry          timestamptz,
  commission_rate     numeric(4,2) DEFAULT 30.00,
  utm_campaign        text,
  paid_at             timestamptz,
  raw_webhook         jsonb,
  created_at          timestamptz DEFAULT now()
);

-- Photographer packages (vertical fotografia)
CREATE TABLE IF NOT EXISTS photographer_packages (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id      uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  slug            text NOT NULL UNIQUE,
  description     text,
  price_label     text,
  price_cents     int,
  duration_label  text,
  includes        text[] DEFAULT '{}',
  cover_image     text,
  active          boolean DEFAULT true,
  display_order   int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- Partner public pages (UTM landing pages)
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

-- NPS surveys sent post-booking
CREATE TABLE IF NOT EXISTS nps_surveys (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id      uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  token           text NOT NULL UNIQUE,
  token_expires   timestamptz NOT NULL,
  score           int CHECK (score BETWEEN 0 AND 10),
  comment         text,
  submitted_at    timestamptz,
  sent_at         timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- Monthly payouts to partners
CREATE TABLE IF NOT EXISTS payouts (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id      uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  period_month    text NOT NULL,
  gross_cents     int NOT NULL DEFAULT 0,
  commission_cents int NOT NULL DEFAULT 0,
  net_cents       int NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(partner_id, period_month)
);

-- Product roadmap kanban
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

-- Extend bookings for marketplace
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vertical text DEFAULT 'passeios' CHECK (vertical IN ('passeios','fotografia','servicos'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS photographer_package_id uuid REFERENCES photographer_packages(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_rate numeric(4,2) DEFAULT 30.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- RLS
ALTER TABLE capacity_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolution_tasks ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION is_partner()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid() AND role = 'partner'
  );
$$;

-- Public reads
CREATE POLICY "public_read_photographer_packages" ON photographer_packages FOR SELECT USING (active = true);
CREATE POLICY "public_read_partner_pages" ON partner_pages FOR SELECT USING (active = true);

-- Public inserts
CREATE POLICY "public_insert_utm_events" ON utm_events FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "admin_all_capacity" ON capacity_overrides FOR ALL USING (is_admin());
CREATE POLICY "admin_all_utm" ON utm_events FOR ALL USING (is_admin());
CREATE POLICY "admin_all_payments" ON payments FOR ALL USING (is_admin());
CREATE POLICY "admin_all_photographer_packages" ON photographer_packages FOR ALL USING (is_admin());
CREATE POLICY "admin_all_partner_pages" ON partner_pages FOR ALL USING (is_admin());
CREATE POLICY "admin_all_nps" ON nps_surveys FOR ALL USING (is_admin());
CREATE POLICY "admin_all_payouts" ON payouts FOR ALL USING (is_admin());
CREATE POLICY "admin_all_evolution" ON evolution_tasks FOR ALL USING (is_admin());

-- Service role bypass (for API routes)
CREATE POLICY "service_role_nps" ON nps_surveys FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_payments" ON payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_bookings_update" ON bookings FOR UPDATE USING (auth.role() = 'service_role');
