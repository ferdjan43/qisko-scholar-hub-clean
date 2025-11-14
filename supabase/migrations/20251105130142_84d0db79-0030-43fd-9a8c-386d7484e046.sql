-- Create student_materials table for downloaded materials
CREATE TABLE public.student_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  material_id UUID REFERENCES public.study_materials(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  content TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_tasks table for reminders
CREATE TABLE public.student_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  scholarship_id UUID REFERENCES public.scholarships(id),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add application_date to scholarships table
ALTER TABLE public.scholarships
ADD COLUMN IF NOT EXISTS application_date TIMESTAMP WITH TIME ZONE;

-- Enable RLS
ALTER TABLE public.student_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_materials
CREATE POLICY "Students can view own materials"
ON public.student_materials
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own materials"
ON public.student_materials
FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own materials"
ON public.student_materials
FOR UPDATE
USING (auth.uid() = student_id);

CREATE POLICY "Students can delete own materials"
ON public.student_materials
FOR DELETE
USING (auth.uid() = student_id);

-- RLS Policies for student_tasks
CREATE POLICY "Students can view own tasks"
ON public.student_tasks
FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own tasks"
ON public.student_tasks
FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own tasks"
ON public.student_tasks
FOR UPDATE
USING (auth.uid() = student_id);

CREATE POLICY "Students can delete own tasks"
ON public.student_tasks
FOR DELETE
USING (auth.uid() = student_id);

-- Create trigger for updated_at
CREATE TRIGGER update_student_materials_updated_at
BEFORE UPDATE ON public.student_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_tasks_updated_at
BEFORE UPDATE ON public.student_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();