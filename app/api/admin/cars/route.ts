import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCarSlug } from '@/lib/utils'
import { z } from 'zod'

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return null
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth) return auth

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const visibility = searchParams.get('visibility')

  const where: any = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(status && { status }),
    ...(visibility && { visibility }),
  }

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.car.count({ where }),
  ])

  return NextResponse.json({ cars, meta: { total, page, limit, pages: Math.ceil(total / limit) } })
}

const carSchema = z.object({
  year: z.number().int().min(1980).max(2030),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional().nullable(),
  price: z.number().positive(),
  mileage: z.number().int().optional().nullable(),
  vin: z.string().optional().nullable(),
  exteriorColor: z.string().optional().nullable(),
  interiorColor: z.string().optional().nullable(),
  engine: z.string().optional().nullable(),
  transmission: z.enum(['AUTOMATIC', 'MANUAL', 'CVT', 'SEMI_AUTOMATIC']).optional().nullable(),
  driveType: z.enum(['FWD', 'RWD', 'AWD', 'FOUR_WD']).optional().nullable(),
  fuelType: z.enum(['GAS', 'DIESEL', 'HYBRID', 'ELECTRIC', 'PLUG_IN_HYBRID']).optional().nullable(),
  bodyType: z.enum(['SEDAN', 'SUV', 'TRUCK', 'COUPE', 'HATCHBACK', 'CONVERTIBLE', 'WAGON', 'MINIVAN', 'VAN']).optional().nullable(),
  condition: z.enum(['CLEAN_TITLE', 'REBUILT_TITLE', 'SALVAGE', 'LEMON_LAW']).optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).optional(),
  status: z.enum(['AVAILABLE', 'PENDING', 'SOLD']).optional(),
  visibility: z.enum(['PUBLISHED', 'DRAFT']).optional(),
  featured: z.boolean().optional(),
  sourceUrl: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth) return auth

  try {
    const body = await req.json()
    const data = carSchema.parse(body)

    const title = [data.year, data.make, data.model, data.trim].filter(Boolean).join(' ')
    const slug = generateCarSlug(data.year, data.make, data.model, data.trim)

    const car = await prisma.car.create({
      data: {
        ...data,
        title,
        slug,
        features: data.features || [],
        status: data.status || 'AVAILABLE',
        visibility: data.visibility || 'DRAFT',
      },
    })

    return NextResponse.json(car, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
