'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Eye, EyeOff, Check, Trash2, ExternalLink, Shield, Sparkles, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SettingsClient({
  userId, hasApiKey: initialHasKey, maskedKey,
}: {
  userId: string
  hasApiKey: boolean
  maskedKey: string | null
}) {
  const router = useRouter()
  const [hasKey, setHasKey] = useState(initialHasKey)
  const [displayed, setDisplayed] = useState(maskedKey)
  const [input, setInput] = useState('')
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function saveKey() {
    const key = input.trim()
    if (!key.startsWith('sk-')) { setError('Key must start with sk-'); return }
    setSaving(true); setError('')
    const supabase = createClient()
    await (supabase as any).from('profiles').update({ openai_api_key: key }).eq('id', userId)
    setSaving(false)
    setHasKey(true)
    setDisplayed(`sk-...${key.slice(-4)}`)
    setInput('')
    setSaved(true)
    router.refresh() // re-fetches server props so NostalgiaChat unlocks immediately
    setTimeout(() => setSaved(false), 3000)
  }

  async function removeKey() {
    const supabase = createClient()
    await (supabase as any).from('profiles').update({ openai_api_key: null }).eq('id', userId)
    setHasKey(false)
    setDisplayed(null)
    setInput('')
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Settings</h1>
        <p className="text-slate-400 mb-10">Personalise your MCE Reunion experience</p>

        {/* AI Features section */}
        <div className="glass rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">AI Features</h2>
              <p className="text-slate-500 text-xs">Nostalgia Bot · Semantic Memory Search</p>
            </div>
            {hasKey && (
              <span className="ml-auto flex items-center gap-1 text-xs text-green-400 font-medium px-2 py-1 rounded-full"
                style={{ background: 'rgba(34,197,94,0.1)' }}>
                <Check className="w-3 h-3" /> Active
              </span>
            )}
          </div>

          <div className="mt-5 p-4 rounded-xl mb-5"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <p className="text-slate-300 text-sm leading-relaxed">
              AI features use your personal OpenAI API key — it's stored securely on the server and
              <strong className="text-white"> never shared</strong> with other users or sent to the browser.
              You pay only for what you use (typically &lt;$0.01 per conversation).
            </p>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors">
              <ExternalLink className="w-3 h-3" /> Get your free API key at platform.openai.com
            </a>
          </div>

          {hasKey ? (
            <div>
              <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <Key className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-green-300 text-sm font-mono flex-1">{displayed}</span>
                <button onClick={removeKey}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors" title="Remove key">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500">To update, remove the current key and add a new one.</p>
            </div>
          ) : (
            <div>
              <label className="block text-xs text-slate-400 mb-2">Your OpenAI API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={show ? 'text' : 'password'}
                    value={input}
                    onChange={e => { setInput(e.target.value); setError('') }}
                    placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxx"
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}` }}
                  />
                  <button onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={saveKey} disabled={saving || !input.trim()}
                  className="px-5 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {saved ? <Check className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                  {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Key'}
                </motion.button>
              </div>
              {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
            </div>
          )}
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-3 p-4 rounded-xl"
          style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.12)' }}>
          <Shield className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-yellow-300 text-xs font-semibold mb-0.5">Your key, your control</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Your API key is only used for your AI requests. It's stored encrypted in the database and never logged or exposed in API responses. You can remove it at any time.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
