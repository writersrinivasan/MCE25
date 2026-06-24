-- MCE Silver Reunion 2026 — Database Schema
-- Run this first in Supabase SQL Editor

-- ──────────────────────────────────────────────
-- Enable extensions
-- ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- Alumni Whitelist (verified MCE 1997-2001 batch)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alumni_whitelist (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprno          TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  contact_number TEXT,
  country        TEXT,
  city           TEXT,
  joining_event  TEXT,
  tshirt_size    TEXT,
  dept           TEXT,
  batch_year     INTEGER
);

-- ──────────────────────────────────────────────
-- Profiles (extends auth.users)
-- Column names match src/types/database.ts exactly
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email               TEXT,
  sprno               TEXT UNIQUE,
  full_name           TEXT NOT NULL DEFAULT '',
  branch              TEXT CHECK (branch IN ('CSE','ECE','EEE','MECH','PE')),
  graduation_year     INTEGER,
  avatar_url          TEXT,
  bio                 TEXT,
  city                TEXT,
  country             TEXT,
  current_position    TEXT,
  company             TEXT,
  linkedin_url        TEXT,
  twitter_url         TEXT,
  github_url          TEXT,
  website_url         TEXT,
  skills              TEXT[] NOT NULL DEFAULT '{}',
  phone               TEXT,
  role                TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','admin','super_admin')),
  status              TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  is_profile_complete BOOLEAN NOT NULL DEFAULT FALSE,
  lat                 NUMERIC,
  lng                 NUMERIC,
  openai_api_key      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- Memories
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  branch         TEXT CHECK (branch IN ('CSE','ECE','EEE','MECH','PE')),
  title          TEXT,
  content        TEXT,
  media_url      TEXT,
  media_type     TEXT CHECK (media_type IN ('image','video','audio','document','link')),
  link_url       TEXT,
  year_of_memory INTEGER,
  tags           TEXT[] NOT NULL DEFAULT '{}',
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- Comments
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id  UUID REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  author_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- Reactions
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id  UUID REFERENCES memories(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (memory_id, user_id, emoji)
);

-- ──────────────────────────────────────────────
-- Reunion Events
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reunion_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  event_date  TIMESTAMPTZ NOT NULL,
  venue       TEXT,
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- RSVPs
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsvps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID REFERENCES reunion_events(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('attending','maybe','not_attending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

-- ──────────────────────────────────────────────
-- Then vs Now Photos
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS then_now_photos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  then_photo_url TEXT,
  now_photo_url  TEXT,
  caption        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- Announcements
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  is_pinned  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- Auto-create profile on signup
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  w alumni_whitelist%ROWTYPE;
BEGIN
  SELECT * INTO w
  FROM alumni_whitelist
  WHERE sprno = (new.raw_user_meta_data->>'sprno')
  LIMIT 1;

  INSERT INTO profiles (
    id, email, sprno, full_name, branch, graduation_year,
    city, country, status, role
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'sprno', ''),
    COALESCE(new.raw_user_meta_data->>'name', w.name, split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'branch', w.dept),
    COALESCE((new.raw_user_meta_data->>'batch_year')::INTEGER, w.batch_year),
    w.city,
    w.country,
    'approved',
    'member'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ──────────────────────────────────────────────
-- Updated_at trigger
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN new.updated_at = NOW(); RETURN new; END;
$$;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ──────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE reunion_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps            ENABLE ROW LEVEL SECURITY;
ALTER TABLE then_now_photos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements    ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Public profiles readable by approved members" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Public profiles readable by approved members"
  ON profiles FOR SELECT USING (status::text = 'approved' OR auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Alumni whitelist
DROP POLICY IF EXISTS "Whitelist readable by anyone" ON alumni_whitelist;
CREATE POLICY "Whitelist readable by anyone"
  ON alumni_whitelist FOR SELECT USING (true);

-- Memories
DROP POLICY IF EXISTS "Memories readable by approved members" ON memories;
DROP POLICY IF EXISTS "Approved members can post memories" ON memories;
DROP POLICY IF EXISTS "Authors can update own memories" ON memories;
DROP POLICY IF EXISTS "Authors can delete own memories" ON memories;
CREATE POLICY "Memories readable by approved members"
  ON memories FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status::text = 'approved')
  );
CREATE POLICY "Approved members can post memories"
  ON memories FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status::text = 'approved')
  );
