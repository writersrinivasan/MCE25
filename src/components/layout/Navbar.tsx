'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Image, Trophy, Map, Menu, X, LogOut, User, ChevronDown, Shield, Search, Settings, Mail
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BRANCH_META, type Profile } from '@/types/database'
import { getInitials, cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/memories', label: 'Memories', icon: Image },
  { href: '/search', label: 'AI Search', icon: Search },
  { href: '/directory', label: 'Directory', icon: Users },
  { href: '/reunion', label: 'Reunion', icon: Trophy },
  { href: '/capsule', label: 'Capsule', icon: Mail },
  { href: '/map', label: 'Map', icon: Map },
]

export function Navbar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const branchColor = profile ? (BRANCH_META[profile.branch]?.color ?? '#6366f1') : '#6366f1'

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>M</div>
          <span className="font-bold text-white hidden sm:block" style={{ fontFamily: 'var(--font-heading)' }}>MCE Silver</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href}>
                <div className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                )} style={active ? { background: 'rgba(99,102,241,0.15)', color: 'white' } : {}}>
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Profile */}
        <div className="flex items-center gap-3">
          {profile && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(p => !p)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-white/5"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${branchColor}, ${branchColor}99)` }}
                >
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    : getInitials(profile.full_name)}
                </div>
                <span className="hidden sm:block text-sm text-slate-300 max-w-24 truncate">{(profile.full_name ?? '').split(' ')[0] || 'Alumni'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-52 rounded-xl overflow-hidden z-50"
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <div className="text-sm font-medium text-white truncate">{profile.full_name}</div>
                      <div className="text-xs text-slate-400">{profile.branch} · {profile.graduation_year}</div>
                    </div>
                    <Link href={`/directory/${profile.id}`} onClick={() => setProfileOpen(false)}>
                      <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                        <User className="w-4 h-4" /> My Profile
                      </div>
                    </Link>
                    <Link href="/settings" onClick={() => setProfileOpen(false)}>
                      <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </div>
                    </Link>
                    {['branch_admin', 'super_admin'].includes(profile.role) && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)}>
                        <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(m => !m)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden"
            style={{ background: 'rgba(10,14,26,0.98)' }}
          >
            <nav className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                    <div className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                      active ? 'text-white bg-violet-500/15' : 'text-slate-400'
                    )}>
                      <Icon className="w-4 h-4" /> {label}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
