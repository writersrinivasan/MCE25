# MCE Silver Reunion 2026 — User & Admin Workflows

**Document Date:** June 23, 2026

---

## 1. Alumni Registration Workflow

### 1.1 New User Registration

```
STEP 1 — Verify Identity
  User visits /auth/register
  Enters SPRNO (e.g. "97326")
  → verifyWhitelist() server action
  → Queries alumni_whitelist WHERE sprno = '97326'
  → Not found: "SPRNO not found. Contact the organiser."
  → Found: Proceed to Step 2 with pre-filled branch + name

STEP 2 — Create Account
  User enters:
    • Full name (pre-filled from whitelist)
    • Email address
    • Password (min 8 chars)
  → registerAlumni() server action
  → supabase.auth.signUp()
  → Trigger creates profiles row:
      { sprno, full_name, branch, status: 'pending', is_profile_complete: false }
  → Redirect to /onboarding

STEP 3 — Onboarding (Multi-step)
  Step 1: Photo & Bio
    • Upload avatar (max 5MB) → Supabase Storage: avatars/{uid}/avatar.{ext}
    • Write personal bio
  Step 2: Location & Work
    • Current city + country
    • Current job title + company
    • Social links (LinkedIn, Twitter, GitHub, website)
  Step 3: Skills
    • Add professional skills (tag input)
  → UPDATE profiles SET is_profile_complete = true
  → Redirect to /pending-approval

STEP 4 — Pending Approval
  User sees waiting screen
  Admin is notified (visible in /admin/members pending count)
  Admin approves → status = 'approved'
  User can now access full platform

Total time: ~5 minutes for registration + onboarding
```

### 1.2 Returning User Login

```
User visits /auth/login
  → Email + password
  → supabase.auth.signInWithPassword()
  → Middleware checks:
      is_profile_complete? → No → /onboarding
      status = pending?    → Yes → /pending-approval
      status = approved?   → Yes → /dashboard
```

---

## 2. Admin Approval Workflow

### 2.1 Approving New Members

```
Admin visits /admin/members
  → Sees "Pending" tab with count badge
  → Each pending member shows:
      Name, SPRNO, Branch, Location, Join date

  APPROVE:
    Click ✅ → UPDATE profiles SET status = 'approved'
    Member moves to "Approved" tab instantly (optimistic UI)
    Member can now log in and access the platform

  REJECT:
    Click ❌ → UPDATE profiles SET status = 'rejected'
    Member removed from pending list
    Member sees "account rejected" if they try to log in
```

### 2.2 Role Management

```
Admin visits /admin/members → Approved tab
  → Find a member
  → Click 🛡️ Shield icon → role = 'admin'
  → Admin can then:
      • Access /admin panel
      • Post announcements
      • Manage event
      • Cannot modify other admins (only super_admin can)

  Super admin (Srinivasan R, SPRNO 97326) can:
      • Demote admins back to member (Trash icon)
      • Access all admin functions
```

### 2.3 Announcement Workflow

```
Admin visits /admin/announcements
  → Click "New Announcement"
  → Enter Title + Message body
  → Toggle "Pin to top" (optional)
  → Click "Post Announcement"
  → Announcement appears on all approved alumni's feeds
  → Pinned announcements stay at top

  Managing existing announcements:
  → 📌 Pin / Unpin: toggles pinned state
  → 🗑️ Delete: removes permanently
```

### 2.4 Reunion Event Management

```
Admin visits /admin/event
  → If no event exists: "Create Event" form shown
  → Fill in:
      • Event Title (default: "MCE Silver Reunion 2026")
      • Date & Time (date-time picker)
      • Venue (default: MCE, Pudukkottai)
      • Description
  → Save → stored in reunion_events table
  → Alumni can now RSVP at /reunion
  → Admin sees live RSVP counts: Attending / Maybe / Can't Come
  → RSVP progress bar shows % breakdown
```

---

## 3. Memory Sharing Workflow

### 3.1 Posting a Memory

```
User visits /memories/CSE (or ECE/EEE/MECH/PE or /memories/all)
  → Click "Share a memory, photo, or video…"
  → Upload panel expands

  Choose type:
  ┌─────────────────────────────────────────────┐
  │ TEXT  │ PHOTO  │ VIDEO  │ LINK              │
  └─────────────────────────────────────────────┘

  TEXT memory:
    Title (optional) + Text content
    → INSERT memories { content, branch, year_of_memory }

  PHOTO memory:
    Drag & drop or click → file picker
    Preview shown immediately
    Title + optional text
    → uploadFile('memories', path, file, onProgress)
    → Progress bar animates 0→100%
    → INSERT memories { media_url, media_type: 'image' }

  VIDEO memory:
    Same as photo, max 50MB
    → media_type: 'video'

  LINK memory:
    Paste URL
    → INSERT memories { link_url, media_type: 'link' }

  Year selector: 1997 | 1998 | 1999 | 2000 | 2001

  After post:
    → Memory appears at top of wall (optimistic)
    → Fire-and-forget: POST /api/ai/embed (if user has API key)
    → Embedding stored for future semantic search
```

### 3.2 Reacting to Memories

```
User sees a memory card
  → Click emoji: ❤️ 😂 🔥 👏 😭 🎓
  → UPSERT reactions { memory_id, user_id, emoji }
  → Count updates next to emoji
  → Same emoji again → removes reaction (toggle)
```

