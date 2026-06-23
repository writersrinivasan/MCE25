'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Check, Edit3, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

type ReunionEvent = { id: string; title: string; description: string | null; event_date: string; venue: string | null }

export default function EventClient({
  event: initial, authorId, rsvpCounts,
}: {
  event: ReunionEvent | null
  authorId: string
  rsvpCounts: { attending: number; maybe: number; notAttending: number }
}) {
  const [event, setEvent] = useState(initial)
  const [editing, setEditing] = useState(!initial)
  const [title, setTitle] = useState(initial?.title ?? 'MCE Silver Reunion 2026')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [eventDate, setEventDate] = useState(initial?.event_date ? initial.event_date.slice(0, 16) : '2026-06-27T09:00')
  const [venue, setVenue] = useState(initial?.venue ?? 'Mookambigai College of Engineering, Pudukkottai, Tamil Nadu')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const payload = { title, description: description || null, event_date: new Date(eventDate).toISOString(), venue: venue || null }

    if (event) {
      await (supabase as any).from('reunion_events').update(payload).eq('id', event.id)
      setEvent(e => e ? { ...e, ...payload } : e)
    } else {
      const { data } = await (supabase as any)
        .from('reunion_events')
        .insert({ ...payload, created_by: authorId })
        .select().single()
      if (data) setEvent(data)
    }
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const total = rsvpCounts.attending + rsvpCounts.maybe + rsvpCounts.notAttending

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Reunion Event</h1>
          <p className="text-slate-400 text-sm">Manage the June 27 2026 reunion details</p>
        </div>
        {event && !editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-300 glass hover:bg-white/10 transition-all">
            <Edit3 className="w-4 h-4" /> Edit Details
          </button>
        )}
      </div>

      {/* RSVP stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Attending', count: rsvpCounts.attending, color: '#22c55e', emoji: '✅' },
          { label: 'Maybe', count: rsvpCounts.maybe, color: '#eab308', emoji: '🤔' },
          { label: "Can't Come", count: rsvpCounts.notAttending, color: '#ef4444', emoji: '❌' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl mb-1">{s.emoji}</div>
            <div className="text-3xl font-bold mb-0.5" style={{ color: s.color, fontFamily: 'var(--font-heading)' }}>{s.count}</div>
            <div className="text-slate-400 text-xs">{s.label}</div>
            {total > 0 && <div className="text-slate-500 text-xs mt-1">{Math.round((s.count / total) * 100)}%</div>}
          </motion.div>
        ))}
      </div>

      {/* RSVP progress bar */}
      {total > 0 && (
        <div className="glass rounded-xl p-4 mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>RSVP Responses</span>
            <span>{total} total</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden bg-white/5 flex">
            <div style={{ width: `${(rsvpCounts.attending / total) * 100}%`, background: '#22c55e' }} className="h-full transition-all" />
            <div style={{ width: `${(rsvpCounts.maybe / total) * 100}%`, background: '#eab308' }} className="h-full transition-all" />
            <div style={{ width: `${(rsvpCounts.notAttending / total) * 100}%`, background: '#ef4444' }} className="h-full transition-all" />
          </div>
        </div>
      )}

      {/* Event form / view */}
      <div className="glass rounded-2xl p-6">
        {saved && (
          <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm text-green-300"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Check className="w-4 h-4" /> Event details saved successfully!
          </div>
        )}

        {editing ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-white mb-2">{event ? 'Edit Event' : 'Create Event'}</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Event Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Date & Time</label>
              <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Venue</label>
              <input value={venue} onChange={e => setVenue(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full px-4 py-3 rounded-xl text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <div className="flex gap-3">
              {event && <button onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
                <Check className="w-4 h-4" />
                {saving ? 'Saving…' : event ? 'Save Changes' : 'Create Event'}
              </motion.button>
            </div>
          </div>
        ) : event ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{event.title}</h3>
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-yellow-400" />
              {format(new Date(event.event_date), 'EEEE, d MMMM yyyy · h:mm a')}
            </div>
            {event.venue && (
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-green-400" />
                {event.venue}
              </div>
            )}
            {event.description && (
              <p className="text-slate-400 text-sm leading-relaxed pt-2 border-t border-white/5">{event.description}</p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-white font-semibold mb-1">No event created yet</div>
            <div className="text-slate-400 text-sm mb-4">Create the reunion event so alumni can RSVP.</div>
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm mx-auto"
              style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
              <Plus className="w-4 h-4" /> Create Event
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
