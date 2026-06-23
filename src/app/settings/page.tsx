export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, openai_api_key')
    .eq('id', user!.id)
    .single()

  return (
    <AppShell>
      <SettingsClient
        userId={user!.id}
        hasApiKey={!!profile?.openai_api_key}
        maskedKey={profile?.openai_api_key ? `sk-...${profile.openai_api_key.slice(-4)}` : null}
      />
    </AppShell>
  )
}
