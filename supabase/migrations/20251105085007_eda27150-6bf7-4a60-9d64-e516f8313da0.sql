-- Add columns to institution_profiles for cover and profile photos
ALTER TABLE public.institution_profiles 
ADD COLUMN IF NOT EXISTS cover_photo_url text,
ADD COLUMN IF NOT EXISTS profile_photo_url text,
ADD COLUMN IF NOT EXISTS mission text,
ADD COLUMN IF NOT EXISTS vision text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}'::jsonb;

-- Create scholarships table
CREATE TABLE IF NOT EXISTS public.scholarships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id uuid NOT NULL REFERENCES public.institution_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  application_deadline timestamp with time zone,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutions can manage own scholarships"
ON public.scholarships
FOR ALL
USING (
  institution_id IN (
    SELECT id FROM public.institution_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view published scholarships"
ON public.scholarships
FOR SELECT
USING (status = 'published');

-- Create reviewers/study materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id uuid NOT NULL REFERENCES public.institution_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject text NOT NULL,
  file_url text,
  file_type text,
  file_size text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutions can manage own study materials"
ON public.study_materials
FOR ALL
USING (
  institution_id IN (
    SELECT id FROM public.institution_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view study materials"
ON public.study_materials
FOR SELECT
USING (true);

-- Create quizzes table (basic info, detailed creation in content hub)
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id uuid NOT NULL REFERENCES public.institution_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  subject text,
  difficulty text,
  question_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institutions can manage own quizzes"
ON public.quizzes
FOR ALL
USING (
  institution_id IN (
    SELECT id FROM public.institution_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view published quizzes"
ON public.quizzes
FOR SELECT
USING (status = 'published');

-- Add triggers for updated_at
CREATE TRIGGER update_scholarships_updated_at
BEFORE UPDATE ON public.scholarships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_materials_updated_at
BEFORE UPDATE ON public.study_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
BEFORE UPDATE ON public.quizzes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();