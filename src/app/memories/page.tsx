import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/link'
import { BRANCHES, BRANCH_META } from '@/types/database'

export default function MemoriesIndexPage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Branch Memory Walls
          </h1>
          <p className="text-slate-400 text-lg">Select your branch to relive the memories, or browse them all.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BRANCHES.map(branch => {
            const meta = BRANCH_META[branch]
            return (
              <Link key={branch} href={`/memories/${branch}`}>
                <div
                  className="glass glass-hover rounded-2xl p-8 text-center cursor-pointer group"
                  style={{ borderColor: `${meta.color}30` }}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{meta.emoji}</div>
                  <div className="text-3xl font-bold mb-1" style={{ color: meta.color, fontFamily: 'var(--font-heading)' }}>{branch}</div>
                  <div className="text-slate-400 text-sm mb-4">{meta.label}</div>
                  <div
                    className="inline-flex items-center gap-1.5 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: meta.color }}
                  >
                    Open Wall →
                  </div>
                </div>
              </Link>
            )
          })}
          {/* All memories */}
          <Link href="/memories/all">
            <div className="glass glass-hover rounded-2xl p-8 text-center cursor-pointer group border-dashed" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="text-5xl mb-4">🌐</div>
              <div className="text-3xl font-bold mb-1 text-white" style={{ fontFamily: 'var(--font-heading)' }}>All</div>
              <div className="text-slate-400 text-sm mb-4">All Branches Combined</div>
              <div className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Browse All →</div>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
