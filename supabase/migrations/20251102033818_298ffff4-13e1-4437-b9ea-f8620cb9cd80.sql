-- Fix RLS policy for user_roles to allow users to insert their own roles during signup
CREATE POLICY "Users can insert own role during signup" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add approval status to institution profiles
ALTER TABLE public.institution_profiles 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add approved_at and approved_by columns
ALTER TABLE public.institution_profiles 
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);