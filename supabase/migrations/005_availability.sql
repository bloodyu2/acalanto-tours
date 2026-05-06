-- ============================================================
-- 005_availability.sql
-- Adds service_availability, accommodation_availability tables
-- and partner_id on bookings
-- ============================================================

-- Partner ID on bookings (for revenue attribution + dashboard)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS partner_id uuid REFERENCES partners(id) ON DELETE SET NULL;

-- Service availability (for fotografia, lancha, jeep, etc.)
CREATE TABLE IF NOT EXISTS service_availability (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id  uuid REFERENCES services(id) ON DELETE CASCADE NOT NULL,
  date        date NOT NULL,
  available   boolean NOT NULL DEFAULT true,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(service_id, date)
);

-- Also cover photographer_packages availability
CREATE TABLE IF NOT EXISTS pkg_availability (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pkg_id      uuid REFERENCES photographer_packages(id) ON DELETE CASCADE NOT NULL,
  date        date NOT NULL,
  available   boolean NOT NULL DEFAULT true,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(pkg_id, date)
);

-- Accommodation availability (for hospedagem partner listings)
CREATE TABLE IF NOT EXISTS accommodation_availability (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id  uuid REFERENCES partner_listings(id) ON DELETE CASCADE NOT NULL,
  date        date NOT NULL,
  status      text NOT NULL DEFAULT 'available'
              CHECK (status IN ('available','blocked','booked')),
  source      text DEFAULT 'manual' CHECK (source IN ('manual','ical','system')),
  notes       text,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(listing_id, date)
);

-- RLS
ALTER TABLE service_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE pkg_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_availability ENABLE ROW LEVEL SECURITY;

-- Public can read service availability
CREATE POLICY "public_read_service_avail" ON service_availability FOR SELECT USING (true);
CREATE POLICY "public_read_pkg_avail" ON pkg_availability FOR SELECT USING (true);
CREATE POLICY "public_read_accomm_avail" ON accommodation_availability FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "admin_all_service_avail" ON service_availability FOR ALL USING (is_admin());
CREATE POLICY "admin_all_pkg_avail" ON pkg_availability FOR ALL USING (is_admin());
CREATE POLICY "admin_all_accomm_avail" ON accommodation_availability FOR ALL USING (is_admin());

-- Partner can manage their own accommodation availability
CREATE POLICY "partner_own_accomm_avail_insert"
  ON accommodation_availability FOR INSERT
  WITH CHECK (
    listing_id IN (
      SELECT pl.id FROM partner_listings pl
      JOIN partners p ON p.id = pl.partner_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "partner_own_accomm_avail_update"
  ON accommodation_availability FOR UPDATE
  USING (
    listing_id IN (
      SELECT pl.id FROM partner_listings pl
      JOIN partners p ON p.id = pl.partner_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- Service role bypass
CREATE POLICY "service_role_accomm_avail" ON accommodation_availability FOR ALL USING (auth.role() = 'service_role');
