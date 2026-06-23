import { createClient } from '@/lib/supabase/server'
import { Navbar } from './Navbar'
import { NostalgiaChat } from '@/components/ai/NostalgiaChat'
import type { Profile } from '@/types/database'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, branch, graduation_year, avatar_url, role, status, is_profile_complete, openai_api_key')
      .eq('id', user.id)
      .single()
    profile = data as Profile | null
  }
  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a' }}>
      <Navbar profile={profile} />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
      {profile && <NostalgiaChat hasApiKey={!!profile.openai_api_key} />}
    </div>
  )
}
