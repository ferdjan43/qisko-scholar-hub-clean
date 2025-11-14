-- Allow admins to delete institution profiles
CREATE POLICY "Admins can delete institution profiles"
ON public.institution_profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));