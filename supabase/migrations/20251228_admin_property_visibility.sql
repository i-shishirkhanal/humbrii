-- Give Admins access to view ALL properties (including unpublished/draft)
-- This fixes the issue where Admins cannot approve new requests because they cannot see them.

DROP POLICY IF EXISTS "Admins can view all properties" ON properties;

CREATE POLICY "Admins can view all properties" ON properties
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);
