-- =====================================================
-- Acalanto Tours — Initial Schema
-- Project: hnsbstmzbidfehvycptl | No prefix (dedicated project)
-- =====================================================

-- Admin profiles
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role          text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'partner')),
  partner_id    uuid, -- FK to partners (set after partners table created)
  created_at    timestamptz DEFAULT now()
);

-- Partners (boat operators, photographers, jeep guides, etc.)
CREATE TABLE IF NOT EXISTS partners (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name              text NOT NULL,
  email             text,
  phone             text,
  type              text NOT NULL DEFAULT 'boat' CHECK (type IN ('boat','photo','jeep','guide','transfer','hotel','other')),
  active            boolean DEFAULT true,
  internal_rating   numeric(2,1) DEFAULT 5.0, -- internal NPS score (not public)
  notes             text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

-- Boats / Escunas
CREATE TABLE IF NOT EXISTS boats (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug                  text NOT NULL UNIQUE,
  name                  text NOT NULL,
  tagline               text,
  description           text,
  partner_id            uuid REFERENCES partners(id) ON DELETE SET NULL,
  capacity_max          int NOT NULL DEFAULT 50,
  capacity_min          int NOT NULL DEFAULT 1,
  departure_time        time NOT NULL DEFAULT '10:30',
  duration_hours        numeric(3,1) NOT NULL DEFAULT 5.0,
  price_adult           int NOT NULL, -- cents
  price_child           int NOT NULL DEFAULT 0, -- cents (half price 6-10 years)
  child_free_until_age  int NOT NULL DEFAULT 5,  -- up to and including this age: free
  child_half_until_age  int NOT NULL DEFAULT 10, -- up to and including this age: half
  features              text[] DEFAULT '{}',
  itinerary             jsonb DEFAULT '[]', -- [{stop:"...",minutes:40}]
  cover_image           text,
  active                boolean DEFAULT true,
  display_order         int DEFAULT 0,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Services (lancha privativa, foto, jeep, transfer, etc.)
CREATE TABLE IF NOT EXISTS services (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL,
  description   text,
  price_label   text,
  cover_image   text,
  partner_id    uuid REFERENCES partners(id) ON DELETE SET NULL,
  active        boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- Gallery
CREATE TABLE IF NOT EXISTS gallery (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  boat_id       uuid REFERENCES boats(id) ON DELETE CASCADE,
  service_id    uuid REFERENCES services(id) ON DELETE CASCADE,
  url           text NOT NULL,
  alt_text      text,
  display_order int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- Internal reviews (NOT public — used for partner management)
CREATE TABLE IF NOT EXISTS reviews (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id    uuid, -- FK to bookings
  partner_id    uuid REFERENCES partners(id) ON DELETE SET NULL,
  boat_id       uuid REFERENCES boats(id) ON DELETE SET NULL,
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  public        boolean DEFAULT false, -- admin decides if visible publicly
  created_at    timestamptz DEFAULT now()
);

-- Testimonials (public-facing, moderated)
CREATE TABLE IF NOT EXISTS testimonials (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name   text NOT NULL,
  author_city   text,
  content       text NOT NULL,
  rating        int CHECK (rating BETWEEN 1 AND 5),
  approved      boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- Bookings (WhatsApp phase — records what was sent to WhatsApp)
CREATE TABLE IF NOT EXISTS bookings (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  boat_id        uuid REFERENCES boats(id) ON DELETE SET NULL,
  tour_date      date NOT NULL,
  adults         int NOT NULL DEFAULT 1,
  children       int NOT NULL DEFAULT 0,
  total_cents    int NOT NULL,
  customer_name  text,
  customer_phone text,
  customer_email text,
  status         text NOT NULL DEFAULT 'whatsapp_initiated'
                 CHECK (status IN ('whatsapp_initiated','confirmed','cancelled','no_show')),
  notes          text,
  created_at     timestamptz DEFAULT now()
);

-- Contacts / Lead forms
CREATE TABLE IF NOT EXISTS contacts (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text NOT NULL,
  phone       text,
  email       text,
  message     text NOT NULL,
  read        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners     ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats        ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts     ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Public reads
CREATE POLICY "public_read_boats"        ON boats        FOR SELECT USING (active = true);
CREATE POLICY "public_read_services"     ON services     FOR SELECT USING (active = true);
CREATE POLICY "public_read_gallery"      ON gallery      FOR SELECT USING (true);
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT USING (approved = true);

-- Public inserts
CREATE POLICY "public_insert_bookings"     ON bookings     FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_contacts"     ON contacts     FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_testimonials" ON testimonials FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "admin_all_profiles"     ON profiles     FOR ALL USING (is_admin());
CREATE POLICY "admin_all_partners"     ON partners     FOR ALL USING (is_admin());
CREATE POLICY "admin_all_boats"        ON boats        FOR ALL USING (is_admin());
CREATE POLICY "admin_all_services"     ON services     FOR ALL USING (is_admin());
CREATE POLICY "admin_all_gallery"      ON gallery      FOR ALL USING (is_admin());
CREATE POLICY "admin_all_reviews"      ON reviews      FOR ALL USING (is_admin());
CREATE POLICY "admin_all_testimonials" ON testimonials FOR ALL USING (is_admin());
CREATE POLICY "admin_all_bookings"     ON bookings     FOR ALL USING (is_admin());
CREATE POLICY "admin_all_contacts"     ON contacts     FOR ALL USING (is_admin());

-- =====================================================
-- Seed data
-- =====================================================

INSERT INTO boats (slug, name, tagline, description, capacity_max, departure_time, duration_hours, price_adult, price_child, child_free_until_age, child_half_until_age, features, itinerary, display_order) VALUES
(
  'ilha-rasa-iv', 'Ilha Rasa IV', 'Clássica com gastronomia caiçara',
  'Uma viagem com o sabor da culinária local a bordo. Cenário do filme Crepúsculo. Perfeita para aliar navegação e gastronomia em Paraty.',
  50, '11:00', 5.0, 11000, 5500, 5, 10,
  ARRAY['gastronomia','cultural'],
  '[{"stop":"Praia Conceição","minutes":40},{"stop":"Praia da Lula","minutes":40},{"stop":"Praia de Santa Rita","minutes":40},{"stop":"Praia Vermelha","minutes":40}]'::jsonb,
  1
),
(
  'ilha-rasa-v', 'Ilha Rasa V', 'Familiar, kids e pet friendly',
  'A escolha perfeita para famílias. Escorregador a bordo, pet friendly e paradas em praias paradisíacas com Aquário Natural.',
  50, '11:00', 5.0, 11000, 5500, 5, 10,
  ARRAY['pet-friendly','kids','escorregador','familiar'],
  '[{"stop":"Ilha dos Cocos","minutes":40},{"stop":"Praia da Conceição","minutes":40},{"stop":"Aquário Natural","minutes":40},{"stop":"Praia da Lula","minutes":40}]'::jsonb,
  2
),
(
  'tania', 'Tânia', 'Premium com ofurô panorâmico',
  'A experiência mais sofisticada da baía. Ofurô panorâmico, pet friendly e roteiro completo com 6 paradas deslumbrantes.',
  50, '10:30', 5.5, 11000, 5500, 5, 10,
  ARRAY['premium','pet-friendly','ofuro'],
  '[{"stop":"Ilha dos Cocos","minutes":30},{"stop":"Praia da Lula","minutes":40},{"stop":"Lagoa Azul","minutes":40},{"stop":"Ilha Comprida","minutes":30},{"stop":"Praia Vermelha","minutes":40},{"stop":"Ilha do Mantimento","minutes":20}]'::jsonb,
  3
),
(
  'soberano', 'Soberano', 'Contemplativa — 40 minutos por parada',
  'Para quem quer aproveitar cada momento sem pressa. 40 minutos em cada ponto, águas calmas e o melhor da Baía de Paraty.',
  50, '10:30', 5.0, 10000, 5000, 5, 10,
  ARRAY['contemplativa'],
  '[{"stop":"Ilha dos Cocos","minutes":40},{"stop":"Praia da Lula","minutes":40},{"stop":"Lagoa Azul","minutes":40},{"stop":"Praia Vermelha","minutes":40},{"stop":"Ilha do Mantimento","minutes":20}]'::jsonb,
  4
);

INSERT INTO services (slug, name, description, price_label, display_order) VALUES
  ('lancha-privativa', 'Lancha Privativa', 'Passeio exclusivo nos pontos mais bonitos da Baía de Paraty. Combine suas paradas, horários e duração.', 'Sob consulta', 1),
  ('fotografia', 'Fotografia Profissional', 'Registre cada momento com nosso serviço de fotografia profissional a bordo.', 'Sob consulta', 2),
  ('passeio-de-jeep', 'Passeio de Jeep', 'Aventure-se pelas trilhas e estradas históricas da Costa Verde.', 'Sob consulta', 3),
  ('transfer', 'Transfer', 'Transfer confortável de e para Paraty com motoristas experientes.', 'Sob consulta', 4);
