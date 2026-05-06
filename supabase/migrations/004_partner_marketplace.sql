-- ============================================================
-- 004_partner_marketplace.sql
-- Adds marketplace columns to partners + creates partner_listings
-- ============================================================

-- Auth user binding (allows partner to log in and own their record)
ALTER TABLE partners ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Approval workflow
-- Default 'approved' preserves existing rows; new onboarding sets 'pending' in code
ALTER TABLE partners ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved'
  CONSTRAINT partners_status_check CHECK (status IN ('pending','approved','rejected'));

ALTER TABLE partners ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

-- Claim flow
ALTER TABLE partners ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Unique index for auth_user_id lookups
CREATE UNIQUE INDEX IF NOT EXISTS partners_auth_user_id_idx ON partners(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- ============================================================
-- partner_listings: one partner can have multiple listings
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_listings (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id   uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  type         text NOT NULL CHECK (type IN ('hospedagem','fotografia','jeep','guia')),
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  description  text,
  price_label  text,
  cover_image  text,
  gallery      text[] DEFAULT '{}',
  metadata     jsonb DEFAULT '{}',
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason text,
  active       boolean DEFAULT true,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS partner_listings_updated_at ON partner_listings;
CREATE TRIGGER partner_listings_updated_at
  BEFORE UPDATE ON partner_listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE partner_listings ENABLE ROW LEVEL SECURITY;

-- Public can read approved active listings
CREATE POLICY "public_read_approved_listings"
  ON partner_listings FOR SELECT
  USING (status = 'approved' AND active = true);

-- Partner can read their own listings
CREATE POLICY "partner_own_listings_select"
  ON partner_listings FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "partner_own_listings_insert"
  ON partner_listings FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "partner_own_listings_update"
  ON partner_listings FOR UPDATE
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE auth_user_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "admin_all_listings"
  ON partner_listings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- RLS for partners table updates (admin can update status)
DROP POLICY IF EXISTS "admin_all_partners" ON partners;
CREATE POLICY "admin_all_partners"
  ON partners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
