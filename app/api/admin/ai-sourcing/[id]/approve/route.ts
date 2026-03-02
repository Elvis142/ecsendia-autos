import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCarSlug } from '@/lib/utils'

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
        // Use the curated list if the admin removed any photos before approving
        create: (Array.isArray(photosOverride) ? photosOverride : suggestion.photos)
          .filter(Boolean)
          .slice(0, 20)
          .map((url: string, i: number) => ({
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
