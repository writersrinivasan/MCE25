export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import SearchClient from './SearchClient'

export default async function SearchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('openai_api_key')
    .eq('id', user!.id)
    .single()

  return (
    <AppShell>
      <SearchClient hasApiKey={!!profile?.openai_api_key} />
    </AppShell>
  )
}
