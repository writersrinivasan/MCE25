-- Migration 007: Add missing UPDATE policies for storage buckets
-- Needed for avatar upsert (same fixed path per user)
-- Idempotent — safe to run multiple times

DROP POLICY IF EXISTS "Users can update their own memory files"   ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own reunion files"  ON storage.objects;

-- avatars: UPDATE policy already exists from migration 006
-- just ensure it's correct by re-creating it
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING  (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- memories: UPDATE policy for users who re-upload to same path (edge case)
CREATE POLICY "Users can update their own memory files"
  ON storage.objects FOR UPDATE TO authenticated
  USING  (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);

-- reunion: UPDATE policy for users who re-upload to same path
CREATE POLICY "Users can update their own reunion files"
  ON storage.objects FOR UPDATE TO authenticated
  USING  (bucket_id = 'reunion' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'reunion' AND (storage.foldername(name))[1] = auth.uid()::text);
