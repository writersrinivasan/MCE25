# MCE Silver Reunion 2026 — System Architecture

**Project:** MCE'25 Alumni Reunion Portal  
**Batch:** Mookambigai College of Engineering, 1997–2001  
**Event Date:** June 27, 2026  
**Document Date:** June 23, 2026  

---

## 1. Overview

A full-stack web application that connects 309 alumni across 5 engineering branches for their 25th Silver Reunion. The platform supports memory sharing, alumni discovery, event management, reunion RSVP, and AI-powered features — all secured behind a whitelist-gated registration system.

---

## 2. Technology Stack

### Frontend
| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.3.3 |
| Language | TypeScript (strict mode) | 5.8.3 |
| Styling | Tailwind CSS v4 | 4.1.10 |
| Animation | Framer Motion | 12.15.0 |
| Icons | Lucide React | 0.511.0 |
| Date formatting | date-fns | 4.1.0 |
| File upload | react-dropzone | 14.3.8 |
| Map | react-simple-maps + OpenStreetMap (no API key) | latest |
| Font | Inter (body), Playfair Display (headings) | via next/font |

### Backend / Platform
| Layer | Technology |
|---|---|
| Database | Supabase (PostgreSQL 15) |
| Auth | Supabase Auth (email+password) |
| File Storage | Supabase Storage (S3-compatible) |
| Row-Level Security | Supabase RLS policies |
| Server Runtime | Next.js Server Components + Server Actions |
| API Routes | Next.js Route Handlers (Node.js runtime) |

### AI / ML
| Component | Technology |
|---|---|
| LLM | OpenAI GPT-4o mini (per-user key) |
| Embeddings | OpenAI text-embedding-3-small (1536 dims) |
| Vector DB | pgvector (HNSW index on Supabase) |
| Orchestration | LangChain / @langchain/openai |
| Streaming | Server-Sent Events (SSE) |

---

## 3. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  React Client│  │ Framer Motion│  │  Mapbox GL Canvas   │  │
│  │  Components  │  │  Animations  │  │  (Alumni World Map) │  │
│  └──────┬───────┘  └──────────────┘  └─────────────────────┘  │
└─────────┼───────────────────────────────────────────────────────┘
          │ HTTPS
┌─────────▼───────────────────────────────────────────────────────┐
│                     NEXT.JS 15 APP ROUTER                       │
│                   (Vercel / Node.js Runtime)                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARE.TS                          │  │
│  │  • Auth guard (redirects unauthenticated users)          │  │
│  │  • Onboarding gate (redirects incomplete profiles)       │  │
│  │  • Pending approval gate                                 │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                       │
│  ┌──────────┐  ┌────────▼────────┐  ┌──────────────────────┐  │
│  │  Static  │  │ Server Components│  │   API Route Handlers │  │
│  │  Pages   │  │  (SSR, dynamic) │  │  /api/ai/chat        │  │
│  │  / , auth│  │  dashboard,     │  │  /api/ai/search      │  │
│  │  register│  │  memories, etc. │  │  /api/ai/embed       │  │
│  └──────────┘  └────────┬────────┘  └──────────┬───────────┘  │
└───────────────────────── ┼ ──────────────────── ┼ ────────────┘
                           │                      │
          ┌────────────────▼──────────────────────▼────────────┐
          │                  SUPABASE PLATFORM                  │
          │                                                     │
          │  ┌────────────┐  ┌────────────┐  ┌─────────────┐  │
          │  │ PostgreSQL │  │  Supabase  │  │  Storage    │  │
          │  │ + pgvector │  │    Auth    │  │  Buckets    │  │
          │  │            │  │            │  │             │  │
          │  │ profiles   │  │ auth.users │  │ avatars/    │  │
          │  │ memories   │  │ sessions   │  │ memories/   │  │
          │  │ comments   │  │ JWT tokens │  │ reunion/    │  │
          │  │ reactions  │  └────────────┘  └─────────────┘  │
          │  │ rsvps      │                                     │
          │  │ announcements                                    │
          │  │ reunion_events                                   │
          │  │ then_now_photos                                  │
          │  │ alumni_whitelist                                 │
          │  └────────────┘                                     │
          └─────────────────────────────────────────────────────┘
                           │
          ┌────────────────▼────────────────┐
          │         OPENAI API              │
          │  (Per-user key — not global)    │
          │                                 │
          │  • GPT-4o mini (chat)           │
          │  • text-embedding-3-small       │
          └─────────────────────────────────┘
