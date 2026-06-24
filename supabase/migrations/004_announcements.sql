-- Announcements table (run in Supabase SQL Editor)
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references public.profiles(id) on delete set null,
  title       text not null,
  body        text not null,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- Approved members and admins can read announcements
create policy "Approved members can view announcements"
  on public.announcements for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and (status = 'approved' or role::text in ('branch_admin', 'super_admin'))
    )
  );

-- Only admins can write announcements
create policy "Admins can insert announcements"
  on public.announcements for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role::text in ('branch_admin','super_admin'))
  );

create policy "Admins can update announcements"
  on public.announcements for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role::text in ('branch_admin','super_admin'))
  );

create policy "Admins can delete announcements"
  on public.announcements for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role::text in ('branch_admin','super_admin'))
  );
