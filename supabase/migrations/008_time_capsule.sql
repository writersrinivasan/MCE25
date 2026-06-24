-- Migration 008: Time Capsule
-- One letter per user, sealed until the reunion date

CREATE TABLE IF NOT EXISTS time_capsules (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Capsule visibility"             ON time_capsules;
DROP POLICY IF EXISTS "Authors can write own capsule"  ON time_capsules;
DROP POLICY IF EXISTS "Authors can update own capsule" ON time_capsules;
DROP POLICY IF EXISTS "Authors can delete own capsule" ON time_capsules;

-- Users always see their own; everyone sees all after 27 Jun 2026 09:00 IST (03:30 UTC)
CREATE POLICY "Capsule visibility"
  ON time_capsules FOR SELECT
  USING (
    auth.uid() = author_id
    OR NOW() >= '2026-06-27 03:30:00+00'::timestamptz
  );

CREATE POLICY "Authors can write own capsule"
  ON time_capsules FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own capsule"
  ON time_capsules FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own capsule"
  ON time_capsules FOR DELETE
  USING (auth.uid() = author_id);
