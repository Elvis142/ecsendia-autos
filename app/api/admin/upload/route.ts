import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadCarPhoto } from '@/lib/supabase'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Optimize with Sharp
    const optimized = await sharp(buffer)
      .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()
    
    const fileName = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.webp`
    
    const result = await uploadCarPhoto(optimized, fileName, 'image/webp')
    
    if (!result) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
    
    return NextResponse.json({ url: result.url, key: result.key })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
