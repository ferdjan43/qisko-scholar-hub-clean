-- Add image_url column to study_materials table
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.study_materials ADD COLUMN IF NOT EXISTS description TEXT;

-- Add image_url column to quizzes table  
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to scholarships if not exists (for favorites feature)
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create scholarship_favorites table for students
CREATE TABLE IF NOT EXISTS public.scholarship_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  scholarship_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, scholarship_id)
);

-- Enable RLS
ALTER TABLE public.scholarship_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for scholarship_favorites
CREATE POLICY "Students can manage own scholarship favorites"
ON public.scholarship_favorites
FOR ALL
USING (auth.uid() = student_id);

-- Add skills and extracurricular to student_profiles if not exists
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS extracurricular TEXT[];
