'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Megaphone, Calendar, Home, Shield } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import type { Profile } from '@/types/database'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/event', label: 'Reunion Event', icon: Calendar },
]

export default function AdminShell({ children, profile }: { children: React.ReactNode; profile: Profile }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen flex" style={{ background: '#05080f' }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 fixed top-0 left-0 h-screen flex flex-col border-r border-white/5 z-40"
        style={{ background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(12px)' }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Admin Panel</span>
          </div>
          <div className="text-xs text-slate-500">MCE Silver Reunion 2026</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href}>
                <div className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                )} style={active ? { background: 'rgba(239,68,68,0.15)', color: '#fca5a5' } : {}}>
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Back to app */}
        <div className="px-3 pb-4 border-t border-white/5 pt-4 space-y-2">
          <Link href="/dashboard">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Home className="w-4 h-4" /> Back to App
            </div>
          </Link>
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#a855f7,#6366f1)' }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : getInitials(profile.full_name)}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-white font-medium truncate">{profile.full_name}</div>
              <div className="text-xs text-red-400">{profile.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-56 min-h-screen">
        {children}
      </div>
    </div>
  )
}
