'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function sprnoCredentials(sprno: string) {
  return {
    email: `${sprno.trim()}@mce97batch.alumni`,
    password: `MCE${sprno.trim()}Silver2026`,
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [sprno, setSprno] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { email, password } = sprnoCredentials(sprno)
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError('SPRNO not recognised. Please register first or check your number.')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: '#05080f' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.15), transparent)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-3xl font-bold text-gradient mb-1" style={{ fontFamily: 'var(--font-heading)' }}>MCE Silver</div>
            <div className="text-slate-400 text-sm">Silver Reunion Portal</div>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Welcome back</h1>
          <p className="text-slate-400 text-sm mb-6">Enter your SPRNO to sign in</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Your SPRNO</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={sprno}
                  onChange={e => setSprno(e.target.value)}
                  required
                  placeholder="e.g. 97087"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {loading ? 'Signing in…' : (<>Sign In <ArrowRight className="w-4 h-4" /></>)}
            </motion.button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            First time?{' '}
            <Link href="/auth/register" className="text-violet-400 hover:text-violet-300 font-medium">
              Register with your SPRNO
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Only MCE 1997–2001 batch alumni can access this portal.
        </p>
      </motion.div>
    </div>
  )
}
