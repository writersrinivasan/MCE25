'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Pin, Trash2, Plus, X, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'

type Announcement = { id: string; title: string; body: string; pinned: boolean; created_at: string; author: any }

export default function AnnouncementsClient({ announcements: initial, authorId }: { announcements: Announcement[]; authorId: string }) {
  const [items, setItems] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handlePost() {
    if (!title.trim() || !body.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('announcements')
      .insert({ title: title.trim(), body: body.trim(), pinned, author_id: authorId })
      .select('*, author:profiles!author_id(full_name, branch)')
      .single()
    setSaving(false)
    if (data) {
      setItems(prev => [data, ...prev])
      setTitle(''); setBody(''); setPinned(false); setShowForm(false)
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await (supabase as any).from('announcements').delete().eq('id', id)
    setItems(prev => prev.filter(a => a.id !== id))
  }

  async function togglePin(item: Announcement) {
    const supabase = createClient()
    await (supabase as any).from('announcements').update({ pinned: !item.pinned }).eq('id', item.id)
    setItems(prev => prev.map(a => a.id === item.id ? { ...a, pinned: !a.pinned } : a)
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Announcements</h1>
          <p className="text-slate-400 text-sm">Broadcast messages to all approved alumni</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm"
          style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </motion.button>
      </div>

      {/* Compose form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-white mb-4">New Announcement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Reunion schedule confirmed!"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Message *</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={4}
                  placeholder="Write your announcement here. All approved members will see this on the Reunion Wall."
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setPinned(p => !p)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${pinned ? 'bg-red-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${pinned ? 'left-4' : 'left-0.5'}`} />
                  </div>
                  <span className="text-slate-300 text-sm">Pin to top</span>
                </label>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handlePost} disabled={saving || !title.trim() || !body.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
                  <Send className="w-4 h-4" />
                  {saving ? 'Posting…' : 'Post Announcement'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements list */}
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <div className="text-white font-semibold mb-1">No announcements yet</div>
          <div className="text-slate-400 text-sm">Post your first announcement to notify all alumni.</div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map(item => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="glass rounded-xl p-5"
                style={item.pinned ? { border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' } : {}}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.pinned && (
                        <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{item.body}</p>
                    <div className="text-xs text-slate-500 mt-2">
                      Posted by {item.author?.full_name ?? 'Admin'} · {timeAgo(item.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => togglePin(item)} title={item.pinned ? 'Unpin' : 'Pin'}
                      className={`p-1.5 rounded-lg transition-colors ${item.pinned ? 'text-red-400 bg-red-500/15' : 'text-slate-400 hover:bg-white/10'}`}>
                      <Pin className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} title="Delete"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
