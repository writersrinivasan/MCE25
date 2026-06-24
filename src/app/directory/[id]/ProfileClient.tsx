'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MapPin, Briefcase, ExternalLink, Calendar, Edit3, Image } from 'lucide-react'
import { BRANCH_META, type Profile, type Memory } from '@/types/database'
import { getInitials, branchColor, timeAgo } from '@/lib/utils'

export default function ProfileClient({
  profile, memories, isOwnProfile,
}: {
  profile: Profile
  memories: Memory[]
  isOwnProfile: boolean
  currentProfile: Profile
}) {
  const color = branchColor(profile.branch)
  const meta = BRANCH_META[profile.branch]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl overflow-hidden mb-6">
        {/* Banner */}
        <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)` }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${color}, transparent 60%)` }} />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 flex items-center justify-center font-bold text-white text-xl shrink-0"
              style={{ background: `linear-gradient(135deg, ${color}50, ${color}20)`, borderColor: '#0a0e1a' }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : getInitials(profile.full_name)}
            </div>
            {isOwnProfile && (
              <Link href="/onboarding">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white glass hover:bg-white/10 transition-all">
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </Link>
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{profile.full_name}</h1>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
              {meta?.emoji} {profile.branch}
            </span>
            <span className="text-sm text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Batch {profile.graduation_year}
            </span>
            <span className="text-sm text-slate-500 font-mono text-xs">SPRNO: {profile.sprno}</span>
          </div>

          {(profile.current_position || profile.company) && (
            <div className="flex items-center gap-2 text-slate-300 mb-1">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <span>{[profile.current_position, profile.company].filter(Boolean).join(' at ')}</span>
            </div>
          )}
          {(profile.city || profile.country) && (
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
          {profile.bio && (
            <p className="text-slate-300 text-sm leading-relaxed mt-3 pt-3 border-t border-white/5">{profile.bio}</p>
          )}
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-400 hover:text-blue-300">
              <ExternalLink className="w-4 h-4" /> View LinkedIn Profile
            </a>
          )}
        </div>
      </motion.div>

      {/* Memories */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Image className="w-4 h-4 text-slate-400" />
          Memories Shared ({memories.length})
        </h2>
        {memories.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <div className="text-4xl mb-3">📸</div>
            <div className="text-slate-400 text-sm">
              {isOwnProfile ? 'You haven\'t shared any memories yet.' : `${profile.full_name.split(' ')[0]} hasn't shared any memories yet.`}
            </div>
            {isOwnProfile && (
              <Link href={`/memories/${profile.branch}`}>
                <button className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: `${color}30`, border: `1px solid ${color}40` }}>
                  Share your first memory
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {memories.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl overflow-hidden">
                {m.media_url && m.media_type === 'image' && (
                  <div className="w-full bg-black/30 flex items-center justify-center">
                    <img src={m.media_url} alt={m.title ?? ''} className="w-full h-auto max-h-48 object-contain" />
                  </div>
                )}
                <div className="p-4">
                  {m.title && <div className="text-white font-medium text-sm mb-1">{m.title}</div>}
                  {m.content && <div className="text-slate-400 text-xs line-clamp-3">{m.content}</div>}
                  <div className="text-xs text-slate-500 mt-2">{timeAgo(m.created_at)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
