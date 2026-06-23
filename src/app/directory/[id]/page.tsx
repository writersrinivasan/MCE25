export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import ProfileClient from './ProfileClient'
import type { Profile, Memory } from '@/types/database'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (!profile) notFound()

  const { data: memories } = await supabase
    .from('memories')
    .select('*, author:profiles!author_id(id, full_name, branch, avatar_url, sprno)')
    .eq('author_id', id)
    .order('created_at', { ascending: false })
    .limit(12)

  const { data: currentProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <AppShell>
      <ProfileClient
        profile={profile as Profile}
        memories={(memories ?? []) as Memory[]}
        isOwnProfile={user.id === id}
        currentProfile={currentProfile as Profile}
      />
    </AppShell>
  )
}
