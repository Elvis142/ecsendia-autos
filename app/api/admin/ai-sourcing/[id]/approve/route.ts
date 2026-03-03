import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCarSlug } from '@/lib/utils'
import { uploadCarPhoto } from '@/lib/supabase'

async function mirrorPhoto(url: string, idx: number): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://www.facebook.com/',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return url
    const buffer = Buffer.from(await res.arrayBuffer())
    if (buffer.length < 1000) return url // skip tiny/error images
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const ext = contentType.includes('webp') ? 'webp' : contentType.includes('png') ? 'png' : 'jpg'
    const result = await uploadCarPhoto(buffer, `ai-${Date.now()}-${idx}.${ext}`, contentType)
    return result?.url ?? url
  } catch {
    return url // fall back to original on any error
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { publish = false, photos: photosOverride, price: priceOverride } = await req.json().catch(() => ({}))

  const suggestion = await prisma.aISuggestion.findUnique({ where: { id: params.id } })
  if (!suggestion) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const year = suggestion.year || new Date().getFullYear()
  const make = suggestion.make || 'Unknown'
  const model = suggestion.model || 'Vehicle'
  const trim = suggestion.trim || null

  const title = [year, make, model, trim].filter(Boolean).join(' ')
  const slug = generateCarSlug(year, make, model, trim)

  // Download photos to Supabase Storage so they're permanently hosted
  const rawPhotos = (Array.isArray(photosOverride) ? photosOverride : suggestion.photos as string[])
    .filter(Boolean)
    .slice(0, 20)
  const hostedPhotos = await Promise.all(rawPhotos.map((url, i) => mirrorPhoto(url, i)))

  const car = await prisma.car.create({
    data: {
      title,
      slug,
      year,
      make,
      model,
      trim,
      price: typeof priceOverride === 'number' && priceOverride > 0 ? priceOverride : (suggestion.price || 0),
      mileage: suggestion.mileage,
      description: suggestion.description
        ? `${suggestion.description}\n\n--- Imported by AI on ${new Date().toLocaleDateString('en-NG')} ---`
        : `Imported by AI on ${new Date().toLocaleDateString('en-NG')}`,
      city: suggestion.location,
      features: [],
      status: 'AVAILABLE',
      visibility: publish ? 'PUBLISHED' : 'DRAFT',
      sourceUrl: suggestion.sourceUrl,
      aiImported: true,
      aiImportedAt: new Date(),
      photos: {
        create: hostedPhotos.map((url: string, i: number) => ({
          url,
          isMain: i === 0,
          order: i,
        })),
      },
    },
  })
  
  await prisma.aISuggestion.update({
    where: { id: params.id },
    data: {
      status: publish ? 'APPROVED_PUBLISHED' : 'APPROVED_DRAFT',
      importedCarId: car.id,
    },
  })
  
  return NextResponse.json({ car, success: true })
}
