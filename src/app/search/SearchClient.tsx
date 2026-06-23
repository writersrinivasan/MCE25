'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Image, FileText, Link as LinkIcon, Loader2, Key } from 'lucide-react'
import Link from 'next/link'
import { BRANCH_META, BRANCHES, type Branch } from '@/types/database'
import { timeAgo } from '@/lib/utils'

type Result = {
  id: string; title: string | null; content: string | null; branch: Branch
  media_type: string | null; media_url: string | null; created_at: string
  author: { full_name: string; branch: Branch; avatar_url: string | null }
}

const SUGGESTIONS = ['First day of college', 'Cultural fest memories', 'Lab experiments gone wrong', 'Hostel life', 'Sports day', 'Farewell party']

export default function SearchClient({ hasApiKey }: { hasApiKey: boolean }) {
  const [query, setQuery] = useState('')
  const [branch, setBranch] = useState<Branch | ''>('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [mode, setMode] = useState<'vector' | 'keyword' | ''>('')

  async function doSearch(q?: string) {
    const sq = (q ?? query).trim()
    if (!sq) return
    setLoading(true); setSearched(true)
    const res = await fetch('/api/ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: sq, branch: branch || null, limit: 20 }),
    })
    const data = await res.json()
    setResults(data.results ?? [])
    setMode(data.mode ?? '')
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 text-violet-300"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Sparkles className="w-3 h-3" /> AI-Powered Memory Search
        </div>
        <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Find Your Memories
        </h1>
        <p className="text-slate-400">
          {hasApiKey
            ? 'Search in natural language — "cricket match 1999" or "farewell party ECE"'
            : 'Keyword search is always free. Add your API key for smarter semantic search.'}
        </p>
      </motion.div>

      {/* API Key banner — shown when no key, but still lets keyword search work */}
      {!hasApiKey && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl mb-6"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <Key className="w-5 h-5 text-violet-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-slate-300 text-sm">
              <strong className="text-white">Keyword search is active.</strong>{' '}
              Add your OpenAI API key to unlock semantic search — it understands meaning, not just exact words.
            </p>
          </div>
          <Link href="/settings"
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-300 hover:text-white transition-colors"
            style={{ background: 'rgba(99,102,241,0.2)' }}>
            Add Key
          </Link>
        </motion.div>
      )}

      {/* Search box */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder={hasApiKey ? 'What memory are you looking for?' : 'Search by keyword…'}
            className="w-full pl-12 pr-4 py-4 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-base"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <select value={branch} onChange={e => setBranch(e.target.value as Branch)}
          className="px-4 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <option value="">All Branches</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => doSearch()} disabled={loading || !query.trim()}
          className="px-6 py-4 rounded-2xl text-white font-semibold disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </motion.button>
      </div>

      {!searched && (
        <div className="flex flex-wrap gap-2 mb-8">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => { setQuery(s); doSearch(s) }}
              className="px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" />
            <div className="text-slate-400 text-sm">Searching memories…</div>
          </motion.div>
        )}
        {!loading && searched && results.length === 0 && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-white font-semibold mb-1">No memories found</div>
            <div className="text-slate-400 text-sm">Try different keywords or browse the Memory Wall</div>
          </motion.div>
        )}
        {!loading && results.length > 0 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-400">{results.length} memories found</div>
              <div className="text-xs px-2 py-1 rounded-full text-slate-500"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                {mode === 'vector' ? '✨ Semantic search' : '🔤 Keyword search'}
              </div>
            </div>
            <div className="space-y-3">
              {results.map((r, i) => {
                const meta = BRANCH_META[r.branch]
                return (
                  <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="glass rounded-2xl overflow-hidden hover:bg-white/3 transition-colors">
                    <Link href={`/memories/${r.branch?.toLowerCase() ?? 'all'}`}>
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {r.media_url && r.media_type === 'image' && (
                            <img src={r.media_url} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: `${meta?.color ?? '#6366f1'}15`, color: meta?.color ?? '#6366f1' }}>
                                {r.branch}
                              </span>
                              <span className="text-xs text-slate-600">
                                {r.media_type === 'image' ? <Image className="w-3 h-3 inline" /> : r.media_type === 'link' ? <LinkIcon className="w-3 h-3 inline" /> : <FileText className="w-3 h-3 inline" />}
                              </span>
                            </div>
                            {r.title && <div className="text-white font-medium mb-1 truncate">{r.title}</div>}
                            {r.content && <div className="text-slate-400 text-sm line-clamp-2">{r.content}</div>}
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                              <span>{r.author?.full_name}</span>
                              <span>·</span>
                              <span>{timeAgo(r.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
