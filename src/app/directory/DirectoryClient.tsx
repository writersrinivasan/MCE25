'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, MapPin, Briefcase, ExternalLink, Filter } from 'lucide-react'
import { BRANCHES, BRANCH_META, type Branch, type Profile } from '@/types/database'
import { getInitials, branchColor, cn } from '@/lib/utils'

function AlumniCard({ profile }: { profile: Profile }) {
  const color = branchColor(profile.branch)
  const meta = BRANCH_META[profile.branch]
  return (
    <Link href={`/directory/${profile.id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="glass glass-hover rounded-2xl p-5 cursor-pointer h-full"
        style={{ borderColor: `${color}20` }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-bold text-white shrink-0"
            style={{ background: `linear-gradient(135deg, ${color}40, ${color}20)`, border: `1px solid ${color}30` }}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-sm">{getInitials(profile.full_name)}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">{profile.full_name}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                {meta?.emoji} {profile.branch}
              </span>
              <span className="text-xs text-slate-500">{profile.graduation_year}</span>
            </div>
          </div>
        </div>

        {(profile.current_position || profile.company) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
            <Briefcase className="w-3 h-3 shrink-0" />
            <span className="truncate">{[profile.current_position, profile.company].filter(Boolean).join(' · ')}</span>
          </div>
        )}
        {(profile.city || profile.country) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
          </div>
        )}

        {profile.linkedin_url && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
              <ExternalLink className="w-3 h-3" /> LinkedIn
            </a>
          </div>
        )}
      </motion.div>
    </Link>
  )
}

export default function DirectoryClient({ alumni }: { alumni: Profile[] }) {
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState<Branch | 'all'>('all')
  const [countryFilter, setCountryFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const countries = useMemo(() => {
    const set = new Set(alumni.map(a => a.country).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [alumni])

  const filtered = useMemo(() => alumni.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.full_name.toLowerCase().includes(q) || a.city?.toLowerCase().includes(q) || a.company?.toLowerCase().includes(q) || a.current_position?.toLowerCase().includes(q)
    const matchBranch = branchFilter === 'all' || a.branch === branchFilter
    const matchCountry = !countryFilter || a.country === countryFilter
    return matchSearch && matchBranch && matchCountry
  }), [alumni, search, branchFilter, countryFilter])

  const branchCounts = useMemo(() => BRANCHES.reduce<Record<string, number>>((acc, b) => {
    acc[b] = alumni.filter(a => a.branch === b).length; return acc
  }, {}), [alumni])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Alumni Directory</h1>
        <p className="text-slate-400">{alumni.length} batchmates from MCE 1997–2001 · Find, reconnect, and collaborate</p>
      </div>

      {/* Branch pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setBranchFilter('all')}
          className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all', branchFilter === 'all' ? 'text-white' : 'text-slate-400 bg-white/5 hover:text-white')}
          style={branchFilter === 'all' ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}
        >All ({alumni.length})</button>
        {BRANCHES.map(b => {
          const meta = BRANCH_META[b]
          const active = branchFilter === b
          return (
            <button key={b} onClick={() => setBranchFilter(active ? 'all' : b)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all', active ? 'text-white' : 'text-slate-400 bg-white/5 hover:text-white')}
              style={active ? { background: meta.color } : {}}>
              {meta.emoji} {b} ({branchCounts[b] ?? 0})
            </button>
          )
        })}
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, company, city…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <button onClick={() => setShowFilters(f => !f)}
          className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all', showFilters ? 'text-white' : 'text-slate-400')}
          style={showFilters ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="glass rounded-xl p-4 mb-5 flex flex-wrap gap-4">
          <div className="flex-1 min-w-40">
            <label className="block text-xs text-slate-400 mb-1">Country</label>
            <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <div className="text-xs text-slate-500 mb-4">{filtered.length} alumni found</div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-white font-semibold">No results found</div>
          <div className="text-slate-400 text-sm mt-1">Try a different name, branch, or country.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }}>
              <AlumniCard profile={a} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
