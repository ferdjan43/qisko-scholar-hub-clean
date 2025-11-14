-- Create storage bucket for study materials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for study materials bucket
CREATE POLICY "Anyone can view study materials"
ON storage.objects FOR SELECT
USING (bucket_id = 'study-materials');

CREATE POLICY "Institutions can upload study materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'study-materials' AND
  auth.uid() IN (
    SELECT user_id FROM institution_profiles
  )
);

CREATE POLICY "Institutions can update own study materials"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'study-materials' AND
  auth.uid() IN (
    SELECT user_id FROM institution_profiles
  )
);

CREATE POLICY "Institutions can delete own study materials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'study-materials' AND
  auth.uid() IN (
    SELECT user_id FROM institution_profiles
  )
);