'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { differenceInDays } from 'date-fns'
import {
  Users, MapPin, Trophy, Calendar, ArrowRight, Clock, Zap,
  CheckCircle2, Circle, PartyPopper, X, Image, Sparkles,
} from 'lucide-react'
import { BRANCH_META, type Profile, type Memory, type ReunionEvent } from '@/types/database'
import { getInitials, branchColor, timeAgo } from '@/lib/utils'

const REUNION_DATE = new Date('2026-06-27T09:00:00+05:30')

// ─── Welcome Banner ───────────────────────────────────────────────────────────
function WelcomeBanner({ name, branch }: { name: string; branch: string }) {
  const [visible, setVisible] = useState(true)
  const meta = BRANCH_META[branch as keyof typeof BRANCH_META]
  if (!visible) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="relative rounded-2xl p-5 mb-6 overflow-hidden"
      style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12))', border: '1px solid rgba(99,102,241,0.3)' }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(234,179,8,0.06), transparent)' }} />
      <button
        onClick={() => setVisible(false)}
        className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-4 relative z-10">
        <div className="text-3xl shrink-0">🎉</div>
        <div>
          <div className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            Welcome to MCE Silver Reunion, {name}!
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Your account is ready. You're now part of the {meta?.emoji} {branch} family on this portal.
            Follow the steps below to get fully set up and reconnect with your batchmates.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Getting Started Checklist ────────────────────────────────────────────────
