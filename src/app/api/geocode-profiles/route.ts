import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function geocodeOne(city: string | null, country: string | null): Promise<{ lat: number; lng: number } | null> {
  const query = [city, country].filter(Boolean).join(', ')
  if (!query) return null
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'MCE25-Alumni/1.0' } }
    )
    const data = await res.json()
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {}
  return null
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only admins can trigger this
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['branch_admin', 'super_admin'].includes((profile as any).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch all profiles with city/country but missing coordinates
  const { data: profiles } = await (supabase as any)
    .from('profiles')
    .select('id, city, country')
    .not('country', 'is', null)
    .or('lat.is.null,lng.is.null')
    .limit(50)

  if (!profiles?.length) return NextResponse.json({ updated: 0, message: 'All profiles already have coordinates' })

  let updated = 0
  for (const p of profiles) {
    const coords = await geocodeOne(p.city, p.country)
    if (coords) {
      await (supabase as any).from('profiles').update({ lat: coords.lat, lng: coords.lng }).eq('id', p.id)
      updated++
    }
    await sleep(1100) // Nominatim rate limit: 1 req/sec
  }

  return NextResponse.json({ updated, total: profiles.length })
}
