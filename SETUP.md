# MCE Silver Reunion — Setup Guide

## Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) account

---

## Step 1 — Install Dependencies

```bash
cd /Users/apple/Documents/MCE25
npm install
```

---

## Step 2 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `mce25-reunion`
3. Choose a strong database password
4. Select **Singapore** region (closest to India)
5. Wait for it to spin up (~2 min)

---

## Step 3 — Set Environment Variables

```bash
cp .env.local.example .env.local
```

Then fill in `.env.local` with your Supabase values:
- **URL**: Project Settings → API → Project URL
- **Anon Key**: Project Settings → API → anon public key

---

## Step 4 — Run Database Migrations

In the Supabase Dashboard → **SQL Editor**:

1. Open `supabase/migrations/001_initial_schema.sql` → Paste → Run
2. Open `supabase/migrations/002_alumni_whitelist.sql` → Paste → Run

---

## Step 5 — Create Storage Buckets

In Supabase Dashboard → **Storage** → New Bucket:

| Bucket Name | Public |
|-------------|--------|
| `memories`  | ✅ Yes |
| `avatars`   | ✅ Yes |
| `reunion`   | ✅ Yes |

---

## Step 6 — Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 7 — Create the First Admin

1. Register with any valid SPRNO (e.g. `97087`)
2. In Supabase SQL Editor, run:

```sql
-- Replace with your actual user UUID (from Auth → Users)
update profiles
set role = 'super_admin', status = 'approved', onboarding_complete = true
where id = 'your-user-uuid-here';
```

3. Reload the app — you're in!

---

## Step 8 — Seed the Reunion Event

In Supabase SQL Editor:

```sql
insert into reunion_events (title, description, event_date, venue, created_by)
values (
  'MCE Silver Reunion 2026',
  '25-year reunion of Mookambigai College of Engineering batch 1997-2001.',
  '2026-06-27 09:00:00+05:30',
  'Mookambigai College of Engineering, Pudukkottai, Tamil Nadu',
  'your-super-admin-uuid-here'
);
```

---

## Step 9 — Approve Members

When alumni register, approve them from the SQL editor:

```sql
-- Approve all pending users at once (use carefully)
update profiles set status = 'approved' where status = 'pending';

-- Or approve one by one:
update profiles set status = 'approved' where sprno = '97087';
```

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Add the same env vars in Vercel → Project → Settings → Environment Variables.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + Framer Motion |
| Backend/DB | Supabase (Postgres + Auth + Storage) |
| AI (Phase 2) | LangChain + OpenAI |
| Deployment | Vercel |