function GettingStarted({
  profile,
  guidanceData,
}: {
  profile: Profile
  guidanceData: { hasMemory: boolean; hasRSVP: boolean; hasLocation: boolean }
}) {
  const steps = [
    {
      done: true,
      label: 'Joined the portal',
      subtext: 'SPRNO verified — you\'re in!',
      link: null,
      cta: null,
    },
    {
      done: !!profile.is_profile_complete,
      label: 'Complete your profile',
      subtext: 'Add your photo, bio, and current role',
      link: '/onboarding',
      cta: 'Complete profile →',
    },
    {
      done: guidanceData.hasMemory,
      label: 'Share your first memory',
      subtext: `Post a photo or story on the ${profile.branch} wall`,
      link: `/memories/${profile.branch}`,
      cta: 'Share a memory →',
    },
    {
      done: guidanceData.hasRSVP,
      label: 'RSVP for the reunion',
      subtext: 'Let your batchmates know you\'re coming on 27 June',
      link: '/reunion',
      cta: 'RSVP now →',
    },
    {
      done: guidanceData.hasLocation,
      label: 'Pin your location on the map',
      subtext: 'Show where life took you after MCE',
      link: '/onboarding',
      cta: 'Add location →',
    },
  ]

  const doneCount = steps.filter(s => s.done).length
  const allDone = doneCount === steps.length
  const pct = Math.round((doneCount / steps.length) * 100)

  if (allDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-5 text-center"
      >
        <PartyPopper className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
        <div className="text-white font-semibold mb-1">You're all set!</div>
        <div className="text-slate-400 text-xs">Explore memories, connect with batchmates, and enjoy the reunion portal.</div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-violet-400" />
          Getting Started
        </h3>
        <span className="text-xs text-slate-400">{doneCount}/{steps.length} done</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-white/5 mb-4">
        <motion.div
          className="h-1.5 rounded-full"
          style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            {step.done
              ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              : <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            }
            <div className="min-w-0 flex-1">
              <div className={`text-sm font-medium ${step.done ? 'text-slate-500 line-through' : 'text-white'}`}>
                {step.label}
              </div>
              {!step.done && (
                <div className="text-xs text-slate-500 mb-1">{step.subtext}</div>
              )}
              {!step.done && step.link && step.cta && (
                <Link href={step.link}>
                  <span className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                    {step.cta}
                  </span>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Countdown ────────────────────────────────────────────────────────────────
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
            RSVP &amp; View Details <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
      </div>
    </div>
  )
}

// ─── Memory Card ──────────────────────────────────────────────────────────────
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
        <div className="w-full rounded-lg overflow-hidden mb-3 bg-black/30 flex items-center justify-center">
          <img src={memory.media_url} alt="" className="w-full h-auto max-h-40 object-contain" />
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardClient({
  profile,
  recentMemories,
  reunionEvent,
  totalAlumni,
  guidanceData,
  isWelcome,
}: {
  profile: Profile
  recentMemories: Memory[]
  reunionEvent: ReunionEvent | null
  totalAlumni: number
  guidanceData: { hasMemory: boolean; hasRSVP: boolean; hasLocation: boolean }
  isWelcome: boolean
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

  const allDone = profile.is_profile_complete && guidanceData.hasMemory && guidanceData.hasRSVP && guidanceData.hasLocation

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome banner — shows only right after onboarding */}
      <AnimatePresence>
        {isWelcome && (
          <WelcomeBanner name={(profile.full_name ?? '').split(' ')[0] || 'Alumni'} branch={profile.branch} />
        )}
      </AnimatePresence>

      {/* Greeting */}
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
                <div className="text-white font-semibold mb-1">No memories yet — be the first!</div>
                <div className="text-slate-400 text-sm mb-4">
                  Share a photo, a story, or a moment from your MCE days. Your batchmates are waiting to relive them with you.
                </div>
                <Link href={`/memories/${profile.branch}`}>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: `${meta.color}30`, border: `1px solid ${meta.color}40` }}>
                    Share a Memory on {profile.branch} Wall
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentMemories.map(m => <MemoryCard key={m.id} memory={m} />)}
                </div>
                {!guidanceData.hasMemory && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-3 rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}25` }}
                  >
                    <Image className="w-4 h-4 shrink-0" style={{ color: meta.color }} />
                    <span className="text-sm text-slate-300">Your wall is empty — </span>
                    <Link href={`/memories/${profile.branch}`} className="text-sm font-medium hover:underline" style={{ color: meta.color }}>
                      share your first memory now
                    </Link>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Countdown */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <CountdownWidget event={reunionEvent} />
          </motion.div>

          {/* Getting Started checklist */}
          {!allDone && (
            <GettingStarted profile={profile} guidanceData={guidanceData} />
          )}

          {/* Batch stats */}
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
              <div className="text-xs text-slate-500">{Math.round((totalAlumni / 309) * 100)}% of batch joined · invite more!</div>
            </div>
          </motion.div>

          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">What to do next</h3>
            <div className="space-y-2">
              {[
                {
                  href: `/memories/${profile.branch}`,
                  label: guidanceData.hasMemory ? 'Share another memory' : 'Share your first memory',
                  icon: Image,
                  color: '#6366f1',
                  highlight: !guidanceData.hasMemory,
                },
                { href: '/directory', label: 'Find your batchmates', icon: Users, color: '#22c55e', highlight: false },
                {
                  href: '/reunion',
                  label: guidanceData.hasRSVP ? 'View reunion details' : 'RSVP — are you coming?',
                  icon: Trophy,
                  color: '#eab308',
                  highlight: !guidanceData.hasRSVP,
                },
                {
                  href: '/map',
                  label: guidanceData.hasLocation ? 'See the global alumni map' : 'Pin yourself on the map',
                  icon: MapPin,
                  color: '#f97316',
                  highlight: !guidanceData.hasLocation,
                },
              ].map(({ href, label, icon: Icon, color, highlight }) => (
                <Link key={href} href={href}>
                  <div
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white transition-all group"
                    style={highlight ? { background: `${color}12`, border: `1px solid ${color}25` } : {}}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                    <span className={highlight ? 'font-medium text-white' : ''}>{label}</span>
                    <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* AI hint — only if not set up */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <Link href="/settings">
              <div className="rounded-xl px-4 py-3 text-sm cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <div className="flex items-center gap-2 text-violet-300 font-medium mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Unlock AI Nostalgia Bot
                </div>
                <div className="text-slate-400 text-xs">Add your OpenAI key in Settings to chat with an AI that knows all your batch memories.</div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
