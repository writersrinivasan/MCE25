export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import MembersClient from './MembersClient'

export default async function AdminMembersPage() {
  const supabase = await createClient()

  const [{ data: pending }, { data: approved }] = await Promise.all([
    supabase.from('profiles')
      .select('id, full_name, branch, sprno, city, country, graduation_year, created_at, role, status, is_profile_complete')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase.from('profiles')
      .select('id, full_name, branch, sprno, city, country, graduation_year, created_at, role, status, is_profile_complete')
      .eq('status', 'approved')
      .order('full_name', { ascending: true }),
  ])

  return <MembersClient pending={(pending ?? []) as any[]} approved={(approved ?? []) as any[]} />
}
