export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import DashboardClient from './DashboardClient'
import type { Profile, Memory, ReunionEvent } from '@/types/database'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const params = await searchParams
  const isWelcome = params?.welcome === '1'

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/onboarding')

  const [
    { data: recentMemories },
    { data: reunion },
    { data: statsData },
    { count: myMemoryCount },
    { data: myRsvp },
  ] = await Promise.all([
    supabase
      .from('memories')
      .select('*, author:profiles!author_id(id, full_name, branch, avatar_url, sprno)')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('reunion_events')
      .select('*')
      .order('event_date', { ascending: true })
      .limit(1)
      .single(),
    supabase.from('profiles').select('branch', { count: 'exact' }).eq('status', 'approved'),
    supabase.from('memories').select('*', { count: 'exact', head: true }).eq('author_id', user.id),
    supabase.from('rsvps').select('status').eq('user_id', user.id).limit(1).maybeSingle(),
  ])

  const guidanceData = {
    hasMemory: (myMemoryCount ?? 0) > 0,
    hasRSVP: myRsvp != null,
    hasLocation: !!(profile.city || (profile.lat && profile.lng)),
  }

  return (
    <AppShell>
      <DashboardClient
        profile={profile as Profile}
        recentMemories={(recentMemories ?? []) as Memory[]}
        reunionEvent={(reunion as ReunionEvent | null) ?? null}
        totalAlumni={statsData?.length ?? 0}
        guidanceData={guidanceData}
        isWelcome={isWelcome}
      />
    </AppShell>
  )
}
