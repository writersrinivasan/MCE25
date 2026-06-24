'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Camera, MapPin, Briefcase, User, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/storage'
import { BRANCHES, BRANCH_META, type Branch, type Profile } from '@/types/database'

const STEPS = [
  { id: 'photo', label: 'Photo & Bio', icon: Camera },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'career', label: 'Career', icon: Briefcase },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push('/auth/login')
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setProfile(data as Profile)
        } else {
          // Profile wasn't created by trigger — seed from auth metadata
          const meta = user.user_metadata ?? {}
          setProfile({
            id: user.id,
            email: user.email ?? '',
            sprno: meta.sprno ?? '',
            full_name: meta.name ?? '',
            branch: meta.branch ?? '',
            graduation_year: meta.batch_year ? Number(meta.batch_year) + 4 : undefined,
          } as Partial<Profile>)
        }
      })
    })
  }, [])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleNext() {
    if (step < STEPS.length - 1) { setStep(s => s + 1); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    let avatar_url = profile.avatar_url ?? null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const result = await uploadFile('avatars', `${user.id}/avatar.${ext}`, avatarFile, setUploadProgress, true)
      if ('error' in result) { setUploadError(result.error); setSaving(false); return }
      avatar_url = result.url
    }
    const { error: saveError } = await (supabase as any).from('profiles').upsert({
      id: user.id,
      email: user.email,
      sprno: profile.sprno ?? '',
      full_name: profile.full_name ?? '',
      branch: profile.branch ?? '',
      graduation_year: profile.graduation_year,
      status: 'approved',
      role: 'member',
      avatar_url,
      bio: profile.bio,
      city: profile.city,
      country: profile.country,
      lat: profile.lat,
      lng: profile.lng,
      current_position: profile.current_position,
      company: profile.company,
      linkedin_url: profile.linkedin_url,
      phone: profile.phone,
      is_profile_complete: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    setSaving(false)
    if (saveError) {
      setUploadError('Failed to save profile: ' + saveError.message)
      return
    }
    router.push('/dashboard?welcome=1')
    router.refresh()
  }

  const update = (key: keyof Profile, val: string) => setProfile(p => ({ ...p, [key]: val }))

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#05080f' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.12), transparent)' }} />
      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-gradient mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Complete Your Profile</div>
          <p className="text-slate-400 text-sm">Help your batchmates find and reconnect with you</p>
        </div>

        {/* Step pills */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: i === step ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : i < step ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                  color: i <= step ? 'white' : '#64748b',
                  border: `1px solid ${i === step ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {i < step ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                {s.label}
              </div>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {/* Step 0: Photo & Bio */}
            {step === 0 && (
              <motion.div key="photo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Your Photo & Bio</h2>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl" style={{ background: 'rgba(99,102,241,0.2)', border: '2px solid rgba(99,102,241,0.3)' }}>
                      {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-indigo-400" />}
                    </div>
                    <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                      <Camera className="w-3 h-3 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  {uploadError && (
                    <div className="text-xs text-red-400 mt-1">{uploadError}</div>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-1 w-20 h-1 rounded-full bg-white/10">
                      <div className="h-1 rounded-full bg-violet-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                  <div>
                    <div className="text-white font-semibold">{profile.full_name}</div>
                    <div className="text-slate-400 text-sm">{profile.branch} · Batch {profile.graduation_year}</div>
                    <div className="text-slate-500 text-xs mt-0.5">SPRNO: {profile.sprno}</div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">About You <span className="text-slate-600">(optional)</span></label>
                  <textarea
                    value={profile.bio ?? ''}
                    onChange={e => update('bio', e.target.value)}
                    rows={4}
                    placeholder="Write a short intro — what you've been up to in the last 25 years, your passion, your family, anything!"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">WhatsApp / Phone <span className="text-slate-600">(optional)</span></label>
                  <input
                    type="tel" value={profile.phone ?? ''}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <motion.div key="location" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Where Are You Now?</h2>
                <p className="text-slate-400 text-sm">This powers the global alumni map — see where all 309 of us landed.</p>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">City</label>
                  <input type="text" value={profile.city ?? ''} onChange={e => update('city', e.target.value)}
                    placeholder="Chennai, Bangalore, Singapore…"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Country</label>
                  <input type="text" value={profile.country ?? ''} onChange={e => update('country', e.target.value)}
                    placeholder="India, USA, UAE…"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <p className="text-slate-500 text-xs">Your exact coordinates are never shared publicly.</p>
              </motion.div>
            )}

            {/* Step 2: Career */}
            {step === 2 && (
              <motion.div key="career" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Your Career Today</h2>
                <p className="text-slate-400 text-sm">Powers the alumni directory and skills exchange.</p>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Current Role / Designation</label>
                  <input type="text" value={profile.current_position ?? ''} onChange={e => update('current_position', e.target.value)}
                    placeholder="Senior Engineer, Entrepreneur, Professor…"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Company / Organisation</label>
                  <input type="text" value={profile.company ?? ''} onChange={e => update('company', e.target.value)}
                    placeholder="Tata, Infosys, Own Business…"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">LinkedIn Profile URL <span className="text-slate-600">(optional)</span></label>
                  <input type="url" value={profile.linkedin_url ?? ''} onChange={e => update('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/in/your-name"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors disabled:opacity-30 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 text-sm disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
            >
              {saving ? 'Saving…' : step < STEPS.length - 1 ? (<>Next <ArrowRight className="w-4 h-4" /></>) : (<>Complete Profile <Check className="w-4 h-4" /></>)}
            </motion.button>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">You can update all this later from your profile page.</p>
      </div>
    </div>
  )
}
