-- Add new columns for profile management
ALTER TABLE public.institution_profiles
ADD COLUMN IF NOT EXISTS location TEXT;

-- Create institution_posts table for Facebook-like posting
CREATE TABLE IF NOT EXISTS public.institution_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES public.institution_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  links JSONB DEFAULT '[]'::jsonb,
  is_pinned BOOLEAN DEFAULT FALSE,
  post_type TEXT DEFAULT 'general', -- 'general', 'scholarship', 'announcement'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scholarship_applications table for custom application forms
CREATE TABLE IF NOT EXISTS public.scholarship_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL, -- 'external_link' or 'custom_form'
  external_link TEXT,
  form_fields JSONB DEFAULT '[]'::jsonb, -- For custom form fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_applications table to track student applications
CREATE TABLE IF NOT EXISTS public.student_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  application_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add additional fields to scholarships
ALTER TABLE public.scholarships
ADD COLUMN IF NOT EXISTS eligibility_criteria TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT,
ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]'::jsonb;

-- Enable RLS on new tables
ALTER TABLE public.institution_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for institution_posts
CREATE POLICY "Anyone can view institution posts"
  ON public.institution_posts FOR SELECT
  USING (true);

CREATE POLICY "Institutions can manage own posts"
  ON public.institution_posts FOR ALL
  USING (
    institution_id IN (
      SELECT id FROM public.institution_profiles
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for scholarship_applications
CREATE POLICY "Anyone can view scholarship applications"
  ON public.scholarship_applications FOR SELECT
  USING (true);

CREATE POLICY "Institutions can manage own scholarship applications"
  ON public.scholarship_applications FOR ALL
  USING (
    scholarship_id IN (
      SELECT s.id FROM public.scholarships s
      JOIN public.institution_profiles ip ON s.institution_id = ip.id
      WHERE ip.user_id = auth.uid()
    )
  );

-- RLS Policies for student_applications
CREATE POLICY "Students can view own applications"
  ON public.student_applications FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can submit applications"
  ON public.student_applications FOR INSERT
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Institutions can view applications to their scholarships"
  ON public.student_applications FOR SELECT
  USING (
    scholarship_id IN (
      SELECT s.id FROM public.scholarships s
      JOIN public.institution_profiles ip ON s.institution_id = ip.id
      WHERE ip.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_institution_posts_updated_at
  BEFORE UPDATE ON public.institution_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarship_applications_updated_at
  BEFORE UPDATE ON public.scholarship_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_applications_updated_at
  BEFORE UPDATE ON public.student_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();