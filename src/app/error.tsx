'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0e1a' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Something went wrong
        </h1>
        <p className="text-slate-400 mb-6 text-sm">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium mx-auto transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </motion.div>
    </div>
  )
}
