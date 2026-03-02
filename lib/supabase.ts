import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

const BUCKET = 'car-photos'

export async function uploadCarPhoto(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; key: string } | null> {
  const key = `cars/${Date.now()}-${fileName}`

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, file, {
      contentType,
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(key)

  return { url: data.publicUrl, key }
}

export async function deleteCarPhoto(key: string): Promise<boolean> {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([key])
  if (error) {
    console.error('Delete error:', error)
    return false
  }
  return true
}
