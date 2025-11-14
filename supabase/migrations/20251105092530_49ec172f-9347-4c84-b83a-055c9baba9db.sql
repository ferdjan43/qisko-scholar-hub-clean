-- Add storage bucket for institution media
INSERT INTO storage.buckets (id, name, public)
VALUES ('institution-media', 'institution-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for institution media
CREATE POLICY "Institutions can upload own media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'institution-media' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM institution_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view institution media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'institution-media');

CREATE POLICY "Institutions can update own media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'institution-media' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM institution_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Institutions can delete own media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'institution-media' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM institution_profiles WHERE user_id = auth.uid()
  )
);