```

---

## 4. Database Schema

### Table: `profiles`
Extends `auth.users`. Created automatically via trigger on signup.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | References auth.users |
| sprno | text UNIQUE | Student Roll Number (e.g. 97326) |
| full_name | text | |
| branch | text | CSE / ECE / EEE / MECH / PE |
| graduation_year | integer | 1997–2001 |
| avatar_url | text | Supabase Storage URL |
| bio | text | |
| city, country | text | |
| lat, lng | numeric | For global map |
| current_position | text | Current job title |
| company | text | |
| linkedin_url | text | |
| twitter_url | text | |
| github_url | text | |
| website_url | text | |
| skills | text[] | Array of skills |
| phone | text | |
| role | enum | member / admin / super_admin |
| status | enum | pending / approved / rejected |
| is_profile_complete | boolean | Gates onboarding redirect |
| openai_api_key | text | Per-user key, server-side only |
| created_at, updated_at | timestamptz | |

### Table: `alumni_whitelist`
309 pre-loaded rows from MCE Excel sheet. Verified before registration.

| Column | Notes |
|---|---|
| sprno | Student Roll Number (must match) |
| name | Name from records |
| dept | Branch (CSE/ECE/EEE/MECH/PE) |
| batch_year | 1997–2001 |
| contact_number, country, city | Imported data |

### Table: `memories`
Branch-wise memory sharing wall.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| author_id | uuid FK → profiles | |
| branch | text | CSE/ECE/EEE/MECH/PE |
| title | text | |
| content | text | |
| media_url | text | Supabase Storage URL |
| media_type | text | image/video/audio/document/link |
| link_url | text | For link-type memories |
| year_of_memory | integer | 1997–2001 |
| tags | text[] | |
| embedding | vector(1536) | pgvector — semantic search |
| created_at | timestamptz | |

### Table: `comments`
Comments on memories.

| Column | Notes |
|---|---|
| id, memory_id FK, author_id FK | |
| content | Comment text |
| created_at | |

### Table: `reactions`
Emoji reactions on memories (❤️ 😂 🔥 👏 😭 🎓).

| Column | Notes |
|---|---|
| id, memory_id FK, user_id FK | |
| emoji | One of 6 supported emojis |

### Table: `reunion_events`
Single reunion event record (June 27, 2026).

| Column | Notes |
|---|---|
| id, title, description | |
| event_date | timestamptz |
| venue | Text address |
| created_by FK | Admin who created it |

### Table: `rsvps`
One record per user per event.

| Column | Notes |
|---|---|
| id, event_id FK, user_id FK | |
| status | attending / maybe / not_attending |

### Table: `announcements`
Admin-broadcast messages to all approved alumni.

| Column | Notes |
|---|---|
| id, author_id FK | |
| title, body | |
| pinned | Boolean — pinned stay at top |
| created_at, updated_at | |

### Table: `then_now_photos`
"Then vs Now" challenge photos.

| Column | Notes |
|---|---|
| id, user_id FK | |
| then_photo_url, now_photo_url | Supabase Storage |
| caption | |

---

## 5. Storage Buckets

| Bucket | Public | Max Size | Allowed Types |
|---|---|---|---|
| `avatars` | ✅ | 5 MB | image/* |
| `memories` | ✅ | 50 MB | image/*, video/*, audio/*, PDF |
| `reunion` | ✅ | 10 MB | image/* |

**Path convention:**  
- Avatars: `{user_id}/avatar.{ext}`  
- Memories: `{user_id}/{timestamp}.{ext}`

---

## 6. Authentication & Security Flow

```
Register flow:
  1. User enters SPRNO → verifyWhitelist() server action
  2. SPRNO matched against alumni_whitelist table
  3. If found → proceed to email/password registration
  4. supabase.auth.signUp() creates auth.users record
  5. Trigger handle_new_user() auto-creates profiles row (status='pending')
  6. Admin approves via /admin/members → status='approved'
  7. User completes onboarding → is_profile_complete=true
  8. Full access granted

