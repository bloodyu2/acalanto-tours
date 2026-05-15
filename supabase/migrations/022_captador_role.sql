-- Add 'captador' to the allowed roles in admin_users
ALTER TABLE admin_users
  DROP CONSTRAINT IF EXISTS admin_users_role_check;

ALTER TABLE admin_users
  ADD CONSTRAINT admin_users_role_check
  CHECK (role IN ('super_admin', 'pdv', 'tripulacao', 'fotografo', 'captador'));
