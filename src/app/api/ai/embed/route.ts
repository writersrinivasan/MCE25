import { NextRequest, NextResponse } from 'next/server'
import { OpenAIEmbeddings } from '@langchain/openai'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { memoryId, title, content } = await req.json()
  if (!memoryId) return NextResponse.json({ error: 'memoryId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('openai_api_key')
    .eq('id', user.id)
    .single()

  if (!profile?.openai_api_key) {
    return NextResponse.json({ skipped: true, reason: 'no_api_key' })
  }

  const text = [title, content].filter(Boolean).join(' ').trim()
  if (!text) return NextResponse.json({ skipped: true, reason: 'no_text' })

  try {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: profile.openai_api_key,
      modelName: 'text-embedding-3-small',
    })
    const [vector] = await embeddings.embedDocuments([text])

    await (supabase as any)
      .from('memories')
      .update({ embedding: vector })
      .eq('id', memoryId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ skipped: true, reason: err.message })
  }
}
