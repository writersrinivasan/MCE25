import { NextRequest, NextResponse } from 'next/server'
import { OpenAIEmbeddings } from '@langchain/openai'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { query, branch, limit = 10 } = await req.json()
  if (!query?.trim()) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch the user's own API key — never use a global server key
  const { data: profile } = await supabase
    .from('profiles')
    .select('openai_api_key')
    .eq('id', user.id)
    .single()

  const apiKey = profile?.openai_api_key

  if (apiKey) {
    // Vector (semantic) search
    try {
      const embeddings = new OpenAIEmbeddings({ openAIApiKey: apiKey, modelName: 'text-embedding-3-small' })
      const [queryEmbedding] = await embeddings.embedDocuments([query])

      const { data: vectorResults, error } = await (supabase as any).rpc('match_memories', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: limit,
        filter_branch: branch ?? null,
      })

      if (!error && vectorResults?.length > 0) {
        return NextResponse.json({ results: vectorResults, mode: 'vector' })
      }
    } catch {
      // Fall through to keyword search if vector fails
    }
  }

  // Keyword fallback (always available, no API key needed)
  let q = (supabase as any)
    .from('memories')
    .select('id, title, content, branch, media_type, media_url, created_at, author:profiles!author_id(full_name, branch, avatar_url)')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (branch) q = q.eq('branch', branch)
  const { data: textResults } = await q

  return NextResponse.json({ results: textResults ?? [], mode: 'keyword' })
}
