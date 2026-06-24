'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Users, Search, Shield, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BRANCH_META, type Branch } from '@/types/database'
import { timeAgo, cn } from '@/lib/utils'

type Member = {
  id: string; full_name: string; branch: Branch; sprno: string | null
  city: string | null; country: string | null; graduation_year: number | null
  created_at: string; role: string; status: string; is_profile_complete: boolean
}

function MemberRow({ member, onAction }: { member: Member; onAction: (id: string, action: 'approve' | 'reject' | 'make_admin' | 'remove_admin') => void }) {
  const meta = BRANCH_META[member.branch]
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="border-b border-white/5 hover:bg-white/3 transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: `${meta?.color ?? '#6366f1'}25`, color: meta?.color ?? '#6366f1' }}>
            {meta?.emoji ?? '?'}
          </div>
          <div>
            <div className="text-white text-sm font-medium">{member.full_name}</div>
            <div className="text-slate-500 text-xs font-mono">{member.sprno ?? '—'}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: `${meta?.color ?? '#6366f1'}15`, color: meta?.color ?? '#6366f1' }}>
          {member.branch}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-400 text-sm">
        {[member.city, member.country].filter(Boolean).join(', ') || '—'}
      </td>
      <td className="px-4 py-3">
        <span className={cn('text-xs px-2 py-1 rounded-full font-medium', member.role === 'super_admin' ? 'text-red-300 bg-red-500/15' : member.role === 'branch_admin' ? 'text-orange-300 bg-orange-500/15' : 'text-slate-400 bg-white/5')}>
          {member.role}
        </span>
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs">{timeAgo(member.created_at)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {member.status === 'pending' && <>
            <button onClick={() => onAction(member.id, 'approve')} title="Approve"
              className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/15 transition-colors">
              <CheckCircle className="w-4 h-4" />
            </button>
            <button onClick={() => onAction(member.id, 'reject')} title="Reject"
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          </>}
          {member.status === 'approved' && member.role === 'alumni' && (
            <button onClick={() => onAction(member.id, 'make_admin')} title="Make Admin"
              className="p-1.5 rounded-lg text-orange-400 hover:bg-orange-500/15 transition-colors">
              <Shield className="w-4 h-4" />
            </button>
          )}
          {member.status === 'approved' && member.role === 'branch_admin' && (
            <button onClick={() => onAction(member.id, 'remove_admin')} title="Remove Admin"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  )
}

export default function MembersClient({ pending: initialPending, approved: initialApproved }: { pending: Member[]; approved: Member[] }) {
  const [tab, setTab] = useState<'pending' | 'approved'>('pending')
  const [pending, setPending] = useState(initialPending)
  const [approved, setApproved] = useState(initialApproved)
  const [search, setSearch] = useState('')
  const [toasting, setToasting] = useState('')

  function toast(msg: string) {
    setToasting(msg)
    setTimeout(() => setToasting(''), 3000)
  }

  async function handleAction(id: string, action: 'approve' | 'reject' | 'make_admin' | 'remove_admin') {
    const supabase = createClient()
    if (action === 'approve') {
      await (supabase as any).from('profiles').update({ status: 'approved' }).eq('id', id)
      const member = pending.find(m => m.id === id)!
      setPending(p => p.filter(m => m.id !== id))
      setApproved(a => [{ ...member, status: 'approved' }, ...a])
      toast(`✅ ${member.full_name} approved`)
    } else if (action === 'reject') {
      await (supabase as any).from('profiles').update({ status: 'rejected' }).eq('id', id)
      const member = pending.find(m => m.id === id)!
      setPending(p => p.filter(m => m.id !== id))
      toast(`❌ ${member.full_name} rejected`)
    } else if (action === 'make_admin') {
      await (supabase as any).from('profiles').update({ role: 'branch_admin' }).eq('id', id)
      setApproved(a => a.map(m => m.id === id ? { ...m, role: 'branch_admin' } : m))
      toast(`🛡️ Promoted to admin`)
    } else if (action === 'remove_admin') {
      await (supabase as any).from('profiles').update({ role: 'alumni' }).eq('id', id)
      setApproved(a => a.map(m => m.id === id ? { ...m, role: 'alumni' } : m))
      toast(`Demoted to alumni`)
    }
  }

  const filtered = (tab === 'pending' ? pending : approved).filter(m =>
    !search || m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.sprno?.includes(search) || m.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Toast */}
      <AnimatePresence>
        {toasting && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl"
            style={{ background: 'rgba(30,30,40,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {toasting}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Member Management</h1>
        <p className="text-slate-400 text-sm">Approve registrations and manage roles</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(['pending', 'approved'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all', tab === t ? 'text-white' : 'text-slate-400 bg-white/5 hover:text-white')}
            style={tab === t ? { background: t === 'pending' ? 'rgba(234,179,8,0.2)' : 'rgba(34,197,94,0.2)', border: `1px solid ${t === 'pending' ? 'rgba(234,179,8,0.3)' : 'rgba(34,197,94,0.3)'}`, color: t === 'pending' ? '#fde047' : '#86efac' } : {}}>
            {t === 'pending' ? <Clock className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            {t === 'pending' ? 'Pending' : 'Approved'}
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              {t === 'pending' ? pending.length : approved.length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, SPRNO, city…"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">{tab === 'pending' ? '🎉' : '🔍'}</div>
          <div className="text-white font-semibold">
            {tab === 'pending' ? 'No pending approvals!' : 'No members found'}
          </div>
          <div className="text-slate-400 text-sm mt-1">
            {tab === 'pending' ? 'All registrations are up to date.' : 'Try a different search term.'}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left">
                {['Name / SPRNO', 'Branch', 'Location', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map(m => (
                  <MemberRow key={m.id} member={m} onAction={handleAction} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
