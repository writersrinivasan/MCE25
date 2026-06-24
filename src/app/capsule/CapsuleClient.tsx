'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Send, Edit3, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { type Profile } from '@/types/database'
import { branchColor, getInitials, timeAgo } from '@/lib/utils'

const REVEAL_DATE = new Date('2026-06-27T03:30:00Z') // 09:00 IST

function useCountdown() {
  const [diff, setDiff] = useState(REVEAL_DATE.getTime() - Date.now())
  useEffect(() => {
    const t = setInterval(() => setDiff(REVEAL_DATE.getTime() - Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const total = Math.max(0, diff)
  const d = Math.floor(total / 86400000)
  const h = Math.floor((total % 86400000) / 3600000)
  const m = Math.floor((total % 3600000) / 60000)
  const s = Math.floor((total % 60000) / 1000)
  return { d, h, m, s, past: diff <= 0 }
}

function SealedView({
  message, onEdit, totalCount,
}: { message: string; onEdit: () => void; totalCount: number }) {
  const { d, h, m, s, past } = useCountdown()

  return (
    <div className="max-w-lg mx-auto text-center">
      {/* Envelope animation */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-8 relative inline-block"
      >
        {/* Envelope body */}
        <div style={{
          width: 160, height: 110,
          background: 'linear-gradient(145deg,rgba(234,179,8,0.12),rgba(234,179,8,0.06))',
          border: '1px solid rgba(234,179,8,0.35)',
          borderRadius: 8,
          position: 'relative',
          boxShadow: '0 0 40px rgba(234,179,8,0.15)',
        }}>
          {/* Envelope flap lines */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            borderBottom: '1px solid rgba(234,179,8,0.2)',
            height: '55%',
            background: 'linear-gradient(135deg, transparent 49.5%, rgba(234,179,8,0.08) 50%)',
          }} />
          {/* Wax seal */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
              border: '2px solid rgba(234,179,8,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, boxShadow: '0 2px 12px rgba(220,38,38,0.4)',
            }}
          >
            🎓
          </motion.div>
        </div>

        {/* Glow */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            position: 'absolute', inset: -12, borderRadius: 16,
            background: 'radial-gradient(circle, rgba(234,179,8,0.1), transparent)',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <h2 className="text-white font-bold text-xl">Your letter is sealed</h2>
        </div>
        <p className="text-slate-400 text-sm mb-6">It will be revealed to the entire batch on 27 June 2026</p>

        {/* Countdown */}
        {!past && (
          <div className="inline-grid grid-cols-4 gap-3 mb-6">
            {[{ v: d, l: 'Days' }, { v: h, l: 'Hrs' }, { v: m, l: 'Mins' }, { v: s, l: 'Secs' }].map(({ v, l }) => (
              <div key={l} className="rounded-xl px-3 py-2 text-center"
                style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <div className="text-2xl font-bold text-amber-300 tabular-nums"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                  {String(v).padStart(2, '0')}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Preview of own letter */}
        <div className="glass rounded-2xl p-5 mb-5 text-left"
          style={{ border: '1px solid rgba(234,179,8,0.15)' }}>
          <div className="text-xs text-amber-500 uppercase tracking-widest font-semibold mb-2">Your letter</div>
          <p className="text-slate-300 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">{message}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 mb-5">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {totalCount} {totalCount === 1 ? 'batchmate has' : 'batchmates have'} written their letter
          </div>
          <button onClick={onEdit}
            className="flex items-center gap-1 text-amber-500 hover:text-amber-400 transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function WriteForm({
  userId, initial, onSaved,
}: { userId: string; initial: string; onSaved: (msg: string) => void }) {
  const [message, setMessage] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const placeholder = `Dear 1997 me,\n\nYou're about to walk through MCE's gates for the first time — nervous, excited, and having no idea what's coming...\n\n`

  async function handleSeal() {
    if (!message.trim()) { setErr('Write something first.'); return }
    setSaving(true); setErr('')
    const supabase = createClient()
    const { error } = await (supabase as any)
      .from('time_capsules')
      .upsert({ author_id: userId, message: message.trim(), updated_at: new Date().toISOString() },
        { onConflict: 'author_id' })
    setSaving(false)
    if (error) { setErr(error.message); return }
    onSaved(message.trim())
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Prompt */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            A Letter to Your 1997 Self
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            What would you tell the nervous fresher who walked through MCE&apos;s gates 25 years ago?
            This letter is sealed until the reunion day.
          </p>
        </div>

        {/* Letter card */}
        <div className="relative rounded-2xl overflow-hidden mb-5"
          style={{
            background: 'rgba(234,179,8,0.03)',
            border: '1px solid rgba(234,179,8,0.2)',
            boxShadow: '0 0 60px rgba(234,179,8,0.06)',
          }}>
          {/* Top amber stripe */}
          <div style={{ height: 3, background: 'linear-gradient(90deg,#d97706,#eab308,#d97706)' }} />

          <div className="p-6">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={placeholder}
              rows={12}
              className="w-full bg-transparent text-slate-200 placeholder-slate-600 text-sm leading-7 focus:outline-none resize-none"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            />
          </div>

          <div className="px-6 pb-4 flex items-center justify-between">
            <span className="text-xs text-slate-600">
              {message.length} characters
            </span>
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <Lock className="w-3 h-3" />
              Sealed until 27 June 2026
            </div>
          </div>
        </div>

        {err && <p className="text-red-400 text-xs mb-3">{err}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleSeal} disabled={saving || !message.trim()}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#d97706,#eab308)', color: '#000' }}
        >
          {saving ? 'Sealing…' : (
            <>
              <span style={{ fontSize: 18 }}>🕯️</span>
              Seal Your Letter
              <Lock className="w-4 h-4" />
            </>
          )}
        </motion.button>

        <p className="text-center text-xs text-slate-600 mt-3">
          You can edit until the reunion. After 27 June 2026, it&apos;s permanent.
        </p>
      </motion.div>
    </div>
  )
}

function RevealedWall({ capsules }: { capsules: any[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="text-5xl mb-4">💌</div>
        <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Letters from 1997 are Open
        </h2>
        <p className="text-slate-400">{capsules.length} letters written across 25 years of wisdom</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {capsules.map((c, i) => {
          const author = c.author as Profile | undefined
          const color = branchColor(author?.branch)
          const isOpen = expanded === c.id

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl overflow-hidden cursor-pointer"
              style={{ border: `1px solid ${color}20` }}
              onClick={() => setExpanded(isOpen ? null : c.id)}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: `${color}40` }}>
                    {author?.avatar_url
                      ? <img src={author.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                      : getInitials(author?.full_name ?? '?')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{author?.full_name}</div>
                    <div className="text-slate-500 text-xs">{author?.branch} · {timeAgo(c.created_at)}</div>
                  </div>
                  <div className="text-lg">{isOpen ? '📖' : '✉️'}</div>
                </div>

                <p className={`text-slate-300 text-sm leading-relaxed whitespace-pre-wrap ${isOpen ? '' : 'line-clamp-3'}`}
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                  {c.message}
                </p>

                {!isOpen && c.message.length > 180 && (
                  <div className="text-amber-500 text-xs mt-2">Read full letter →</div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function CapsuleClient({
  userId, myCapsule: initial, allCapsules, totalCount, isRevealed,
}: {
  userId: string
  myCapsule: { id: string; message: string } | null
  allCapsules: any[]
  totalCount: number
  isRevealed: boolean
}) {
  const [myCapsule, setMyCapsule] = useState(initial)
  const [editing, setEditing] = useState(false)

  if (isRevealed) {
    return <RevealedWall capsules={allCapsules} />
  }

  if (myCapsule && !editing) {
    return (
      <SealedView
        message={myCapsule.message}
        totalCount={totalCount}
        onEdit={() => setEditing(true)}
      />
    )
  }

  return (
    <WriteForm
      userId={userId}
      initial={myCapsule?.message ?? ''}
      onSaved={msg => { setMyCapsule({ id: '', message: msg }); setEditing(false) }}
    />
  )
}
