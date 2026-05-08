-- 016_departure_times.sql
-- Multiple departure times per boat or service (not applicable to accommodation)

CREATE TABLE IF NOT EXISTS departure_times (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boat_id       uuid REFERENCES boats(id) ON DELETE CASCADE,
  service_id    uuid REFERENCES services(id) ON DELETE CASCADE,
  time          time NOT NULL,
  label         text, -- optional friendly name, e.g. "Manhã" or "Tarde"
  active        boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  CONSTRAINT departure_times_one_entity CHECK (
    (boat_id IS NOT NULL)::int + (service_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX IF NOT EXISTS departure_times_boat_id_idx    ON departure_times(boat_id);
CREATE INDEX IF NOT EXISTS departure_times_service_id_idx ON departure_times(service_id);

-- Migrate existing single departure_time from each boat
INSERT INTO departure_times (boat_id, time, display_order)
SELECT id, departure_time, 0
FROM boats
WHERE departure_time IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add departure_time_id to bookings for capacity tracking per slot
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS departure_time_id uuid REFERENCES departure_times(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE departure_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "departure_times_public_read"
  ON departure_times FOR SELECT
  USING (active = true);

CREATE POLICY "departure_times_admin_all"
  ON departure_times FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );
