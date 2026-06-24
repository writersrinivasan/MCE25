'use client'
import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, Image, Link as LinkIcon, FileText, X, Plus, Heart, MessageCircle, Calendar, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/storage'
import { BRANCH_META, BRANCHES, type Branch, type Memory, type Profile } from '@/types/database'
import { getInitials, branchColor, timeAgo, cn } from '@/lib/utils'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1997 + 1 }, (_, i) => CURRENT_YEAR - i)
const EMOJIS = ['❤️', '😂', '🔥', '👏', '😭', '🎓']

function MemoryCard({ memory, currentUserId, onReact }: { memory: Memory; currentUserId: string; onReact: (id: string, emoji: string) => void }) {
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(memory.comments ?? [])
  const author = memory.author as Profile | undefined
  const color = branchColor(author?.branch ?? memory.branch)

  async function submitComment() {
    if (!comment.trim()) return
    const supabase = createClient()
    const { data } = await (supabase as any).from('comments').insert({ memory_id: memory.id, author_id: currentUserId, content: comment.trim() }).select('*, author:profiles!author_id(id, full_name, avatar_url, branch)').single()
    if (data) { setComments(c => [...c, data]); setComment('') }
  }

  const reactionCounts = (memory.reactions ?? []).reduce<Record<string, number>>((acc, r: any) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1; return acc
  }, {})

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
      style={{ borderColor: `${color}20` }}
    >
      {/* Media */}
      {memory.media_url && memory.media_type === 'image' && (
        <div className="w-full h-52 overflow-hidden bg-white/5">
          <img src={memory.media_url} alt={memory.title ?? ''} className="w-full h-full object-cover" />
        </div>
      )}
      {memory.media_url && memory.media_type === 'video' && (
        <video src={memory.media_url} controls className="w-full max-h-64 object-cover bg-black" />
      )}
      {memory.link_url && (
        <a href={memory.link_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 text-xs text-blue-400 hover:text-blue-300 border-b border-white/5">
          <LinkIcon className="w-3 h-3" /> {memory.link_url}
        </a>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: `${color}40` }}>
            {author?.avatar_url ? <img src={author.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(author?.full_name ?? '?')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{author?.full_name}</div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {memory.year_of_memory && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{memory.year_of_memory}</span>}
              <span>{timeAgo(memory.created_at)}</span>
            </div>
          </div>
          {memory.branch && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
              {memory.branch}
            </span>
          )}
        </div>

        {memory.title && <div className="text-white font-semibold mb-1">{memory.title}</div>}
        {memory.content && <div className="text-slate-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap">{memory.content}</div>}

        {memory.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {memory.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full text-slate-400" style={{ background: 'rgba(255,255,255,0.05)' }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-white/5">
          {EMOJIS.map(emoji => (
            <button key={emoji} onClick={() => onReact(memory.id, emoji)}
              className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs hover:bg-white/10 transition-colors">
              {emoji}
              {reactionCounts[emoji] ? <span className="text-slate-400 ml-0.5">{reactionCounts[emoji]}</span> : null}
            </button>
          ))}
          <button onClick={() => setShowComments(s => !s)}
            className="ml-auto flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" />
            {(memory._comment_count ?? comments.length) || ''}
          </button>
        </div>

        {/* Comments */}
        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0">
                      {getInitials(c.author?.full_name ?? '?')}
                    </div>
                    <div className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300">{c.content}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input value={comment} onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitComment()}
                  placeholder="Add a comment…"
                  className="flex-1 px-3 py-2 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <button onClick={submitComment} className="p-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.3)' }}>
                  <Send className="w-3.5 h-3.5 text-violet-300" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function UploadPanel({ branch, userId, onUpload, onPosted }: { branch: Branch | null; userId: string; onUpload: (m: Memory) => void; onPosted: () => void }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'text' | 'image' | 'video' | 'link' | 'document'>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [year, setYear] = useState<number | ''>('')
  const [selectedBranch, setSelectedBranch] = useState<Branch | ''>(branch ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [uploadErr, setUploadErr] = useState('')

  const onDrop = useCallback((files: File[]) => {
    const f = files[0]
    if (!f) return
    setFile(f)
    if (f.type.startsWith('image/')) { setPreview(URL.createObjectURL(f)); setType('image') }
    else if (f.type.startsWith('video/')) { setPreview(URL.createObjectURL(f)); setType('video') }
    else { setType('document') }
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false })

  async function handlePost() {
    setUploading(true)
    setUploadErr('')
    const supabase = createClient()
    let media_url = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const result = await uploadFile('memories', path, file, setUploadPct)
      if ('error' in result) { setUploadErr(result.error); setUploading(false); return }
      media_url = result.url
    }

    const payload = {
      author_id: userId,
      branch: selectedBranch || null,
      title: title || null,
      content: content || null,
      media_url,
      media_type: file ? type : (linkUrl ? 'link' : null),
      link_url: linkUrl || null,
      year_of_memory: year || null,
      tags: [],
    }

    const { data, error } = await (supabase as any).from('memories').insert(payload).select('*, author:profiles!author_id(id, full_name, branch, avatar_url, sprno)').single()
    setUploading(false)
    setUploadPct(0)

    if (error || !data) {
      setUploadErr(error?.message ?? 'Failed to post memory. Please try again.')
      return
    }

    onUpload(data)
    onPosted()  // reset year filter so the new memory is always visible
    setOpen(false)
    setTitle(''); setContent(''); setFile(null); setPreview(''); setLinkUrl(''); setYear('')

    // Fire-and-forget: generate embedding if user has an API key
    fetch('/api/ai/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memoryId: data.id, title: data.title, content: data.content }),
    }).catch(() => {})
  }

  if (!open) return (
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      onClick={() => setOpen(true)}
      className="w-full glass glass-hover rounded-2xl px-5 py-4 flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
        <Plus className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm">Share a memory, photo, or video…</span>
    </motion.button>
  )

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Share a Memory</h3>
        <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-slate-400 hover:text-white" /></button>
      </div>

      {/* Type selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'text', label: 'Text', icon: FileText },
          { id: 'image', label: 'Photo', icon: Image },
          { id: 'video', label: 'Video', icon: Upload },
          { id: 'link', label: 'Link', icon: LinkIcon },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setType(id as typeof type)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              type === id ? 'text-white' : 'text-slate-400 hover:text-white bg-white/5')}
            style={type === id ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
            <Icon className="w-3 h-3" />{label}
          </button>
        ))}
      </div>

      {/* Branch selector if showing all */}
      {!branch && (
        <div className="mb-3">
          <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value as Branch)}
            className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <option value="">All Branches</option>
            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      )}

      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)"
        className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      />

      {(type === 'text') && (
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
          placeholder="Write your memory… what happened, who was there, what you felt."
          className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      )}

      {(type === 'image' || type === 'video' || type === 'document') && (
        <div {...getRootProps()} className={cn('border-2 border-dashed rounded-xl p-6 text-center mb-3 cursor-pointer transition-colors',
          isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 hover:border-white/20')}>
          <input {...getInputProps()} />
          {preview && type === 'image' && <img src={preview} alt="" className="w-full max-h-40 object-cover rounded-lg mb-2" />}
          {preview && type === 'video' && <video src={preview} className="w-full max-h-40 rounded-lg mb-2" />}
          {!preview && <>
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <div className="text-slate-400 text-sm">Drop a file or click to browse</div>
            <div className="text-slate-600 text-xs mt-1">Images, videos, documents up to 50MB</div>
          </>}
          {file && <div className="text-xs text-slate-400 mt-1">{file.name}</div>}
        </div>
      )}

      {type === 'link' && (
        <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://…"
          className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 mb-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      )}

      <div className="flex items-center gap-3 mb-4">
        <select value={year} onChange={e => setYear(e.target.value ? Number(e.target.value) : '')}
          className="flex-1 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <option value="">Year (optional)</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {uploadErr && <div className="text-xs text-red-400 mb-3">{uploadErr}</div>}
      {uploading && uploadPct > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Uploading…</span><span>{uploadPct}%</span></div>
          <div className="w-full h-1.5 rounded-full bg-white/5"><div className="h-1.5 rounded-full bg-violet-500 transition-all" style={{ width: `${uploadPct}%` }} /></div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePost} disabled={uploading}
          className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          {uploading ? 'Posting…' : 'Post Memory'}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function BranchWallClient({
  branch, memories: initialMemories, currentProfile,
}: {
  branch: Branch | null
  memories: Memory[]
  currentProfile: Profile
}) {
  const [memories, setMemories] = useState(initialMemories)
  const [filterYear, setFilterYear] = useState<number | 'all'>('all')
  const meta = branch ? BRANCH_META[branch] : null

  // Only show years that actually have memories — avoids 30 filter buttons
  const yearsWithMemories = useMemo(() =>
    [...new Set(memories.map(m => m.year_of_memory).filter(Boolean) as number[])]
      .sort((a, b) => b - a),
    [memories]
  )

  async function handleReact(memoryId: string, emoji: string) {
    const supabase = createClient()
    const existing = await (supabase as any).from('reactions').select('id').eq('memory_id', memoryId).eq('user_id', currentProfile.id).eq('emoji', emoji).single()
    if (existing.data) {
      await (supabase as any).from('reactions').delete().eq('id', existing.data.id)
    } else {
      await (supabase as any).from('reactions').insert({ memory_id: memoryId, user_id: currentProfile.id, emoji })
    }
  }

  const filtered = filterYear === 'all' ? memories : memories.filter(m => m.year_of_memory === filterYear)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        {meta ? (
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: meta.bg, border: `1px solid ${meta.color}30` }}>
              {meta.emoji}
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: meta.color, fontFamily: 'var(--font-heading)' }}>{branch} Memory Wall</h1>
              <p className="text-slate-400 text-sm">{meta.label} · Batch 1997–2001</p>
            </div>
          </div>
        ) : (
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>All Branch Memories</h1>
        )}

        {/* Year filter — shows only years that have actual memories */}
        {yearsWithMemories.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            <button onClick={() => setFilterYear('all')}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filterYear === 'all' ? 'text-white' : 'text-slate-400 bg-white/5 hover:text-white')}
              style={filterYear === 'all' ? { background: meta?.color ?? '#6366f1' } : {}}>All Years</button>
            {yearsWithMemories.map(y => (
              <button key={y} onClick={() => setFilterYear(y)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filterYear === y ? 'text-white' : 'text-slate-400 bg-white/5 hover:text-white')}
                style={filterYear === y ? { background: meta?.color ?? '#6366f1' } : {}}>{y}</button>
            ))}
          </div>
        )}
      </div>

      {/* Upload */}
      <div className="mb-6">
        <UploadPanel
          branch={branch}
          userId={currentProfile.id}
          onUpload={m => setMemories(prev => [m, ...prev])}
          onPosted={() => setFilterYear('all')}
        />
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">📸</div>
            <div className="text-white font-semibold mb-2">No memories here yet</div>
            <div className="text-slate-400 text-sm">Be the first to share a photo, video, or memory from your {branch} days!</div>
          </div>
        ) : filtered.map(m => (
          <MemoryCard key={m.id} memory={m} currentUserId={currentProfile.id} onReact={handleReact} />
        ))}
      </div>
    </div>
  )
}