### 3.3 Commenting on Memories

```
Click 💬 comment icon → comment panel expands
  → Type comment → Enter or click Send
  → INSERT comments { memory_id, author_id, content }
  → Comment appears with author avatar + name
  → Max 40 comments shown, scrollable
```

---

## 4. AI Features Workflow

### 4.1 Setting Up AI (Per-User)

```
User visits /settings (from profile dropdown → Settings)
  → "AI Features" section shown
  → If no key: input field for OpenAI API key
  → User pastes sk-proj-... key
  → Click "Save Key"
  → Key saved to profiles.openai_api_key (server-side only)
  → router.refresh() re-fetches server state
  → NostalgiaChat widget unlocks immediately (no page reload needed)
  → ✅ "Active" badge appears

  To remove: Click 🗑️ trash icon → key cleared
  Key is displayed masked: sk-...XXXX (last 4 chars only)
```

### 4.2 Nostalgia Bot Chat

```
User clicks ✨ sparkle button (bottom-right of every page)

  WITHOUT API key:
    → "AI Features Locked" panel
    → "Add your OpenAI API key in Settings"
    → Button links to /settings
    → ! badge on sparkle button

  WITH API key:
    → Chat panel opens
    → Greeting: "Vanakkam! 🎓 I'm your MCE Nostalgia Bot..."
    → Starter suggestions:
        "Who from my batch is attending the reunion?"
        "Tell me funny memories from the college days"
        "What branch had the most memories shared?"
        "When and where is the reunion?"

  Sending a message:
    1. User types → Enter or click Send
    2. fetchContext(): POST /api/ai/search (top 5 relevant memories)
    3. POST /api/ai/chat with:
        • Full conversation history
        • Relevant memory context from Step 2
        • User's profile (name, branch, batch year)
    4. Server streams SSE chunks
    5. Text appears word-by-word in real-time
    6. Error handling:
        INVALID_API_KEY → "API key is invalid or expired. Update in Settings."
        NO_API_KEY → "Add key in Settings" link
        Network error → "Something went wrong. Please try again."
```

### 4.3 AI Memory Search

```
User visits /search (from navbar "AI Search")

  WITHOUT API key:
    → Blue banner: "Keyword search is active. Add key for semantic search."
    → "Add Key" button links to /settings
    → Search still works (keyword/ilike mode)

  WITH API key:
    → POST /api/ai/search { query, branch (optional), limit: 20 }
    → text-embedding-3-small generates 1536-dim vector
    → match_memories() RPC: HNSW cosine similarity, threshold 0.3
    → Results ranked by semantic similarity
    → Badge shows "✨ Semantic search"

  Fallback (always):
    → ilike %query% on title + content
    → Badge shows "🔤 Keyword search"

  Suggestion chips (one-click search):
    "First day of college" | "Cultural fest memories" |
    "Lab experiments gone wrong" | "Hostel life" |
    "Sports day" | "Farewell party"

  Results show:
    Branch tag (colour-coded) | Media type icon
    Title + content snippet | Author name + time ago
    Clicking → navigates to that branch's memory wall
```

---

## 5. Reunion RSVP Workflow

```
User visits /reunion
  → Live countdown: Days : Hours : Minutes : Seconds
  → Event details: Date, Venue, Description

  RSVP options:
    ✅ Attending  |  🤔 Maybe  |  ❌ Can't Come

  Click → UPSERT rsvps { event_id, user_id, status }
  → Button highlights with selected state
  → Stats update: "X people attending"
  → User can change RSVP at any time

  Then vs Now Challenge:
  → Upload "Then" photo (college days)
  → Upload "Now" photo (current)
  → UPSERT then_now_photos { then_photo_url, now_photo_url, caption }
  → Photos visible to all approved alumni
```

---

## 6. Alumni Directory Workflow

```
User visits /directory
  → Grid of all approved alumni
  → Each card: Avatar, Name, Branch (colour-coded), Location, Company
  → Filter by branch (tab selector)
  → Search by name / company / city

  Click on an alumnus → /directory/{id}
  → Full profile view:
      Avatar, Name, Branch, SPRNO, Batch year
      Current position + Company
      Bio
      Location (city, country)
      Social links (LinkedIn, Twitter, GitHub, Website)
      Skills tags
      Their memories on the platform
```

---

## 7. Global Map Workflow

```
User visits /map
  → Mapbox GL world map (dark theme)
  → Markers for every alumnus with lat/lng set
  → Cluster nearby markers
  → Click marker → popup: Name, Branch, City
  → Links to that person's profile

  Updating your location:
  → Onboarding Step 2 → city/country sets lat/lng
  → Or update via profile edit
```

---

## 8. Data Flow Summary

```
Registration   → alumni_whitelist (verify) → auth.users → profiles
Profile        → profiles → Supabase Storage (avatars bucket)
Memories       → memories → Supabase Storage (memories bucket) → embedding (async)
Reactions      → reactions (per memory per user)
Comments       → comments (per memory)
RSVP           → rsvps (per user per event)
Announcements  → announcements (admin write, all read)
AI Chat        → profiles.openai_api_key → OpenAI API → SSE stream
AI Search      → query → embedding → match_memories() → results
                           OR ilike fallback (no key needed)
```
