'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { Users, Image, MapPin, Trophy, Calendar, Star, ArrowRight, Zap, Heart, BookOpen } from 'lucide-react'
import { BRANCH_META, BRANCHES, type Branch } from '@/types/database'

const STATS = [
  { value: '309', label: 'Alumni', icon: Users },
  { value: '5', label: 'Branches', icon: BookOpen },
  { value: '25', label: 'Years', icon: Trophy },
  { value: '27 Jun', label: 'Reunion Day', icon: Calendar },
]

const FEATURES = [
  {
    icon: Image,
    title: 'Branch Memory Walls',
    desc: 'Upload photos, videos, and documents from your college days. Relive the moments, branch by branch.',
    color: '#3b82f6',
  },
  {
    icon: Users,
    title: 'Alumni Directory',
    desc: 'Find your batchmates wherever they are in the world. Filter by branch, city, or company.',
    color: '#22c55e',
  },
  {
    icon: MapPin,
    title: 'Global Alumni Map',
    desc: 'See where all 309 of us landed across the globe — an interactive world map of MCE talent.',
    color: '#f97316',
  },
  {
    icon: Trophy,
    title: 'Reunion Wall',
    desc: 'RSVP for Jun 27 2026. Then-vs-Now photo challenge. Announcements from the organising team.',
    color: '#eab308',
  },
  {
    icon: Zap,
    title: 'AI Memory Search',
    desc: 'Ask anything about your batch — "Who from MECH is in the US?" — powered by LangChain RAG.',
    color: '#a855f7',
  },
  {
    icon: Heart,
    title: 'Skills & Mentorship',
    desc: 'Hire from your own circle. Find mentors. Collaborate on projects. The batch is your network.',
    color: '#ec4899',
  },
]

function FloatingParticle({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full opacity-20"
      style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: 'radial-gradient(circle, #a78bfa, transparent)' }}
      animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1] }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  )
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 37 + 11) % 97,
  y: (i * 53 + 7) % 93,
  delay: (i * 0.4) % 3,
  size: 4 + (i % 3) * 4,
}))

const SPARKLES = [
  { x: 3,  y: 25, delay: 0,   color: '#eab308', size: 10 },
  { x: 12, y: 75, delay: 0.8, color: '#f97316', size: 7  },
  { x: 22, y: 10, delay: 1.5, color: '#fbbf24', size: 12 },
  { x: 42, y: 88, delay: 0.3, color: '#eab308', size: 7  },
  { x: 58, y: 8,  delay: 2.0, color: '#f59e0b', size: 10 },
  { x: 72, y: 72, delay: 0.6, color: '#fbbf24', size: 7  },
  { x: 83, y: 22, delay: 1.2, color: '#eab308', size: 12 },
  { x: 94, y: 62, delay: 1.8, color: '#f97316', size: 7  },
  { x: 33, y: 55, delay: 2.5, color: '#fbbf24', size: 10 },
  { x: 68, y: 38, delay: 0.9, color: '#eab308', size: 7  },
  { x: 50, y: 3,  delay: 1.1, color: '#f59e0b', size: 10 },
  { x: 8,  y: 90, delay: 2.2, color: '#fbbf24', size: 7  },
  { x: 88, y: 88, delay: 0.4, color: '#eab308', size: 10 },
  { x: 48, y: 95, delay: 1.6, color: '#f97316', size: 7  },
]

function SparkleParticle({ x, y, delay, color, size }: { x: number; y: number; delay: number; color: string; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], rotate: [0, 180, 360] }}
      transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
    >
      <svg width={size} height={size} viewBox="0 0 12 12" fill={color}>
        <path d="M6 0L7.2 4.8H12L8.4 7.6L9.6 12L6 9.4L2.4 12L3.6 7.6L0 4.8H4.8Z" />
      </svg>
    </motion.div>
  )
}

const TICKER_TEXT = "  🎉  MCE 25th Year Silver Reunion  ·  27 June 2026  ·  IT'S HAPPENING!  ·  309 Alumni Reuniting  ·  5 Legendary Branches  ·  One Unforgettable Day  ·  Register NOW!  🌟  "

