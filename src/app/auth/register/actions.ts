'use server'
import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        sprno: formData.sprno,
        name: formData.name,
        branch: formData.branch,
        batch_year: formData.batch_year,
      },
    },
  })
  if (authError) return { success: false, error: authError.message }
  if (!authData.user) return { success: false, error: 'Registration failed. Please try again.' }
  return { success: true }
}
