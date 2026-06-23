export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import AnnouncementsClient from './AnnouncementsClient'

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: announcements, error } = await (supabase as any)
    .from('announcements')
    .select('*, author:profiles!author_id(full_name, branch)')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error?.code === '42P01') {
    // announcements table not created yet — prompt admin to run the SQL
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Announcements</h1>
        <div className="glass rounded-2xl p-6 border border-yellow-500/20 bg-yellow-500/5">
          <p className="text-yellow-300 font-semibold mb-2">Table not found</p>
          <p className="text-slate-400 text-sm">Run the announcements table SQL in Supabase first. Check the project README or migrations folder.</p>
        </div>
      </div>
    )
  }

  return <AnnouncementsClient announcements={(announcements ?? []) as any[]} authorId={user!.id} />
}
