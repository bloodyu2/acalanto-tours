-- 015_partner_gallery_rls.sql
-- Allow partners to manage gallery images for their own photographer packages

-- Partners can insert gallery rows for their own photographer packages
CREATE POLICY "partner_gallery_photographer_insert"
  ON gallery FOR INSERT
  WITH CHECK (
    photographer_package_id IS NOT NULL AND
    photographer_package_id IN (
      SELECT pp.id
      FROM photographer_packages pp
      JOIN partners p ON pp.partner_id = p.id
      WHERE p.auth_user_id = auth.uid()
         OR p.id IN (
           SELECT partner_id FROM profiles
           WHERE auth_user_id = auth.uid() AND role = 'partner'
         )
    )
  );

-- Partners can delete gallery rows for their own photographer packages
CREATE POLICY "partner_gallery_photographer_delete"
  ON gallery FOR DELETE
  USING (
    photographer_package_id IS NOT NULL AND
    photographer_package_id IN (
      SELECT pp.id
      FROM photographer_packages pp
      JOIN partners p ON pp.partner_id = p.id
      WHERE p.auth_user_id = auth.uid()
         OR p.id IN (
           SELECT partner_id FROM profiles
           WHERE auth_user_id = auth.uid() AND role = 'partner'
         )
    )
  );

-- Partners can update alt_text on their own gallery rows
CREATE POLICY "partner_gallery_photographer_update"
  ON gallery FOR UPDATE
  USING (
    photographer_package_id IS NOT NULL AND
    photographer_package_id IN (
      SELECT pp.id
      FROM photographer_packages pp
      JOIN partners p ON pp.partner_id = p.id
      WHERE p.auth_user_id = auth.uid()
         OR p.id IN (
           SELECT partner_id FROM profiles
           WHERE auth_user_id = auth.uid() AND role = 'partner'
         )
    )
  );
