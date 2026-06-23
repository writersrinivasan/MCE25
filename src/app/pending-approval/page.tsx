'use client'
import { motion } from 'framer-motion'
import { Clock, Mail, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PendingApprovalPage() {
  const router = useRouter()
  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#05080f' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(234,179,8,0.1), transparent)' }} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center glass rounded-2xl p-10 relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          className="text-6xl mb-6"
        >⏳</motion.div>
        <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Pending Approval</h1>
        <p className="text-slate-400 mb-2 leading-relaxed">
          Your account is under review by the MCE alumni admin team. You'll get an email once you're approved — usually within 24 hours.
        </p>
        <p className="text-slate-500 text-sm mb-8">This step ensures only genuine MCE 1997–2001 batch members join the platform.</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl text-sm text-slate-300" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
            Approval typically within 24 hours
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl text-sm text-slate-300" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Mail className="w-4 h-4 text-violet-400 shrink-0" />
            You'll receive an email notification
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-8 flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm mx-auto"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </motion.div>
    </div>
  )
}
