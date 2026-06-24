export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import MapClient from './MapClient'
import type { Profile } from '@/types/database'

export default async function MapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: alumni }, { data: myProfile }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, branch, graduation_year, avatar_url, city, country, current_position, company, lat, lng, sprno, bio, linkedin_url, twitter_url, github_url, website_url, skills, phone, role, status, is_profile_complete, created_at, updated_at')
      .eq('status', 'approved')
      .not('country', 'is', null),
    supabase.from('profiles').select('city, lat, lng').eq('id', user.id).single(),
  ])

  const currentUserHasLocation = !!(myProfile?.city || (myProfile?.lat && myProfile?.lng))

  return (
    <AppShell>
      <MapClient alumni={(alumni ?? []) as Profile[]} currentUserHasLocation={currentUserHasLocation} />
    </AppShell>
  )
}
