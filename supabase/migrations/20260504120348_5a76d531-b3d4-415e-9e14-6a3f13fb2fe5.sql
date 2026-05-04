
-- Allow admins to manage closed_periods (insert, update, delete)
CREATE POLICY "Admins can manage closed periods"
ON public.closed_periods
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
