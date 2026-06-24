'use server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail, sendAdminNotification } from '@/lib/email'
import type { AlumniWhitelist } from '@/types/database'

export async function verifyWhitelist(sprno: string): Promise<{ success: boolean; data?: AlumniWhitelist; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('alumni_whitelist')
    .select('*')
    .eq('sprno', sprno.trim())
    .single()
  if (error || !data) return { success: false, error: 'SPRNO not found. Please check and try again.' }
  return { success: true, data: data as AlumniWhitelist }
}

export async function registerAlumni(formData: {
  sprno: string
  email: string
  password: string
  name: string
  branch: string
  batch_year: number
}): Promise<{ success: boolean; error?: string }> {
  try {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        sprno: formData.sprno,
        name: formData.name,
        branch: formData.branch,
        batch_year: String(formData.batch_year),
      },
    },
  })
  if (authError) {
    const msg = typeof authError.message === 'string' && authError.message
      ? authError.message
      : String(authError)
    if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
      return { success: false, error: 'This email is already registered. Please sign in instead.' }
    }
    return { success: false, error: msg }
  }
  if (!authData.user) return { success: false, error: 'Registration failed. Please try again.' }

  // SPRNO whitelist match is the identity check — no admin approval needed.
  // The DB trigger creates the profile synchronously; update status to approved immediately.
  await (supabase as any)
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', authData.user.id)

  // Fire emails — failures are caught internally and never block registration
  await Promise.allSettled([
    sendWelcomeEmail(formData.email, formData.name, formData.sprno, formData.branch),
    sendAdminNotification({
      name: formData.name,
      email: formData.email,
      sprno: formData.sprno,
      branch: formData.branch,
      batch_year: formData.batch_year,
    }),
  ])

  return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Registration failed. Please try again.'
    return { success: false, error: msg }
  }
}
