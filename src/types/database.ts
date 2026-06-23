export type Branch = 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'PE'
export type UserRole = 'member' | 'admin' | 'super_admin'
export type UserStatus = 'pending' | 'approved' | 'rejected'
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'link'
export type RSVPStatus = 'attending' | 'maybe' | 'not_attending'

export interface Profile {
  id: string
  sprno: string | null
  full_name: string
  branch: Branch
  graduation_year: number | null
  avatar_url: string | null
  bio: string | null
  city: string | null
  country: string | null
  current_position: string | null
  company: string | null
  linkedin_url: string | null
  twitter_url: string | null
  github_url: string | null
  website_url: string | null
  skills: string[]
  phone: string | null
  role: UserRole
  status: UserStatus
  is_profile_complete: boolean
  lat: number | null
  lng: number | null
  openai_api_key: string | null
  created_at: string
  updated_at: string
}

export interface AlumniWhitelist {
  id: string
  sprno: string
  name: string
  contact_number: string | null
  country: string | null
  city: string | null
  joining_event: string | null
  tshirt_size: string | null
  dept: Branch
  batch_year: number
}

export interface Memory {
  id: string
  author_id: string
  branch: Branch | null
  title: string | null
  content: string | null
  media_url: string | null
  media_type: MediaType | null
  link_url: string | null
  year_of_memory: number | null
  tags: string[]
  is_featured: boolean
  created_at: string
  author?: Profile
  reactions?: Reaction[]
  comments?: Comment[]
  _reaction_count?: number
  _comment_count?: number
}

export interface Comment {
  id: string
  memory_id: string
  author_id: string
  content: string
  created_at: string
  author?: Profile
}

export interface Reaction {
  id: string
  memory_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface ReunionEvent {
  id: string
  title: string
  description: string | null
  event_date: string
  venue: string | null
  created_by: string
  created_at: string
  rsvps?: RSVP[]
  _attending_count?: number
  _maybe_count?: number
}

export interface RSVP {
  id: string
  event_id: string
  user_id: string
  status: RSVPStatus
  profile?: Profile
}

export interface ThenNowPhoto {
  id: string
  user_id: string
  then_photo_url: string | null
  now_photo_url: string | null
  caption: string | null
  created_at: string
  profile?: Profile
}

export const BRANCH_META: Record<Branch, { label: string; color: string; bg: string; emoji: string }> = {
  CSE: { label: 'Computer Science', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', emoji: '💻' },
  ECE: { label: 'Electronics & Communication', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', emoji: '📡' },
  EEE: { label: 'Electrical & Electronics', color: '#eab308', bg: 'rgba(234,179,8,0.12)', emoji: '⚡' },
  MECH: { label: 'Mechanical Engineering', color: '#f97316', bg: 'rgba(249,115,22,0.12)', emoji: '⚙️' },
  PE: { label: 'Production Engineering', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', emoji: '🏭' },
}

export const BRANCHES: Branch[] = ['CSE', 'ECE', 'EEE', 'MECH', 'PE']
