-- Allow users to insert their own host role (to become a host)
CREATE POLICY "Users can request host role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id AND role = 'host');