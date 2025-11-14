-- Create user_bans table for account suspension tracking
CREATE TABLE public.user_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  banned_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_bans
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

-- Admin can manage bans
CREATE POLICY "Admins can manage bans"
ON public.user_bans
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add website and additional fields to institution_profiles
ALTER TABLE public.institution_profiles
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- Create index on user_bans for performance
CREATE INDEX idx_user_bans_user_id ON public.user_bans(user_id);
CREATE INDEX idx_user_bans_active ON public.user_bans(is_active) WHERE is_active = true;