function AnnouncementTicker() {
  return (
    <div className="overflow-hidden relative z-50" style={{ background: 'linear-gradient(90deg,#4c1d95,#3730a3,#4c1d95)', borderBottom: '1px solid rgba(167,139,250,0.2)' }}>
      <motion.div
        className="flex whitespace-nowrap py-2.5"
        style={{ width: 'max-content' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
      >
        <span className="inline-block text-sm font-semibold tracking-wide px-2" style={{ color: '#fde68a' }}>{TICKER_TEXT}</span>
        <span className="inline-block text-sm font-semibold tracking-wide px-2" style={{ color: '#fde68a' }}>{TICKER_TEXT}</span>
      </motion.div>
    </div>
  )
}

const DATE_PARTS = [
  { value: '27',   label: 'Day' },
  { value: 'JUN',  label: 'Month' },
  { value: '2026', label: 'Year' },
]

function ReunionAnnouncement() {
  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ background: '#05080f' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(234,179,8,0.08), transparent)' }} />
      {SPARKLES.map((s, i) => <SparkleParticle key={i} {...s} />)}

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl p-8 md:p-14 text-center"
          style={{
            background: 'rgba(234,179,8,0.04)',
            border: '1px solid rgba(234,179,8,0.25)',
            boxShadow: '0 0 80px rgba(234,179,8,0.12), 0 0 160px rgba(234,179,8,0.05)',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ boxShadow: '0 0 40px rgba(234,179,8,0.12)' }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-[0.2em]"
            style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.35)', color: '#fbbf24' }}
          >
            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>🎓</motion.span>
            Save The Date
            <motion.span animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}>🎓</motion.span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold mb-2 leading-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <motion.span
              style={{
                background: 'linear-gradient(135deg,#fbbf24,#f59e0b,#d97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block',
              }}
              animate={{ filter: ['brightness(1)', 'brightness(1.25)', 'brightness(1)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              It&apos;s Happening!
            </motion.span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="text-slate-300 text-lg mb-8"
          >
            MCE Silver Reunion · 25th Year Anniversary
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="flex items-end justify-center gap-4 mb-8"
          >
            {DATE_PARTS.map(({ value, label }, i) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <motion.div
                  className="px-5 py-3 rounded-2xl text-center"
                  style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', minWidth: '4.5rem' }}
                  animate={{ borderColor: ['rgba(234,179,8,0.3)', 'rgba(234,179,8,0.65)', 'rgba(234,179,8,0.3)'] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                >
                  <div className="text-4xl md:text-5xl font-bold" style={{ color: '#fbbf24', fontFamily: 'var(--font-heading)' }}>{value}</div>
                </motion.div>
                <span className="text-slate-500 text-xs uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55 }}
            className="text-slate-400 text-base md:text-lg mb-8 max-w-lg mx-auto"
          >
            &ldquo;The batch that stuck together &mdash;{' '}
            <span style={{ color: '#fbbf24' }}>coming back to where it all began.</span>&rdquo;
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-xl font-bold text-base flex items-center gap-2 mx-auto sm:mx-0 text-black"
                style={{ background: 'linear-gradient(135deg,#d97706,#eab308)' }}
              >
                🎉 Secure Your Spot <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/reunion">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 rounded-xl font-semibold text-base text-amber-300 mx-auto sm:mx-0"
                style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.3)' }}
              >
                View Details
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="relative overflow-x-hidden">
      <AnnouncementTicker />
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-[#05080f]">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.25), transparent)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(168,85,247,0.12), transparent)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 30% at 20% 60%, rgba(59,130,246,0.1), transparent)' }} />
        </div>

        {/* Particles */}
        {PARTICLES.map((p, i) => <FloatingParticle key={i} {...p} />)}

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-sm font-medium"
            style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#c4b5fd' }}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            Mookambigai College of Engineering · Class of 2001
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            <span className="text-white">25 Years of</span>
            <br />
            <span className="text-gradient">Friendship &</span>
            <br />
            <span className="text-white">Memories</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto"
          >
            The official Silver Reunion portal for MCE batch 1997–2001.
            Reconnect · Reminisce · Reimagine.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                Join the Reunion <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-xl font-semibold text-lg text-slate-200 glass"
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="glass rounded-xl p-4 text-center">
                <Icon className="w-5 h-5 mx-auto mb-1 text-violet-400" />
                <div className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{value}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-500 text-xs"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-slate-500" />
          Scroll
        </motion.div>
      </section>

      <ReunionAnnouncement />

      {/* Branch showcase */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Five Branches, <span className="text-gradient">One Family</span>
            </h2>
            <p className="text-slate-400 text-lg">Each branch has its own memory wall, colour, and community.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {BRANCHES.map((branch, i) => {
              const meta = BRANCH_META[branch]
              return (
                <motion.div
                  key={branch}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  className="glass glass-hover rounded-2xl p-6 text-center cursor-pointer group"
                  style={{ borderColor: `${meta.color}30` }}
                >
                  <div
                    className="text-4xl mb-3"
                  >{meta.emoji}</div>
                  <div
                    className="text-2xl font-bold mb-1"
                    style={{ color: meta.color, fontFamily: 'var(--font-heading)' }}
                  >{branch}</div>
                  <div className="text-xs text-slate-400 leading-tight">{meta.label}</div>
                  <div
                    className="mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: meta.color }}
                  >
                    View Wall →
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.06), transparent)' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              More Than <span className="text-gradient">Memories</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A living platform that keeps the MCE bond alive, useful, and fun — 25 years on.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="glass glass-hover rounded-2xl p-6 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}
                >
                  <f.icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Our <span className="text-gradient-gold">Journey</span>
            </h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500 via-blue-500 to-transparent opacity-30" />
            {[
              { year: '1997', text: 'We walked through MCE\'s gates as nervous freshers — 309 of us from across South India.' },
              { year: '1999', text: 'Mid-term magic: canteen debates, project crises, friendships forged in all-nighters.' },
              { year: '2001', text: 'We graduated. Threw our hats. Said goodbye, not knowing it would be for this long.' },
              { year: '2026', text: 'We reunite. 25 years later, same friends, a few more grey hairs, infinite stories.' },
            ].map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-20 pb-10"
              >
                <div
                  className="absolute left-5 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                  style={{ borderColor: '#6366f1', background: '#0a0e1a', color: '#a5b4fc' }}
                >
                  {i + 1}
                </div>
                <div className="text-violet-400 text-sm font-mono mb-1">{item.year}</div>
                <div className="text-slate-300 leading-relaxed">{item.text}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(139,92,246,0.15), transparent)' }} />
            <div className="relative z-10">
              <div className="text-5xl mb-4">🎓</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Ready to Reconnect?
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                Your SPRNO from MCE is your key. Enter it and join 309 batchmates already on the platform.
              </p>
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 rounded-xl font-bold text-lg text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)' }}
                >
                  Verify My SPRNO & Join →
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 text-center text-slate-500 text-sm">
        <div className="max-w-4xl mx-auto">
          <div className="text-2xl mb-2" style={{ fontFamily: 'var(--font-heading)', color: '#6366f1' }}>MCE Silver</div>
          <p>Mookambigai College of Engineering · Silver Reunion 2026 · Made with ❤️ for the batch</p>
          <p className="mt-2">Reunion Date: 27 June 2026</p>
        </div>
      </footer>
    </div>
  )
}
