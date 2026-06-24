-- Migration 006: Create storage buckets for file uploads
-- Idempotent — safe to run multiple times

-- 1. Create / update buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',  'avatars',  true,  5242880,  ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('memories', 'memories', true, 52428800,  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','audio/mpeg','audio/wav','application/pdf']),
  ('reunion',  'reunion',  true, 10485760,  ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage RLS policies — drop first so re-runs don't fail

-- avatars
DROP POLICY IF EXISTS "Avatar images are publicly readable"    ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar"      ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar"      ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar"      ON storage.objects;

CREATE POLICY "Avatar images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- memories
DROP POLICY IF EXISTS "Memory files are publicly readable"        ON storage.objects;
DROP POLICY IF EXISTS "Approved members can upload memory files"  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own memory files"   ON storage.objects;

CREATE POLICY "Memory files are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memories');

CREATE POLICY "Approved members can upload memory files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'memories'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status::text = 'approved'
    )
  );

CREATE POLICY "Users can delete their own memory files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'memories'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- reunion
DROP POLICY IF EXISTS "Reunion files are publicly readable"        ON storage.objects;
DROP POLICY IF EXISTS "Approved members can upload reunion files"  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own reunion files"   ON storage.objects;

CREATE POLICY "Reunion files are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reunion');

CREATE POLICY "Approved members can upload reunion files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'reunion'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND status::text = 'approved'
    )
  );

CREATE POLICY "Users can delete their own reunion files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'reunion'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
