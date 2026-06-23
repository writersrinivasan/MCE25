export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import EventClient from './EventClient'

export default async function AdminEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: event } = await supabase
    .from('reunion_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { count: attending } = await supabase
    .from('rsvps').select('*', { count: 'exact', head: true }).eq('status', 'attending')
  const { count: maybe } = await supabase
    .from('rsvps').select('*', { count: 'exact', head: true }).eq('status', 'maybe')
  const { count: notAttending } = await supabase
    .from('rsvps').select('*', { count: 'exact', head: true }).eq('status', 'not_attending')

  return (
    <EventClient
      event={event as any}
      authorId={user!.id}
      rsvpCounts={{ attending: attending ?? 0, maybe: maybe ?? 0, notAttending: notAttending ?? 0 }}
    />
  )
}
