import { createClient } from '@/lib/supabase/client'

export type UploadResult = { url: string; path: string } | { error: string }

const LIMITS = {
  avatars: 5 * 1024 * 1024,    // 5 MB
  memories: 50 * 1024 * 1024,  // 50 MB
  reunion: 10 * 1024 * 1024,   // 10 MB
}

export async function uploadFile(
  bucket: keyof typeof LIMITS,
  path: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  if (file.size > LIMITS[bucket]) {
    const mb = (LIMITS[bucket] / 1024 / 1024).toFixed(0)
    return { error: `File too large. Maximum size is ${mb} MB.` }
  }

  const supabase = createClient()

  // Simulate progress (Supabase JS v2 doesn't expose upload progress natively)
  let tick = 0
  const timer = setInterval(() => {
    tick = Math.min(tick + 10, 85)
    onProgress?.(tick)
  }, 200)

  const { data, error } = await (supabase.storage as any)
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: '3600' })

  clearInterval(timer)

  if (error) {
    onProgress?.(0)
    return { error: error.message ?? 'Upload failed. Please try again.' }
  }

  onProgress?.(100)
  const { data: { publicUrl } } = (supabase.storage as any).from(bucket).getPublicUrl(data.path)
  return { url: publicUrl, path: data.path }
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data: { publicUrl } } = (supabase.storage as any).from(bucket).getPublicUrl(path)
  return publicUrl
}

export function fileType(file: File): 'image' | 'video' | 'audio' | 'document' {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'document'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
