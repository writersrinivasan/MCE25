-- MCE Silver Reunion 2026 — Database Schema
-- Run this first in Supabase SQL Editor

-- ──────────────────────────────────────────────
-- Enable extensions
-- ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────
-- Alumni Whitelist (verified MCE 1997-2001 batch)
-- ──────────────────────────────────────────────
create table if not exists alumni_whitelist (
  id             uuid primary key default gen_random_uuid(),
  sprno          text unique not null,
  name           text not null,
  contact_number text,
  country        text,
  city           text,
  joining_event  text,
  tshirt_size    text,
  dept           text,
  batch_year     integer
);

-- ──────────────────────────────────────────────
-- Profiles (extends auth.users)
-- ──────────────────────────────────────────────
create table if not exists profiles (
  id                  uuid references auth.users on delete cascade primary key,
  sprno               text unique,
  name                text not null default '',
  branch              text check (branch in ('CSE','ECE','EEE','MECH','PE')),
  batch_year          integer,
  avatar_url          text,
  bio                 text,
  city                text,
  country             text,
  current_role        text,
  company             text,
  linkedin_url        text,
  phone               text,
  role                text not null default 'member' check (role in ('member','admin','super_admin')),
  status              text not null default 'pending' check (status in ('pending','approved','rejected')),
  onboarding_complete boolean not null default false,
  lat                 numeric,
  lng                 numeric,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- Memories
-- ──────────────────────────────────────────────
create table if not exists memories (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid references profiles(id) on delete cascade not null,
  branch          text check (branch in ('CSE','ECE','EEE','MECH','PE')),
  title           text,
  content         text,
  media_url       text,
  media_type      text check (media_type in ('image','video','audio','document','link')),
  link_url        text,
  year_of_memory  integer,
  tags            text[] not null default '{}',
  is_featured     boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- Comments
-- ──────────────────────────────────────────────
create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  memory_id   uuid references memories(id) on delete cascade not null,
  author_id   uuid references profiles(id) on delete cascade not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- Reactions
-- ──────────────────────────────────────────────
create table if not exists reactions (
  id          uuid primary key default gen_random_uuid(),
  memory_id   uuid references memories(id) on delete cascade not null,
  user_id     uuid references profiles(id) on delete cascade not null,
  emoji       text not null,
  created_at  timestamptz not null default now(),
  unique (memory_id, user_id, emoji)
);

-- ──────────────────────────────────────────────
-- Reunion Events
-- ──────────────────────────────────────────────
create table if not exists reunion_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  event_date  timestamptz not null,
  venue       text,
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- RSVPs
-- ──────────────────────────────────────────────
create table if not exists rsvps (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references reunion_events(id) on delete cascade not null,
  user_id     uuid references profiles(id) on delete cascade not null,
  status      text not null check (status in ('attending','maybe','not_attending')),
  created_at  timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ──────────────────────────────────────────────
-- Then vs Now Photos
-- ──────────────────────────────────────────────
create table if not exists then_now_photos (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade not null,
  then_photo_url  text,
  now_photo_url   text,
  caption         text,
  created_at      timestamptz not null default now()
);

-- ──────────────────────────────────────────────
-- Auto-create profile on signup
-- ──────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  w alumni_whitelist%rowtype;
begin
  -- Look up whitelist by sprno from user metadata
  select * into w
  from alumni_whitelist
  where sprno = (new.raw_user_meta_data->>'sprno')
  limit 1;

  insert into profiles (id, sprno, name, branch, batch_year, city, country, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'sprno', ''),
    coalesce(new.raw_user_meta_data->>'name', w.name, split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'branch', w.dept),
    coalesce((new.raw_user_meta_data->>'batch_year')::integer, w.batch_year),
    w.city,
    w.country,
    'pending'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ──────────────────────────────────────────────
-- Updated_at trigger
-- ──────────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

-- ──────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────
alter table profiles enable row level security;
alter table memories enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;
alter table reunion_events enable row level security;
alter table rsvps enable row level security;
alter table then_now_photos enable row level security;
alter table alumni_whitelist enable row level security;

-- Profiles
create policy "Public profiles readable by approved members"
  on profiles for select using (
    status = 'approved' or auth.uid() = id
  );
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Alumni whitelist: only readable (for SPRNO verification)
create policy "Whitelist readable by anyone"
  on alumni_whitelist for select using (true);

-- Memories: approved members can read; authors can insert/update/delete
create policy "Memories readable by approved members"
  on memories for select using (
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );
create policy "Approved members can post memories"
  on memories for insert with check (
    auth.uid() = author_id and
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );
create policy "Authors can update own memories"
  on memories for update using (auth.uid() = author_id);
create policy "Authors can delete own memories"
  on memories for delete using (auth.uid() = author_id);

-- Comments
create policy "Comments readable by approved members"
  on comments for select using (
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );
create policy "Approved members can comment"
  on comments for insert with check (
    auth.uid() = author_id and
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );
create policy "Authors can delete own comments"
  on comments for delete using (auth.uid() = author_id);

-- Reactions
create policy "Reactions readable by approved members"
  on reactions for select using (
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );
create policy "Approved members can react"
  on reactions for insert with check (
    auth.uid() = user_id and
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );
create policy "Users can delete own reactions"
  on reactions for delete using (auth.uid() = user_id);

-- Reunion events (readable by all approved)
create policy "Reunion events readable by approved members"
  on reunion_events for select using (
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );
create policy "Admins can manage reunion events"
  on reunion_events for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin','super_admin'))
  );

-- RSVPs
create policy "RSVPs readable by approved members"
  on rsvps for select using (
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );
create policy "Users can manage own RSVP"
  on rsvps for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Then Now Photos
create policy "Then now photos readable by approved members"
  on then_now_photos for select using (
    exists (select 1 from profiles where id = auth.uid() and status = 'approved')
  );
create policy "Users can manage own then now photos"
  on then_now_photos for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────
-- Seed: Reunion Event (update venue/date as needed)
-- ──────────────────────────────────────────────
-- Run this after creating a super_admin user:
-- insert into reunion_events (title, description, event_date, venue, created_by)
-- values (
--   'MCE Silver Reunion 2026',
--   'The grand 25-year reunion of Mookambigai College of Engineering batch 1997-2001. All branches, all memories, one day.',
--   '2026-06-27 09:00:00+05:30',
--   'Mookambigai College of Engineering, Pudukkottai, Tamil Nadu',
--   '<your-super-admin-uuid>'
-- );
