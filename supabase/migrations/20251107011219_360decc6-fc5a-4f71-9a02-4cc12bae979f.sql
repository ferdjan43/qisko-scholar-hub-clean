-- Student onboarding and profile data
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_onboarding BOOLEAN DEFAULT FALSE,
  interests TEXT[],
  field_of_study TEXT,
  gpa DECIMAL(3,2),
  academic_level TEXT,
  preferred_scholarship_types TEXT[],
  location_preference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = student_id);

-- Document vault
CREATE TABLE IF NOT EXISTS public.student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own documents"
  ON public.student_documents FOR ALL
  USING (auth.uid() = student_id);

-- Achievement badges
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  icon TEXT
);

ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own achievements"
  ON public.student_achievements FOR SELECT
  USING (auth.uid() = student_id);

-- Quiz favorites
CREATE TABLE IF NOT EXISTS public.quiz_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, quiz_id)
);

ALTER TABLE public.quiz_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own quiz favorites"
  ON public.quiz_favorites FOR ALL
  USING (auth.uid() = student_id);

-- Quiz attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  total_questions INTEGER,
  time_taken INTEGER,
  answers JSONB,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert quiz attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Update quizzes table to add background image and settings
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS background_image TEXT;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS time_limit INTEGER;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS sound_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;

-- Scholarship application progress tracking
ALTER TABLE public.student_applications ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;
ALTER TABLE public.student_applications ADD COLUMN IF NOT EXISTS completion_checklist JSONB DEFAULT '[]'::jsonb;

-- Update triggers
CREATE OR REPLACE FUNCTION public.update_student_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_student_profile_updated_at();

CREATE TRIGGER update_student_documents_updated_at
  BEFORE UPDATE ON public.student_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();