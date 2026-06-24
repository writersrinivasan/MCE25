export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import CapsuleClient from './CapsuleClient'

const REVEAL_DATE = new Date('2026-06-27T03:30:00Z')

export default async function CapsulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const isRevealed = new Date() >= REVEAL_DATE

  const { data: myCapsule } = await (supabase as any)
    .from('time_capsules')
    .select('id, message')
    .eq('author_id', user.id)
    .single()

  const { count: totalCount } = await (supabase as any)
    .from('time_capsules')
    .select('id', { count: 'exact', head: true })

  let allCapsules: any[] = []
  if (isRevealed) {
    const { data } = await (supabase as any)
      .from('time_capsules')
      .select('*, author:profiles!author_id(id, full_name, branch, avatar_url)')
      .order('created_at', { ascending: true })
    allCapsules = data ?? []
  }

  return (
    <AppShell>
      <div className="min-h-screen pt-20 pb-16 px-4" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(234,179,8,0.07), transparent)',
      }}>
        <CapsuleClient
          userId={user.id}
          myCapsule={myCapsule ?? null}
          allCapsules={allCapsules}
          totalCount={totalCount ?? 0}
          isRevealed={isRevealed}
        />
      </div>
    </AppShell>
  )
}
