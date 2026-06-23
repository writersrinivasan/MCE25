export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminOverviewClient from './AdminOverviewClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [
    { count: totalMembers },
    { count: pendingCount },
    { count: memoriesCount },
    { count: attendingCount },
    { data: branchBreakdown },
    { data: recentMembers },
    { data: recentMemories },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('memories').select('*', { count: 'exact', head: true }),
    supabase.from('rsvps').select('*', { count: 'exact', head: true }).eq('status', 'attending'),
    supabase.from('profiles').select('branch').eq('status', 'approved'),
    supabase.from('profiles')
      .select('id, full_name, branch, sprno, city, country, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('memories')
      .select('id, title, content, branch, created_at, author:profiles!author_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const branchCounts = (branchBreakdown ?? []).reduce<Record<string, number>>((acc, r: any) => {
    acc[r.branch] = (acc[r.branch] ?? 0) + 1
    return acc
  }, {})

  return (
    <AdminOverviewClient
      stats={{
        totalMembers: totalMembers ?? 0,
        pendingCount: pendingCount ?? 0,
        memoriesCount: memoriesCount ?? 0,
        attendingCount: attendingCount ?? 0,
      }}
      branchCounts={branchCounts}
      recentMembers={(recentMembers ?? []) as any[]}
      recentMemories={(recentMemories ?? []) as any[]}
    />
  )
}
