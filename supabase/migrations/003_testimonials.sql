-- Create testimonials table if it does not exist
CREATE TABLE IF NOT EXISTS testimonials (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name  text NOT NULL,
  author_city  text,
  content      text NOT NULL,
  rating       int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  approved     boolean NOT NULL DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Allow public to read approved testimonials
CREATE POLICY "public_read_approved_testimonials"
  ON testimonials FOR SELECT
  USING (approved = true);

-- Allow authenticated admins full access
CREATE POLICY "admin_all_testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
