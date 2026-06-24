export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, branch, role, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile || !['branch_admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return <AdminShell profile={profile as any}>{children}</AdminShell>
}
