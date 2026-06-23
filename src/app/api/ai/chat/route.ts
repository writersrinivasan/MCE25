import { NextRequest, NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const SYSTEM = `You are "MCE Nostalgia Bot", a warm and cheerful AI for the MCE (Mookambigai College of Engineering) batch of 1997-2001 Silver Reunion.

You have access to alumni memories, reunion details, and the alumni directory. Help alumni:
- Recall shared memories and college experiences
- Find out which classmates are attending the reunion
- Answer questions about the June 27, 2026 reunion
- Discover fun facts and trivia about their batch
- Connect with long-lost friends by branch (CSE, ECE, EEE, MECH, PE)

Be warm, nostalgic, and use occasional Tamil/English mix (Tanglish) to feel authentic. Use 🎓 and other relevant emojis. Keep responses concise.`

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch the user's own API key — never use a global server key
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, branch, graduation_year, openai_api_key')
    .eq('id', user.id)
    .single()

  if (!profile?.openai_api_key) {
    return NextResponse.json({ error: 'NO_API_KEY' }, { status: 402 })
  }

  const systemWithContext = `${SYSTEM}

Current user: ${profile.full_name ?? 'Alumni'} from ${profile.branch ?? 'Unknown'} branch, batch ${profile.graduation_year ?? '2001'}.

${context ? `Relevant memories/data:\n${context}` : ''}`

  try {
    const llm = new ChatOpenAI({
      openAIApiKey: profile.openai_api_key,
      modelName: 'gpt-4o-mini',
      streaming: true,
      temperature: 0.7,
    })

    const langchainMessages = [
      new SystemMessage(systemWithContext),
      ...messages.map((m: { role: string; content: string }) =>
        m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
    ]

    const stream = await llm.stream(langchainMessages)

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = typeof chunk.content === 'string' ? chunk.content : ''
          if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    })
  } catch (err: any) {
    const msg = err?.message ?? ''
    if (msg.includes('Incorrect API key') || msg.includes('401')) {
      return NextResponse.json({ error: 'INVALID_API_KEY' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
