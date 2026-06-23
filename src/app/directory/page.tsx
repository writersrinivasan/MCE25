export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import DirectoryClient from './DirectoryClient'
import type { Profile } from '@/types/database'

export default async function DirectoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: alumni } = await supabase
    .from('profiles')
    .select('id, full_name, branch, graduation_year, avatar_url, city, country, current_position, company, linkedin_url, sprno, bio, twitter_url, github_url, website_url, skills, phone, role, status, is_profile_complete, lat, lng, created_at, updated_at')
    .eq('status', 'approved')
    .order('full_name', { ascending: true })

  return (
    <AppShell>
      <DirectoryClient alumni={(alumni ?? []) as Profile[]} />
    </AppShell>
  )
}
