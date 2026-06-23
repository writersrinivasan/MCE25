export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import ReunionClient from './ReunionClient'
import type { Profile, ReunionEvent, RSVP, ThenNowPhoto } from '@/types/database'

export default async function ReunionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { data: event } = await supabase
    .from('reunion_events')
    .select('*, rsvps:rsvps(*, profile:profiles!user_id(id, full_name, branch, avatar_url))')
    .order('event_date', { ascending: true })
    .limit(1)
    .single()

  const { data: thenNow } = await supabase
    .from('then_now_photos')
    .select('*, profile:profiles!user_id(id, full_name, branch, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: myRsvp } = event
    ? await supabase.from('rsvps').select('*').eq('event_id', event.id).eq('user_id', user.id).single()
    : { data: null }

  return (
    <AppShell>
      <ReunionClient
        event={event as ReunionEvent | null}
        profile={profile as Profile}
        thenNowPhotos={(thenNow ?? []) as ThenNowPhoto[]}
        myRsvp={myRsvp as RSVP | null}
      />
    </AppShell>
  )
}
