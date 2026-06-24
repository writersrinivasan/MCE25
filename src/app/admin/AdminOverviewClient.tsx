'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, Image, Trophy, Clock, ArrowRight, CheckCircle, MapPin } from 'lucide-react'
import { BRANCH_META, BRANCHES, type Branch } from '@/types/database'
import { timeAgo } from '@/lib/utils'

export default function AdminOverviewClient({ stats, branchCounts, recentMembers, recentMemories }: {
  stats: { totalMembers: number; pendingCount: number; memoriesCount: number; attendingCount: number }
  branchCounts: Record<string, number>
  recentMembers: any[]
  recentMemories: any[]
}) {
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeResult, setGeocodeResult] = useState('')

  async function fixMapPins() {
    setGeocoding(true)
    setGeocodeResult('')
    try {
      const res = await fetch('/api/geocode-profiles', { method: 'POST' })
      const data = await res.json()
      setGeocodeResult(data.message ?? `Updated ${data.updated} of ${data.total} profiles`)
    } catch {
      setGeocodeResult('Failed. Try again.')
    }
    setGeocoding(false)
  }

  const STAT_CARDS = [
    { label: 'Approved Members', value: stats.totalMembers, icon: Users, color: '#22c55e', href: '/admin/members' },
    { label: 'Pending Approval', value: stats.pendingCount, icon: Clock, color: '#eab308', href: '/admin/members?tab=pending', highlight: stats.pendingCount > 0 },
    { label: 'Memories Shared', value: stats.memoriesCount, icon: Image, color: '#3b82f6', href: '/memories' },
    { label: 'RSVPs (Attending)', value: stats.attendingCount, icon: Trophy, color: '#a855f7', href: '/reunion' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          Admin Overview
        </h1>
        <p className="text-slate-400">MCE Silver Reunion 2026 — Control Centre</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={s.href}>
              <div className={`glass glass-hover rounded-2xl p-5 cursor-pointer relative overflow-hidden ${s.highlight ? 'ring-1 ring-yellow-400/40' : ''}`}>
                <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(ellipse at top right, ${s.color}, transparent)` }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                      <s.icon className="w-5 h-5" style={{ color: s.color }} />
                    </div>
                    {s.highlight && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium text-yellow-300 animate-pulse"
                        style={{ background: 'rgba(234,179,8,0.2)' }}>New</span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-white mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Branch breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Branch Breakdown</h3>
          <div className="space-y-3">
            {BRANCHES.map(b => {
              const meta = BRANCH_META[b]
              const count = branchCounts[b] ?? 0
              const pct = stats.totalMembers ? Math.round((count / stats.totalMembers) * 100) : 0
              return (
                <div key={b}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-300 flex items-center gap-1.5">{meta.emoji} {b}</span>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="h-1.5 rounded-full"
                      style={{ background: meta.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
            <span>Total whitelist: 309</span>
            <span>{stats.totalMembers} registered ({Math.round((stats.totalMembers / 309) * 100)}%)</span>
          </div>
        </motion.div>

        {/* Recent registrations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Members</h3>
            <Link href="/admin/members" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentMembers.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-4">No members yet</div>
          ) : (
            <div className="space-y-3">
              {recentMembers.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: `${BRANCH_META[m.branch as Branch]?.color ?? '#6366f1'}30` }}>
                    {BRANCH_META[m.branch as Branch]?.emoji ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{m.full_name}</div>
                    <div className="text-slate-500 text-xs">{m.city ?? m.country ?? '—'} · {timeAgo(m.created_at)}</div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent memories */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Memories</h3>
            <Link href="/memories" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentMemories.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-4">No memories shared yet</div>
          ) : (
            <div className="space-y-3">
              {recentMemories.map((m: any) => (
                <div key={m.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0"
                    style={{ background: `${BRANCH_META[m.branch as Branch]?.color ?? '#6366f1'}20` }}>
                    {BRANCH_META[m.branch as Branch]?.emoji ?? '📸'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">{m.title ?? m.content ?? 'Untitled'}</div>
                    <div className="text-slate-500 text-xs">{(m.author as any)?.full_name} · {timeAgo(m.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { href: '/admin/members?tab=pending', label: 'Review Pending Members', desc: `${stats.pendingCount} waiting for approval`, color: '#eab308' },
          { href: '/admin/announcements', label: 'Post Announcement', desc: 'Notify all alumni instantly', color: '#3b82f6' },
          { href: '/admin/event', label: 'Manage Reunion Event', desc: 'Edit date, venue, details', color: '#a855f7' },
        ].map(a => (
          <Link key={a.href} href={a.href}>
            <div className="glass glass-hover rounded-xl p-4 cursor-pointer group">
              <div className="font-medium text-white text-sm mb-0.5 group-hover:text-opacity-90">{a.label}</div>
              <div className="text-slate-400 text-xs">{a.desc}</div>
              <div className="mt-2 text-xs font-medium flex items-center gap-1" style={{ color: a.color }}>
                Go <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
        <button onClick={fixMapPins} disabled={geocoding} className="glass glass-hover rounded-xl p-4 text-left disabled:opacity-60">
          <div className="flex items-center gap-2 mb-0.5">
            <MapPin className="w-4 h-4 text-green-400" />
            <div className="font-medium text-white text-sm">Fix Map Pins</div>
          </div>
          <div className="text-slate-400 text-xs">{geocodeResult || 'Geocode all alumni locations'}</div>
          <div className="mt-2 text-xs font-medium text-green-400">
            {geocoding ? 'Geocoding… (takes ~1 min)' : 'Run Now'}
          </div>
        </button>
      </motion.div>
    </div>
  )
}