CREATE POLICY "Authors can update own memories"
  ON memories FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own memories"
  ON memories FOR DELETE USING (auth.uid() = author_id);

-- Comments
DROP POLICY IF EXISTS "Comments readable by approved members" ON comments;
DROP POLICY IF EXISTS "Approved members can comment" ON comments;
DROP POLICY IF EXISTS "Authors can delete own comments" ON comments;
CREATE POLICY "Comments readable by approved members"
  ON comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status::text = 'approved')
  );
CREATE POLICY "Approved members can comment"
  ON comments FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status::text = 'approved')
  );
CREATE POLICY "Authors can delete own comments"
  ON comments FOR DELETE USING (auth.uid() = author_id);

-- Reactions
DROP POLICY IF EXISTS "Reactions readable by approved members" ON reactions;
DROP POLICY IF EXISTS "Approved members can react" ON reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON reactions;
CREATE POLICY "Reactions readable by approved members"
  ON reactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status::text = 'approved')
  );
CREATE POLICY "Approved members can react"
  ON reactions FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status::text = 'approved')
  );
CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE USING (auth.uid() = user_id);

-- Reunion events
DROP POLICY IF EXISTS "Reunion events readable by approved members" ON reunion_events;
DROP POLICY IF EXISTS "Admins can manage reunion events" ON reunion_events;
CREATE POLICY "Reunion events readable by approved members"
  ON reunion_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status::text = 'approved')
  );
CREATE POLICY "Admins can manage reunion events"
  ON reunion_events FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role::text IN ('admin','super_admin'))
  );

-- RSVPs
DROP POLICY IF EXISTS "RSVPs readable by approved members" ON rsvps;
DROP POLICY IF EXISTS "Users can manage own RSVP" ON rsvps;
CREATE POLICY "RSVPs readable by approved members"
  ON rsvps FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status::text = 'approved')
  );
CREATE POLICY "Users can manage own RSVP"
  ON rsvps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Then Now Photos
DROP POLICY IF EXISTS "Then now photos readable by approved members" ON then_now_photos;
DROP POLICY IF EXISTS "Users can manage own then now photos" ON then_now_photos;
CREATE POLICY "Then now photos readable by approved members"
  ON then_now_photos FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status::text = 'approved')
  );
CREATE POLICY "Users can manage own then now photos"
  ON then_now_photos FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Announcements
DROP POLICY IF EXISTS "Announcements readable by approved members" ON announcements;
DROP POLICY IF EXISTS "Admins can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON announcements;
CREATE POLICY "Announcements readable by approved members"
  ON announcements FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status::text = 'approved')
  );
CREATE POLICY "Admins can insert announcements"
  ON announcements FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role::text IN ('admin','super_admin'))
  );
CREATE POLICY "Admins can update announcements"
  ON announcements FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role::text IN ('admin','super_admin'))
  );
CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role::text IN ('admin','super_admin'))
  );

-- ──────────────────────────────────────────────
-- Seed: Reunion Event
-- ──────────────────────────────────────────────
-- Run after creating a super_admin user:
-- INSERT INTO reunion_events (title, description, event_date, venue, created_by)
-- VALUES (
--   'MCE Silver Reunion 2026',
--   'The grand 25-year reunion of Mookambigai College of Engineering batch 1997-2001.',
--   '2026-06-27 09:00:00+05:30',
--   'Mookambigai College of Engineering, Pudukkottai, Tamil Nadu',
--   '<your-super-admin-uuid>'
-- );
