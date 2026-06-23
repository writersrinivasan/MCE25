import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0e1a' }}>
      <div className="text-center">
        <div className="text-8xl font-black text-white/5 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>404</div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Page not found</h1>
        <p className="text-slate-400 mb-8">This page doesn't exist or was moved.</p>
        <Link href="/dashboard"
          className="inline-flex px-5 py-2.5 rounded-xl text-white font-medium"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
