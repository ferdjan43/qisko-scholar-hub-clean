-- Allow admins to update institution profiles (for approval/rejection)
CREATE POLICY "Admins can update institution profiles"
ON public.institution_profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));