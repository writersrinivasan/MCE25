'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { Users, Image, MapPin, Trophy, Calendar, ArrowRight, Clock, Zap } from 'lucide-react'
import { BRANCH_META, BRANCHES, type Profile, type Memory, type ReunionEvent } from '@/types/database'
import { getInitials, branchColor, timeAgo } from '@/lib/utils'

const REUNION_DATE = new Date('2026-06-27T09:00:00+05:30')

function CountdownWidget({ event }: { event: ReunionEvent | null }) {
  const now = new Date()
  const days = differenceInDays(REUNION_DATE, now)
  const hours = Math.floor(((REUNION_DATE.getTime() - now.getTime()) % 86400000) / 3600000)

  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(234,179,8,0.08), transparent)' }} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400 font-medium">Reunion Day</span>
        </div>
        <div className="text-3xl font-bold text-white mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
          {days} days
        </div>
        <div className="text-slate-400 text-sm">27 June 2026 · {hours}h remaining today</div>
        <Link href="/reunion">
          <button className="mt-4 text-xs font-medium text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
            View Details <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
      </div>
    </div>
  )
}

function MemoryCard({ memory }: { memory: Memory }) {
  const author = memory.author as Profile | undefined
  const color = branchColor(author?.branch ?? memory.branch)
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass glass-hover rounded-xl p-4 cursor-pointer"
      style={{ borderColor: `${color}20` }}
    >
      {memory.media_url && memory.media_type === 'image' && (
        <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-white/5">
          <img src={memory.media_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {memory.title && <div className="text-white text-sm font-semibold mb-1 line-clamp-2">{memory.title}</div>}
      {memory.content && <div className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">{memory.content}</div>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
            style={{ background: `${color}40` }}>
            {author?.avatar_url
              ? <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
              : getInitials(author?.full_name ?? '?')}
          </div>
          <span className="text-xs text-slate-400 truncate max-w-24">{author?.full_name?.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-2">
          {memory.branch && (
            <span className="text-xs px-1.5 py-0.5 rounded-md font-medium" style={{ background: `${color}15`, color }}>
              {memory.branch}
            </span>
          )}
          <span className="text-xs text-slate-500">{timeAgo(memory.created_at)}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardClient({
  profile, recentMemories, reunionEvent, totalAlumni
}: {
  profile: Profile
  recentMemories: Memory[]
  reunionEvent: ReunionEvent | null
  totalAlumni: number
}) {
  const meta = BRANCH_META[profile.branch]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const QUICK_LINKS = [
    { href: '/memories/CSE', label: 'CSE Wall', color: BRANCH_META.CSE.color, emoji: '💻' },
    { href: '/memories/ECE', label: 'ECE Wall', color: BRANCH_META.ECE.color, emoji: '📡' },
    { href: '/memories/EEE', label: 'EEE Wall', color: BRANCH_META.EEE.color, emoji: '⚡' },
    { href: '/memories/MECH', label: 'MECH Wall', color: BRANCH_META.MECH.color, emoji: '⚙️' },
    { href: '/memories/PE', label: 'PE Wall', color: BRANCH_META.PE.color, emoji: '🏭' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          {greeting}, {(profile.full_name ?? '').split(' ')[0] || 'Alumni'}! 👋
        </h1>
        <p className="text-slate-400">
          Welcome back to the MCE Silver Reunion portal ·{' '}
          <span style={{ color: meta.color }}>{meta.emoji} {profile.branch}</span>
          {' '}· Batch {profile.graduation_year}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Branch memory walls */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Branch Memory Walls</h2>
              <Link href="/memories" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                All walls <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_LINKS.map(link => (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="glass glass-hover rounded-xl p-3 text-center cursor-pointer"
                    style={{ borderColor: `${link.color}25` }}
                  >
                    <div className="text-2xl mb-1">{link.emoji}</div>
                    <div className="text-xs font-bold" style={{ color: link.color }}>{link.label.split(' ')[0]}</div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent memories */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Recent Memories</h2>
              <Link href={`/memories/${profile.branch}`} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                My branch <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentMemories.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">📸</div>
                <div className="text-white font-semibold mb-1">No memories yet</div>
                <div className="text-slate-400 text-sm mb-4">Be the first to share a memory on your branch wall!</div>
                <Link href={`/memories/${profile.branch}`}>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: `${meta.color}30`, border: `1px solid ${meta.color}40` }}>
                    Post a Memory
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentMemories.map(m => <MemoryCard key={m.id} memory={m} />)}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Countdown */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <CountdownWidget event={reunionEvent} />
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" /> Batch Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Registered Alumni</span>
                <span className="text-white font-bold">{totalAlumni}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Total in Batch</span>
                <span className="text-white font-bold">309</span>
              </div>
              <div className="w-full rounded-full h-1.5 bg-white/5">
                <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalAlumni / 309) * 100)}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
              </div>
              <div className="text-xs text-slate-500">{Math.round((totalAlumni / 309) * 100)}% of batch joined</div>
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: `/memories/${profile.branch}`, label: 'Share a Memory', icon: Image, color: '#6366f1' },
                { href: '/directory', label: 'Find Batchmates', icon: Users, color: '#22c55e' },
                { href: '/reunion', label: 'RSVP for Reunion', icon: Trophy, color: '#eab308' },
                { href: '/map', label: 'View Alumni Map', icon: MapPin, color: '#f97316' },
              ].map(({ href, label, icon: Icon, color }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all group">
                    <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                    {label}
                    <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
