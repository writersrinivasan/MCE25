'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, CheckCircle, AlertCircle, ArrowRight, User, Mail, Lock } from 'lucide-react'
import { verifyWhitelist, registerAlumni } from './actions'
import { BRANCH_META, type AlumniWhitelist } from '@/types/database'

type Step = 'verify' | 'register' | 'done'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('verify')
  const [sprno, setSprno] = useState('')
  const [alumniData, setAlumniData] = useState<AlumniWhitelist | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await verifyWhitelist(sprno.trim())
      if (!result.success || !result.data) {
        setError(result.error ?? 'SPRNO not found. Please check and try again.')
      } else {
        setAlumniData(result.data)
        setStep('register')
      }
    } catch {
      setError('Connection error. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!alumniData) return
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await registerAlumni({
        sprno: alumniData.sprno,
        email,
        password,
        name: alumniData.name,
        branch: alumniData.dept,
        batch_year: alumniData.batch_year,
      })
      if (!result.success) {
        const msg = typeof result.error === 'string' && result.error
          ? result.error : 'Registration failed. Please try again.'
        setError(msg)
      } else {
        setStep('done')
      }
    } catch {
      setError('Connection error. Please check your internet and try again.')
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
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <div className="text-3xl font-bold text-gradient mb-1" style={{ fontFamily: 'var(--font-heading)' }}>MCE '97–'01</div>
            <div className="text-slate-400 text-sm">Silver Reunion Portal</div>
          </Link>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {(['verify', 'register', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: step === s ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : (i < ['verify','register','done'].indexOf(step) ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'),
                  color: step === s || i < ['verify','register','done'].indexOf(step) ? 'white' : '#64748b',
                  border: '1px solid rgba(99,102,241,0.3)',
                }}
              >{i + 1}</div>
              {i < 2 && <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Verify SPRNO */}
            {step === 'verify' && (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Verify Your SPRNO</h1>
                <p className="text-slate-400 text-sm mb-6">Enter your MCE registration number to confirm you're part of the 1997–2001 batch.</p>

                {error && (
                  <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">SPRNO (e.g. 97087)</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={sprno}
                        onChange={e => setSprno(e.target.value)}
                        required
                        placeholder="97087"
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
                    {loading ? 'Checking…' : (<>Verify SPRNO <ArrowRight className="w-4 h-4" /></>)}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Register */}
            {step === 'register' && alumniData && (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Create Your Account</h1>
                <p className="text-slate-400 text-sm mb-4">Welcome, {alumniData.name.split(' ')[0]}! Set up your login.</p>

                {/* Verified badge */}
                <div className="mb-5 p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-300 text-sm font-medium">Identity Verified</span>
                  </div>
                  <div className="text-white font-semibold">{alumniData.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${BRANCH_META[alumniData.dept]?.color}20`, color: BRANCH_META[alumniData.dept]?.color, border: `1px solid ${BRANCH_META[alumniData.dept]?.color}30` }}>{alumniData.dept}</span>
                    <span className="text-slate-400 text-xs">Batch {alumniData.batch_year}</span>
                    <span className="text-slate-400 text-xs font-mono">{alumniData.sprno}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)} required
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1.5">Password (min 8 chars)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password" value={password} onChange={e => setPassword(e.target.value)} required
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                    {loading ? 'Creating account…' : (<>Join the Reunion <ArrowRight className="w-4 h-4" /></>)}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Done */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}
                >
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Welcome to the Family!</h2>
                <p className="text-slate-400 mb-1">Your account is active — sign in now.</p>
                <p className="text-slate-500 text-sm mb-6">Complete your profile to appear on the alumni map and directory.</p>
                <Link href="/auth/login">
                  <button className="px-6 py-3 rounded-xl font-semibold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    Go to Sign In
                  </button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-slate-500 text-sm mt-4">
          Already registered?{' '}
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