Middleware guards:
  /auth/*        → Public
  /              → Public (landing)
  /* (all else)  → Requires auth.getUser()
                 → is_profile_complete=false → /onboarding
                 → status='pending'         → /pending-approval
                 → status='approved'        → allowed
  /admin/*       → role must be admin or super_admin (checked in layout)
```

### Row-Level Security
Every table has RLS enabled. Key policies:
- `profiles`: Users can read all approved profiles; only update their own
- `memories`: All approved members can read; author can delete their own
- `comments/reactions`: All approved members can create; own records only for delete
- `announcements`: Approved members read; admin/super_admin write
- `rsvps`: Own record only (upsert)
- `then_now_photos`: Own record only (upsert)

### API Key Security
- OpenAI API keys are stored per-user in `profiles.openai_api_key`
- Key is never returned to the browser (not in any `select *` to client)
- Key is fetched server-side only inside `/api/ai/*` route handlers
- User can add/remove their key at any time via `/settings`

---

## 7. AI / RAG Pipeline

```
Memory Search (Semantic):
  User types query
       │
       ▼
  POST /api/ai/search
       │
       ├─ Fetch user's openai_api_key from DB (server-side)
       │
       ├─ [Has key] → OpenAI text-embedding-3-small → 1536-dim vector
       │                    │
       │                    ▼
       │              match_memories() RPC
       │              (HNSW cosine similarity, threshold 0.3)
       │                    │
       │                    ▼
       │              Returns ranked results + similarity score
       │              Mode: "vector" ✨
       │
       └─ [No key / vector fails] → ilike keyword search
                                    Mode: "keyword" 🔤

Nostalgia Bot (Chat):
  User sends message
       │
       ▼
  1. fetchContext() → POST /api/ai/search (top 5 relevant memories)
       │
       ▼
  2. POST /api/ai/chat
       │
       ├─ Fetch user's openai_api_key
       ├─ Build system prompt with user profile + memory context
       ├─ ChatOpenAI (gpt-4o-mini, streaming=true)
       │
       ▼
  3. Server-Sent Events stream back to browser
       │
       ▼
  4. Client reads SSE chunks → appends to message in real-time

Auto-Embedding (on memory post):
  User posts memory
       │
       ├─ Memory saved to DB
       ├─ Fire-and-forget: POST /api/ai/embed { memoryId, title, content }
       │
       ├─ [Has key] → embed text → UPDATE memories SET embedding = [...]
       └─ [No key]  → silently skipped (keyword search still works)
```

---

## 8. Directory Structure

```
MCE25/
├── src/
│   ├── app/
│   │   ├── page.tsx                    Landing page
│   │   ├── layout.tsx                  Root layout (fonts, metadata)
│   │   ├── error.tsx                   Global error boundary
│   │   ├── not-found.tsx               404 page
│   │   ├── globals.css                 Tailwind v4 theme + utilities
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx          Email + password login
│   │   │   ├── register/page.tsx       SPRNO-gated registration
│   │   │   ├── register/actions.ts     verifyWhitelist(), registerAlumni()
│   │   │   └── callback/route.ts       OAuth callback (Supabase)
│   │   │
│   │   ├── onboarding/page.tsx         Multi-step profile completion
│   │   ├── pending-approval/page.tsx   Waiting room for new registrations
│   │   ├── dashboard/                  Home after login
│   │   ├── memories/[branch]/          Branch memory walls
│   │   ├── directory/                  Alumni directory + individual profiles
│   │   ├── map/                        Global alumni map (Mapbox)
│   │   ├── reunion/                    RSVP + countdown + Then vs Now
│   │   ├── search/                     AI-powered memory search
│   │   ├── settings/                   Per-user OpenAI API key management
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx              Admin guard (role check)
│   │   │   ├── page.tsx                Overview / stats dashboard
│   │   │   ├── members/                Approve / reject / promote members
│   │   │   ├── announcements/          Post / pin / delete announcements
│   │   │   └── event/                  Create / edit reunion event
│   │   │
│   │   └── api/
│   │       └── ai/
│   │           ├── chat/route.ts       Streaming LLM chat (SSE)
│   │           ├── search/route.ts     Vector + keyword search
│   │           └── embed/route.ts      Generate + store memory embeddings
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx            Navbar + NostalgiaChat wrapper
│   │   │   └── Navbar.tsx              Fixed top nav + profile dropdown
│   │   └── ai/
│   │       └── NostalgiaChat.tsx       Floating AI chat widget
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               Browser Supabase client
│   │   │   └── server.ts               Server Supabase client (cookies)
│   │   ├── storage.ts                  uploadFile(), getPublicUrl()
│   │   └── utils.ts                    cn(), getInitials(), branchColor()...
│   │
│   ├── types/
│   │   └── database.ts                 All TypeScript interfaces
│   │
│   └── middleware.ts                   Auth + routing guards
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql      8 tables, RLS, triggers
│       ├── 002_alumni_whitelist.sql    309 alumni INSERT statements
│       ├── 003_pgvector.sql            Embeddings, HNSW index, match_memories()
│       └── 004_announcements.sql       Announcements table + RLS
│
├── docs/
│   ├── ARCHITECTURE.md                 This document
│   ├── WORKFLOWS.md                    User & admin workflows
│   └── TEST_RESULTS.md                 Test outcomes & quality report
│
├── .env.local                          Supabase URL + anon key (never commit)
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 9. Branch Color System

| Branch | Color | Hex |
|---|---|---|
| CSE | Blue | `#3b82f6` |
| ECE | Green | `#22c55e` |
| EEE | Yellow | `#eab308` |
| MECH | Orange | `#f97316` |
| PE | Purple | `#a855f7` |

---

## 10. Performance Characteristics

| Metric | Detail |
|---|---|
| Static pages | `/`, `/auth/login`, `/auth/register`, `/onboarding`, `/pending-approval` pre-rendered |
| Dynamic pages | All auth-required pages use `force-dynamic` (SSR on demand) |
| First Load JS | 101 KB shared + per-route bundles (155 KB max for landing page) |
| Image optimization | Supabase CDN serves storage assets |
| Fonts | Preloaded via `next/font` (no FOUT) |
| Streaming | AI chat uses SSE — first token arrives in ~500ms |
| Vector search | HNSW index — sub-10ms for 309 records |

---

## 11. Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Supabase public API key |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `.env.local` | Mapbox GL map rendering |
| `openai_api_key` (per user) | `profiles` table | OpenAI key — stored in DB, never in env |
