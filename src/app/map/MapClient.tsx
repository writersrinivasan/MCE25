'use client'
import { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { MapPin, Users, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { BRANCHES, BRANCH_META, type Branch, type Profile } from '@/types/database'
import { branchColor, getInitials } from '@/lib/utils'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function normalizeLocation(s: string): string {
  return s.trim().replace(/\b\w/g, c => c.toUpperCase())
}

function groupByCountry(alumni: Profile[]) {
  const map: Record<string, Profile[]> = {}
  for (const a of alumni) {
    const key = a.country ? normalizeLocation(a.country) : 'Unknown'
    if (!map[key]) map[key] = []
    map[key].push(a)
  }
  return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
}

type TooltipData = { name: string; branch: Branch; city: string | null; x: number; y: number }

export default function MapClient({ alumni, currentUserHasLocation }: { alumni: Profile[]; currentUserHasLocation: boolean }) {
  const [branchFilter, setBranchFilter] = useState<Branch | 'all'>('all')
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([20, 10])

  const filtered = useMemo(() =>
    branchFilter === 'all' ? alumni : alumni.filter(a => a.branch === branchFilter),
    [alumni, branchFilter]
  )

  const withCoords = useMemo(() => filtered.filter(a => a.lat != null && a.lng != null), [filtered])
  const byCountry = useMemo(() => groupByCountry(filtered), [filtered])
  const selectedAlumni = selectedCountry
    ? filtered.filter(a => (a.country ? normalizeLocation(a.country) : 'Unknown') === selectedCountry)
    : []

  const handleMarkerEnter = useCallback((a: Profile, e: React.MouseEvent) => {
    setTooltip({ name: a.full_name, branch: a.branch, city: a.city, x: e.clientX, y: e.clientY })
  }, [])
  const handleMarkerLeave = useCallback(() => setTooltip(null), [])

  const countriesRepresented = byCountry.filter(([c]) => c !== 'Unknown').length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          Global Alumni Map 🌍
        </h1>
        <p className="text-slate-400 text-sm">
          {alumni.length} alumni across {countriesRepresented} countries — {withCoords.length} pinned on the map
        </p>
      </div>

      {/* Location nudge — shown until the user adds their city */}
      {!currentUserHasLocation && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-2xl px-5 py-4 flex items-center gap-4"
          style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}
        >
          <MapPin className="w-5 h-5 text-orange-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm">You're not on the map yet!</div>
            <div className="text-slate-400 text-xs">
              Add your city in your profile and join {withCoords.length} batchmates who are already pinned.
            </div>
          </div>
          <a href="/onboarding" className="shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#f97316' }}>
            Add Location
          </a>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Alumni', value: alumni.length, icon: '🎓' },
          { label: 'Countries', value: countriesRepresented, icon: '🌐' },
          { label: 'On Map', value: withCoords.length, icon: '📍' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</div>
            <div className="text-slate-500 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Branch filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setBranchFilter('all')}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
          style={{ background: branchFilter === 'all' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)', color: branchFilter === 'all' ? 'white' : '#94a3b8' }}>
          All ({alumni.length})
        </button>
        {BRANCHES.map(b => {
          const meta = BRANCH_META[b]
          const count = alumni.filter(a => a.branch === b).length
          return (
            <button key={b} onClick={() => setBranchFilter(branchFilter === b ? 'all' : b)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{ background: branchFilter === b ? meta.color : 'rgba(255,255,255,0.05)', color: branchFilter === b ? 'white' : '#94a3b8' }}>
              {meta.emoji} {b} ({count})
            </button>
          )
        })}
      </div>

      {/* Map */}
      <div className="glass rounded-2xl overflow-hidden mb-6 relative" style={{ background: 'rgba(6,18,38,0.8)' }}>
        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          {[
            { icon: ZoomIn, action: () => setZoom(z => Math.min(z * 1.5, 8)) },
            { icon: ZoomOut, action: () => setZoom(z => Math.max(z / 1.5, 1)) },
            { icon: RotateCcw, action: () => { setZoom(1); setCenter([20, 10]) } },
          ].map(({ icon: Icon, action }, i) => (
            <button key={i} onClick={action}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130, center: [20, 10] }}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup zoom={zoom} center={center}
            onMoveEnd={({ zoom: z, coordinates }: { zoom: number; coordinates: [number, number] }) => { setZoom(z); setCenter(coordinates) }}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => (
                  <Geography key={geo.rsmKey} geography={geo}
                    style={{
                      default: { fill: 'rgba(30,40,70,0.9)', stroke: 'rgba(99,102,241,0.15)', strokeWidth: 0.3, outline: 'none' },
                      hover: { fill: 'rgba(50,60,100,0.9)', stroke: 'rgba(99,102,241,0.4)', strokeWidth: 0.5, outline: 'none' },
                      pressed: { fill: 'rgba(70,80,120,0.9)', outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {withCoords.map(a => {
              const color = branchColor(a.branch)
              return (
                <Marker key={a.id} coordinates={[a.lng!, a.lat!]}>
                  <circle
                    r={5 / Math.sqrt(zoom)}
                    fill={color}
                    fillOpacity={0.85}
                    stroke="white"
                    strokeWidth={0.8 / zoom}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => handleMarkerEnter(a, e)}
                    onMouseLeave={handleMarkerLeave}
                    onClick={() => setSelectedCountry(a.country)}
                  />
                </Marker>
              )
            })}
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {BRANCHES.map(b => (
            <div key={b} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
              style={{ background: 'rgba(0,0,0,0.5)', color: BRANCH_META[b].color }}>
              <div className="w-2 h-2 rounded-full" style={{ background: BRANCH_META[b].color }} />
              {b}
            </div>
          ))}
        </div>

        {withCoords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="glass rounded-xl px-5 py-3 text-center">
              <div className="text-2xl mb-1">📍</div>
              <div className="text-white text-sm font-medium">No locations pinned yet</div>
              <div className="text-slate-400 text-xs mt-0.5">Alumni need to set their city in their profile</div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="fixed z-50 px-3 py-2 rounded-xl text-sm pointer-events-none shadow-xl"
            style={{ left: tooltip.x + 12, top: tooltip.y - 10, background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-white font-medium">{tooltip.name}</div>
            <div className="text-xs mt-0.5" style={{ color: branchColor(tooltip.branch) }}>
              {BRANCH_META[tooltip.branch]?.emoji} {tooltip.branch}
              {tooltip.city && <span className="text-slate-400"> · {tooltip.city}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Country list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-400" />
                Countries ({byCountry.filter(([c]) => c !== 'Unknown').length})
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {byCountry.filter(([c]) => c !== 'Unknown').map(([country, members]) => (
                <button key={country} onClick={() => setSelectedCountry(selectedCountry === country ? null : country)}
                  className="w-full flex items-center justify-between px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors text-left"
                  style={selectedCountry === country ? { background: 'rgba(99,102,241,0.12)' } : {}}>
                  <div>
                    <div className="text-white text-sm font-medium">{country}</div>
                    <div className="text-slate-500 text-xs">
                      {[...new Set(members.map(m => m.city ? normalizeLocation(m.city) : null).filter(Boolean))].slice(0, 3).join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {BRANCHES.filter(b => members.some(m => m.branch === b)).map(b => (
                        <div key={b} className="w-2 h-2 rounded-full" style={{ background: BRANCH_META[b].color }} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-white">{members.length}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedCountry ? (
              <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedCountry} <span className="text-slate-400 text-base font-normal">({selectedAlumni.length})</span>
                  </h3>
                  <button onClick={() => setSelectedCountry(null)} className="text-xs text-slate-400 hover:text-white">✕ Clear</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedAlumni.map((a, i) => {
                    const color = branchColor(a.branch)
                    return (
                      <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <Link href={`/directory/${a.id}`}>
                          <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ background: `${color}40` }}>
                              {a.avatar_url ? <img src={a.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(a.full_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium truncate">{a.full_name}</div>
                              <div className="text-xs text-slate-400 truncate">{[a.current_position, a.city].filter(Boolean).join(' · ')}</div>
                            </div>
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded-md shrink-0" style={{ background: `${color}15`, color }}>
                              {BRANCH_META[a.branch]?.emoji} {a.branch}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-400" /> Top Cities
                  </h3>
                  <div className="space-y-2.5">
                    {Object.entries(
                      filtered.reduce<Record<string, number>>((acc, a) => {
                        if (a.city) {
                          const city = normalizeLocation(a.city)
                          acc[city] = (acc[city] ?? 0) + 1
                        }
                        return acc
                      }, {})
                    ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([city, count]) => (
                      <div key={city} className="flex items-center gap-3">
                        <div className="text-slate-300 text-sm w-28 truncate">{city}</div>
                        <div className="flex-1 h-1.5 rounded-full bg-white/5">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${(count / (filtered.length || 1)) * 100}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}
                          />
                        </div>
                        <div className="text-slate-400 text-sm w-6 text-right">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">Click a country on the list or map to see alumni</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {byCountry.filter(([c]) => c !== 'Unknown').slice(0, 6).map(([country, members]) => (
                      <button key={country} onClick={() => setSelectedCountry(country)}
                        className="glass rounded-xl p-3 text-left hover:bg-white/5 transition-colors">
                        <div className="text-white font-bold text-xl mb-0.5">{members.length}</div>
                        <div className="text-slate-400 text-xs truncate">{country}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
