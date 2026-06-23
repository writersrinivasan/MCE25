export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import DashboardClient from './DashboardClient'
import type { Profile, Memory, ReunionEvent } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/auth/login')

  const { data: recentMemories } = await supabase
    .from('memories')
    .select('*, author:profiles!author_id(id, full_name, branch, avatar_url, sprno)')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: reunion } = await supabase
    .from('reunion_events')
    .select('*')
    .order('event_date', { ascending: true })
    .limit(1)
    .single()

  const { data: statsData } = await supabase.from('profiles').select('branch', { count: 'exact' }).eq('status', 'approved')

  return (
    <AppShell>
      <DashboardClient
        profile={profile as Profile}
        recentMemories={(recentMemories ?? []) as Memory[]}
        reunionEvent={reunion as ReunionEvent | null}
        totalAlumni={statsData?.length ?? 0}
      />
    </AppShell>
  )
}
