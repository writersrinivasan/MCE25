import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Branch, BRANCH_META } from '@/types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function branchColor(branch: Branch | null | undefined): string {
  if (!branch) return '#6b7280'
  return BRANCH_META[branch]?.color ?? '#6b7280'
}

export function branchBg(branch: Branch | null | undefined): string {
  if (!branch) return 'rgba(107,114,128,0.12)'
  return BRANCH_META[branch]?.bg ?? 'rgba(107,114,128,0.12)'
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

export function titleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return '?'
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).filter(Boolean).join('').toUpperCase() || '?'
}
