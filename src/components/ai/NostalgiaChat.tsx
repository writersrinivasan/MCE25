'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Loader2, Sparkles, Key } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Msg = { role: 'user' | 'assistant'; content: string }

const STARTERS = [
  'Who from my batch is attending the reunion?',
  'Tell me funny memories from the college days',
  'What branch had the most memories shared?',
  'When and where is the reunion?',
]

export function NostalgiaChat({ hasApiKey }: { hasApiKey: boolean }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [apiError, setApiError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (open && hasApiKey) setTimeout(() => inputRef.current?.focus(), 200) }, [open, hasApiKey])

  async function fetchContext(query: string): Promise<string> {
    try {
      const res = await fetch('/api/ai/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, limit: 5 }) })
      const { results } = await res.json()
      if (!results?.length) return ''
      return results.map((r: any) => `- ${r.title ?? ''}: ${(r.content ?? '').slice(0, 200)}`).join('\n')
    } catch { return '' }
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || streaming) return
    setInput('')
    setApiError('')

    const newMessages: Msg[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setStreaming(true)

    const context = await fetchContext(msg)
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages, context }),
    })

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: '' }))
      setStreaming(false)
      if (error === 'NO_API_KEY') {
        setApiError('no_key')
      } else if (error === 'INVALID_API_KEY') {
        setApiError('invalid_key')
      } else {
        setApiError('error')
      }
      setMessages(m => m.slice(0, -1))
      return
    }

    if (!res.body) { setStreaming(false); return }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let assistantMsg = ''
    setMessages(m => [...m, { role: 'assistant', content: '' }])

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const lines = decoder.decode(value).split('\n')
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6)
        if (payload === '[DONE]') break
        try {
          const { text } = JSON.parse(payload)
          assistantMsg += text
          setMessages(m => [...m.slice(0, -1), { role: 'assistant', content: assistantMsg }])
        } catch {}
      }
    }
    setStreaming(false)
  }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            title="MCE Nostalgia Bot"
          >
            <Sparkles className="w-6 h-6 text-white" />
            {!hasApiKey && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{ background: '#f59e0b', fontSize: 9, fontWeight: 700 }}>!</span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#0d1117', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">MCE Nostalgia Bot</div>
                  <div className="text-violet-400 text-xs">AI · GPT-4o mini</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Locked state — no API key */}
            {!hasApiKey ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Key className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">AI Features Locked</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  To chat with the Nostalgia Bot, add your OpenAI API key in Settings. It takes 30 seconds and costs less than a rupee per conversation.
                </p>
                <Link href="/settings" onClick={() => setOpen(false)}>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    Add API Key in Settings
                  </motion.div>
                </Link>
                <p className="text-xs text-slate-600 mt-3">Free key from platform.openai.com</p>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide min-h-0">
                  {messages.length === 0 && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <div className="text-slate-300 text-sm rounded-2xl rounded-tl-sm px-3 py-2 max-w-[260px]"
                          style={{ background: 'rgba(99,102,241,0.12)' }}>
                          Vanakkam! 🎓 I'm your MCE Nostalgia Bot. Ask me anything about your batch, the reunion, or memories from 1997–2001!
                        </div>
                      </div>
                      <div className="space-y-1.5 mt-2">
                        <div className="text-xs text-slate-600 px-1">Try asking:</div>
                        {STARTERS.map(s => (
                          <button key={s} onClick={() => send(s)}
                            className="w-full text-left text-xs px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} className={cn('flex items-end gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={cn('text-sm px-3 py-2 rounded-2xl max-w-[250px] whitespace-pre-wrap',
                        msg.role === 'user' ? 'text-white rounded-br-sm' : 'text-slate-300 rounded-bl-sm')}
                        style={msg.role === 'user' ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : { background: 'rgba(255,255,255,0.06)' }}>
                        {msg.content || (streaming && i === messages.length - 1 ? <Loader2 className="w-3 h-3 animate-spin" /> : '')}
                      </div>
                    </div>
                  ))}

                  {/* Inline error states */}
                  {apiError === 'no_key' && (
                    <div className="text-center py-2">
                      <p className="text-xs text-yellow-400 mb-2">API key not found.</p>
                      <Link href="/settings" onClick={() => setOpen(false)} className="text-xs text-violet-400 underline">Add key in Settings</Link>
                    </div>
                  )}
                  {apiError === 'invalid_key' && (
                    <div className="text-center py-2">
                      <p className="text-xs text-red-400 mb-2">API key is invalid or expired.</p>
                      <Link href="/settings" onClick={() => setOpen(false)} className="text-xs text-violet-400 underline">Update key in Settings</Link>
                    </div>
                  )}
                  {apiError === 'error' && (
                    <p className="text-xs text-red-400 text-center py-2">Something went wrong. Please try again.</p>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                      placeholder="Ask about memories, reunion, classmates…"
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      disabled={streaming}
                    />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => send()} disabled={!input.trim() || streaming}
                      className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                      {streaming ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
