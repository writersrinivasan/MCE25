'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { verifyWhitelist } from './actions'
import { createClient } from '@/lib/supabase/client'
import { BRANCH_META, type AlumniWhitelist } from '@/types/database'

function sprnoCredentials(sprno: string) {
  return {
    email: `${sprno.trim()}@mce97batch.alumni`,
    password: `MCE${sprno.trim()}Silver2026`,
  }
}

type Step = 'verify' | 'done'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('verify')
  const [sprno, setSprno] = useState('')
  const [alumniData, setAlumniData] = useState<AlumniWhitelist | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleVerifyAndRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Step 1: check whitelist
      const result = await verifyWhitelist(sprno.trim())
      if (!result.success || !result.data) {
        setError(result.error ?? 'SPRNO not found. Please check and try again.')
        return
      }
      const alumni = result.data
      setAlumniData(alumni)

      // Step 2: sign up with derived credentials
      const supabase = createClient()
      const { email, password } = sprnoCredentials(alumni.sprno)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            sprno: alumni.sprno,
            name: alumni.name,
            branch: alumni.dept,
            batch_year: String(alumni.batch_year),
          },
        },
      })

      if (signUpError) {
        // Already registered — sign them in directly
        if (signUpError.message?.toLowerCase().includes('already registered') ||
            signUpError.message?.toLowerCase().includes('already been registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
          if (!signInError) {
            router.push('/dashboard')
            router.refresh()
            return
          }
        }
        setError(signUpError.message ?? 'Registration failed. Please try again.')
        return
      }

      if (!data.user) {
        setError('Registration failed. Please try again.')
        return
      }

      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: '#05080f' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.15), transparent)' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="text-3xl font-bold text-gradient mb-1" style={{ fontFamily: 'var(--font-heading)' }}>MCE Silver</div>
            <div className="text-slate-400 text-sm">Silver Reunion Portal</div>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {step === 'verify' && (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Join the Reunion</h1>
                <p className="text-slate-400 text-sm mb-6">Enter your MCE registration number to get instant access.</p>

                {error && (
                  <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleVerifyAndRegister} className="space-y-4">
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
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  >
                    {loading ? 'Verifying…' : (<>Enter the Portal <ArrowRight className="w-4 h-4" /></>)}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === 'done' && alumniData && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}
                >
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  Welcome, {alumniData.name.split(' ')[0]}!
                </h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${BRANCH_META[alumniData.dept]?.color}20`, color: BRANCH_META[alumniData.dept]?.color, border: `1px solid ${BRANCH_META[alumniData.dept]?.color}30` }}>
                    {alumniData.dept}
                  </span>
                  <span className="text-slate-400 text-sm">Batch {alumniData.batch_year}</span>
                </div>
                <p className="text-slate-400 text-sm mb-6">Your account is ready. Complete your profile to get started.</p>
                <Link href="/onboarding">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                  >
                    Complete Your Profile <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-slate-500 text-sm mt-4">
          Already joined?{' '}
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">Sign in with SPRNO</Link>
        </p>
      </motion.div>
    </div>
  )
}
