export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import BranchWallClient from './BranchWallClient'
import { BRANCHES, type Branch, type Memory, type Profile } from '@/types/database'

export default async function BranchWallPage({ params }: { params: Promise<{ branch: string }> }) {
  const { branch: branchParam } = await params
  const isAll = branchParam === 'all'
  const branch = branchParam as Branch

  if (!isAll && !BRANCHES.includes(branch)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  let query = supabase
    .from('memories')
    .select('*, author:profiles!author_id(id, full_name, branch, avatar_url, sprno)')
    .order('created_at', { ascending: false })
    .limit(30)

  if (!isAll) query = query.eq('branch', branch)

  const { data: memories } = await query

  return (
    <AppShell>
      <BranchWallClient
        branch={isAll ? null : branch}
        memories={(memories ?? []) as Memory[]}
        currentProfile={profile as Profile}
      />
    </AppShell>
  )
}
