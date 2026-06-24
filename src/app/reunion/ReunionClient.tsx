'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Calendar, MapPin, Users, Check, Clock, X, Upload, Camera, Download, Share2 } from 'lucide-react'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { BRANCH_META, type Branch, type Profile, type ReunionEvent, type RSVP, type RSVPStatus, type ThenNowPhoto } from '@/types/database'
import { branchColor, getInitials } from '@/lib/utils'

const REUNION_DATE = new Date('2026-06-27T09:00:00+05:30')

function Countdown() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])

  const days = differenceInDays(REUNION_DATE, now)
  const hours = differenceInHours(REUNION_DATE, now) % 24
  const mins = differenceInMinutes(REUNION_DATE, now) % 60
  const secs = differenceInSeconds(REUNION_DATE, now) % 60

  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: hours },
    { label: 'Mins', value: mins },
    { label: 'Secs', value: secs },
  ]

  return (
    <div className="glass rounded-2xl p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(234,179,8,0.1), transparent)' }} />
      <div className="relative z-10">
        <div className="text-yellow-400 text-sm font-medium uppercase tracking-widest mb-2">Reunion Countdown</div>
        <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>27 June 2026</h2>
        <p className="text-slate-400 text-sm mb-8">Mookambigai College of Engineering, Pudukkottai</p>
        <div className="grid grid-cols-4 gap-3">
          {units.map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <div className="text-3xl font-bold text-yellow-300 tabular-nums" style={{ fontFamily: 'var(--font-heading)' }}>
                {String(Math.max(0, value)).padStart(2, '0')}
              </div>
              <div className="text-xs text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RSVPWidget({ event, myRsvp, userId, onStatusChange }: {
  event: ReunionEvent; myRsvp: RSVP | null; userId: string
  onStatusChange?: (s: RSVPStatus) => void
}) {
  const [status, setStatus] = useState<RSVPStatus | null>(myRsvp?.status ?? null)
  const [saving, setSaving] = useState(false)

  const rsvps = (event.rsvps ?? []) as any[]
  const attending = rsvps.filter(r => r.status === 'attending').length
  const maybe = rsvps.filter(r => r.status === 'maybe').length

  async function setRsvp(s: RSVPStatus) {
    setSaving(true)
    const supabase = createClient()
    if (myRsvp) {
      await (supabase as any).from('rsvps').update({ status: s }).eq('id', myRsvp.id)
    } else {
      await (supabase as any).from('rsvps').insert({ event_id: event.id, user_id: userId, status: s })
    }
    setStatus(s)
    onStatusChange?.(s)
    setSaving(false)
  }

  const options: { s: RSVPStatus; label: string; color: string; icon: React.ReactNode }[] = [
    { s: 'attending', label: "Yes, I'm coming!", color: '#22c55e', icon: <Check className="w-4 h-4" /> },
    { s: 'maybe', label: 'Maybe', color: '#eab308', icon: <Clock className="w-4 h-4" /> },
    { s: 'not_attending', label: "Can't make it", color: '#ef4444', icon: <X className="w-4 h-4" /> },
  ]

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-semibold text-white mb-1">Your RSVP</h3>
      <p className="text-slate-400 text-sm mb-5">Let the organising team know if you're coming.</p>

      <div className="space-y-2 mb-6">
        {options.map(({ s, label, color, icon }) => (
          <button key={s} onClick={() => setRsvp(s)} disabled={saving}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: status === s ? `${color}20` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${status === s ? `${color}50` : 'rgba(255,255,255,0.08)'}`,
              color: status === s ? color : '#94a3b8',
            }}>
            <div style={{ color: status === s ? color : '#475569' }}>{icon}</div>
            {label}
            {status === s && <Check className="w-3.5 h-3.5 ml-auto" />}
          </button>
        ))}
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="text-2xl font-bold text-green-400">{attending}</div>
          <div className="text-xs text-slate-400">Attending</div>
        </div>
        <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <div className="text-2xl font-bold text-yellow-400">{maybe}</div>
          <div className="text-xs text-slate-400">Maybe</div>
        </div>
      </div>
    </div>
  )
}

function ThenNowCard({ photo }: { photo: ThenNowPhoto }) {
  const profile = photo.profile as Profile | undefined
  const color = branchColor(profile?.branch)
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-white/5">
        <div className="relative">
          <div className="absolute top-1.5 left-1.5 text-xs bg-black/60 px-1.5 py-0.5 rounded text-white/70">Then</div>
          {photo.then_photo_url
            ? <img src={photo.then_photo_url} alt="Then" className="w-full h-28 object-cover" />
            : <div className="w-full h-28 bg-white/5 flex items-center justify-center text-slate-500 text-xs">No photo</div>}
        </div>
        <div className="relative">
          <div className="absolute top-1.5 right-1.5 text-xs bg-black/60 px-1.5 py-0.5 rounded text-white/70">Now</div>
          {photo.now_photo_url
            ? <img src={photo.now_photo_url} alt="Now" className="w-full h-28 object-cover" />
            : <div className="w-full h-28 bg-white/5 flex items-center justify-center text-slate-500 text-xs">No photo</div>}
        </div>
      </div>
      <div className="p-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white"
          style={{ background: `${color}40` }}>
          {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(profile?.full_name ?? '?')}
        </div>
        <div>
          <div className="text-white text-xs font-medium">{profile?.full_name}</div>
          {photo.caption && <div className="text-slate-500 text-xs">{photo.caption}</div>}
        </div>
      </div>
    </div>
  )
}

function ThenNowUpload({ userId, onUpload }: { userId: string; onUpload: (p: ThenNowPhoto) => void }) {
  const [thenFile, setThenFile] = useState<File | null>(null)
  const [nowFile, setNowFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleUpload() {
    setUploading(true)
    const supabase = createClient()

    async function uploadFile(file: File, prefix: string) {
      const path = `then-now/${userId}/${prefix}-${Date.now()}.${file.name.split('.').pop()}`
      await (supabase.storage as any).from('reunion').upload(path, file)
      const { data: { publicUrl } } = (supabase.storage as any).from('reunion').getPublicUrl(path)
      return publicUrl
    }

    const then_photo_url = thenFile ? await uploadFile(thenFile, 'then') : null
    const now_photo_url = nowFile ? await uploadFile(nowFile, 'now') : null

    const { data } = await (supabase as any)
      .from('then_now_photos')
      .insert({ user_id: userId, then_photo_url, now_photo_url, caption: caption || null })
      .select('*, profile:profiles!user_id(id, full_name, branch, avatar_url)')
      .single()

    setUploading(false)
    if (data) { onUpload(data); setOpen(false); setThenFile(null); setNowFile(null); setCaption('') }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="w-full glass glass-hover rounded-xl px-5 py-4 flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
      <Camera className="w-4 h-4" /> Add Your Then vs Now Photo
    </button>
  )

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex justify-between mb-4">
        <h4 className="font-medium text-white">Then vs Now</h4>
        <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Then (College Days)', file: thenFile, setFile: setThenFile },
          { label: 'Now (Today)', file: nowFile, setFile: setNowFile },
        ].map(({ label, file, setFile }) => (
          <label key={label} className="cursor-pointer">
            <div className="border-2 border-dashed rounded-xl overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              {file
                ? <img src={URL.createObjectURL(file)} alt="" className="w-full h-28 object-cover" />
                : <div className="h-28 flex flex-col items-center justify-center text-slate-500">
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-xs text-center px-2">{label}</span>
                  </div>}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </label>
        ))}
      </div>
      <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)"
        className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-500 mb-3 focus:outline-none"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      />
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpload} disabled={uploading || (!thenFile && !nowFile)}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
        {uploading ? 'Uploading…' : 'Share'}
      </motion.button>
    </div>
  )
}

function ReunionPass({ profile }: { profile: Profile }) {
  const passRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)
  const color = branchColor(profile.branch as Branch | undefined)
  const initials = getInitials(profile.full_name ?? '')

  async function capture() {
    if (!passRef.current) return null
    try {
      const { toPng } = await import('html-to-image')
      return await toPng(passRef.current, { pixelRatio: 2, cacheBust: true })
    } catch { return null }
  }

  async function handleDownload() {
    setGenerating(true)
    const dataUrl = await capture()
    if (dataUrl) {
      const a = document.createElement('a')
      a.download = `MCE-Reunion-Pass-${profile.full_name ?? 'Alumni'}.png`
      a.href = dataUrl
      a.click()
    }
    setGenerating(false)
  }

  async function handleShare() {
    setGenerating(true)
    const dataUrl = await capture()
    if (!dataUrl) { setGenerating(false); return }
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'MCE-Reunion-Pass.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'MCE Silver Reunion 2026 🎓',
          text: `I'm attending the MCE 25th Year Silver Reunion on 27 June 2026! 🎉`,
        })
      } else {
        const text = encodeURIComponent(`🎓 I'm attending the MCE 25th Year Silver Reunion on 27 June 2026 at MCE, Pudukkottai! Join us → https://mce25.vercel.app`)
        window.open(`https://wa.me/?text=${text}`, '_blank')
      }
    } catch { /* user cancelled */ }
    setGenerating(false)
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
      <p className="text-xs text-slate-400 mb-3 text-center uppercase tracking-widest font-medium">🎟️ Your Reunion Pass</p>

      {/* Pass card — inline styles for reliable image capture */}
      <div ref={passRef} style={{
        background: 'linear-gradient(145deg,#05080f 0%,#0d1020 60%,#100810 100%)',
        border: '1px solid rgba(234,179,8,0.4)',
        borderRadius: '16px',
        overflow: 'hidden',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
        boxShadow: '0 0 40px rgba(234,179,8,0.15)',
      }}>
        {/* Gold top stripe */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg,#d97706,#eab308,#fbbf24,#eab308,#d97706)' }} />

        {/* Header */}
        <div style={{ padding: '18px 24px 14px', textAlign: 'center', borderBottom: '1px dashed rgba(234,179,8,0.2)' }}>
          <div style={{ fontSize: '26px', marginBottom: '6px' }}>🎓</div>
          <div style={{ color: '#fbbf24', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            MCE Silver Reunion
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '0.12em', marginTop: '3px' }}>
            25TH YEAR ANNIVERSARY · CLASS OF 2001
          </div>
        </div>

        {/* Member details */}
        <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px dashed rgba(234,179,8,0.2)' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
            background: `${color}25`, border: `2px solid ${color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, color,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.full_name}
            </div>
            <div style={{ color, fontSize: '12px', fontWeight: 600, marginBottom: '2px' }}>
              {profile.branch} Department
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
              SPRNO: {profile.sprno}
            </div>
          </div>
        </div>

        {/* Event details */}
        <div style={{ padding: '14px 24px', borderBottom: '1px dashed rgba(234,179,8,0.2)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', marginTop: '1px' }}>📅</span>
            <div>
              <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 600 }}>27 June 2026, Saturday</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px' }}>9:00 AM onwards</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', marginTop: '1px' }}>📍</span>
            <div>
              <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: 600 }}>Mookambigai College of Engineering</div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px' }}>Pudukkottai, Tamil Nadu</div>
            </div>
          </div>
        </div>

        {/* Badge + URL */}
        <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)',
            borderRadius: '20px', padding: '4px 12px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Attending · Admit One
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: '10px', letterSpacing: '0.08em' }}>
            mce25.vercel.app
          </div>
        </div>

        {/* Gold bottom stripe */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg,#d97706,#eab308,#fbbf24,#eab308,#d97706)' }} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleShare} disabled={generating}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)' }}>
          <Share2 className="w-4 h-4" />
          {generating ? 'Preparing…' : 'Share on WhatsApp'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleDownload} disabled={generating}
          className="px-4 py-2.5 rounded-xl text-slate-300 disabled:opacity-60 glass flex items-center">
          <Download className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function ReunionClient({
  event, profile, thenNowPhotos: initialPhotos, myRsvp,
}: {
  event: ReunionEvent | null
  profile: Profile
  thenNowPhotos: ThenNowPhoto[]
  myRsvp: RSVP | null
}) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [rsvpStatus, setRsvpStatus] = useState<RSVPStatus | null>(myRsvp?.status ?? null)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Silver Reunion 2026 🎓</h1>
        <p className="text-slate-400">25 Years of MCE Friendship — Coming Together Again</p>
      </div>

      {/* RSVP nudge — visible only until the user RSVPs */}
      {event && !myRsvp && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}
        >
          <div className="text-2xl shrink-0">🎟️</div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm">You haven't RSVPed yet!</div>
            <div className="text-slate-400 text-xs">Let your batchmates know you're coming on 27 June. Scroll down to RSVP — it takes 2 seconds.</div>
          </div>
          <a href="#rsvp" className="shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold text-yellow-900"
            style={{ background: '#eab308' }}>
            RSVP Now
          </a>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main */}
        <div className="lg:col-span-3 space-y-6">
          <Countdown />

          {/* Event Details */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">Event Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-white font-medium">27 June 2026, Saturday</div>
                  <div className="text-slate-400 text-sm">9:00 AM onwards</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-white font-medium">Mookambigai College of Engineering</div>
                  <div className="text-slate-400 text-sm">Pudukkottai, Tamil Nadu</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-white font-medium">Batch 1997–2001</div>
                  <div className="text-slate-400 text-sm">CSE · ECE · EEE · MECH · PE · All Branches</div>
                </div>
              </div>
            </div>
          </div>

          {/* Then vs Now */}
          <div>
            <h3 className="font-semibold text-white mb-4">Then vs Now Challenge 📸</h3>
            <div className="mb-4">
              <ThenNowUpload userId={profile.id} onUpload={p => setPhotos(prev => [p, ...prev])} />
            </div>
            {photos.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <div className="text-3xl mb-2">📸</div>
                <div className="text-slate-400 text-sm">No Then vs Now photos yet. Be the first!</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photos.map(p => <ThenNowCard key={p.id} photo={p} />)}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Reunion Pass — shown after RSVP attending */}
          <AnimatePresence>
            {rsvpStatus === 'attending' && (
              <ReunionPass profile={profile} />
            )}
          </AnimatePresence>

          {event && (
            <div id="rsvp">
              <RSVPWidget event={event} myRsvp={myRsvp} userId={profile.id} onStatusChange={setRsvpStatus} />
            </div>
          )}
          {!event && (
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">📅</div>
              <div className="text-white font-semibold">RSVP Coming Soon</div>
              <div className="text-slate-400 text-sm mt-1">Event details will be posted by the organising team.</div>
            </div>
          )}

          {/* Attending list */}
          {event && (event.rsvps ?? []).filter((r: any) => r.status === 'attending').length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" /> Coming ({(event.rsvps ?? []).filter((r: any) => r.status === 'attending').length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {(event.rsvps ?? []).filter((r: any) => r.status === 'attending').slice(0, 12).map((rsvp: any) => {
                  const p = rsvp.profile as Profile | undefined
                  const color = branchColor(p?.branch)
                  return (
                    <div key={rsvp.id} title={p?.full_name}
                      className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white border-2 border-[#0a0e1a]"
                      style={{ background: `${color}40` }}>
                      {p?.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(p?.full_name ?? '?')}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
