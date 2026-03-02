import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(24, Math.max(1, parseInt(searchParams.get('limit') || '12')))
  const skip = (page - 1) * limit
  
  const sort = searchParams.get('sort') || 'newest'
  const make = searchParams.get('make')
  const model = searchParams.get('model')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const minYear = searchParams.get('minYear')
  const maxYear = searchParams.get('maxYear')
  const maxMileage = searchParams.get('maxMileage')
  const bodyType = searchParams.get('bodyType')
  const transmission = searchParams.get('transmission')
  const fuelType = searchParams.get('fuelType')
  const driveType = searchParams.get('driveType')
  const condition = searchParams.get('condition')
  const status = searchParams.get('status')
  const featured = searchParams.get('featured')

  // Support fetching cars by specific IDs (for saved/wishlist page)
  const ids = searchParams.get('ids')
  if (ids) {
    const idList = ids.split(',').filter(Boolean).slice(0, 50)
    const cars = await prisma.car.findMany({
      where: { id: { in: idList }, visibility: 'PUBLISHED' },
      include: { photos: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json({ cars, meta: { total: cars.length, page: 1, limit: cars.length, pages: 1 } })
  }

  const where: Prisma.CarWhereInput = {
    visibility: 'PUBLISHED',
    ...(make && { make: { contains: make, mode: 'insensitive' } }),
    ...(model && { model: { contains: model, mode: 'insensitive' } }),
    ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && { price: { ...((minPrice && { gte: parseFloat(minPrice) }) || {}), lte: parseFloat(maxPrice) } }),
    ...(minYear && { year: { gte: parseInt(minYear) } }),
    ...(maxYear && { year: { ...((minYear && { gte: parseInt(minYear) }) || {}), lte: parseInt(maxYear) } }),
    ...(maxMileage && { mileage: { lte: parseInt(maxMileage) } }),
    ...(bodyType && { bodyType: bodyType as any }),
    ...(transmission && { transmission: transmission as any }),
    ...(fuelType && { fuelType: fuelType as any }),
    ...(driveType && { driveType: driveType as any }),
    ...(condition && { condition: condition as any }),
    ...(status && { status: status as any }),
    ...(featured === 'true' && { featured: true }),
  }

  // Handle combined price range properly
  if (minPrice && maxPrice) {
    where.price = { gte: parseFloat(minPrice), lte: parseFloat(maxPrice) }
  } else if (minPrice) {
    where.price = { gte: parseFloat(minPrice) }
  } else if (maxPrice) {
    where.price = { lte: parseFloat(maxPrice) }
  }

  if (minYear && maxYear) {
    where.year = { gte: parseInt(minYear), lte: parseInt(maxYear) }
  } else if (minYear) {
    where.year = { gte: parseInt(minYear) }
  } else if (maxYear) {
    where.year = { lte: parseInt(maxYear) }
  }

  const orderBy: Prisma.CarOrderByWithRelationInput = 
    sort === 'price_asc' ? { price: 'asc' } :
    sort === 'price_desc' ? { price: 'desc' } :
    sort === 'year_desc' ? { year: 'desc' } :
    sort === 'year_asc' ? { year: 'asc' } :
    sort === 'mileage_asc' ? { mileage: 'asc' } :
    { createdAt: 'desc' }

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      include: { photos: { orderBy: { order: 'asc' } } },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.car.count({ where }),
  ])

  return NextResponse.json({
    cars,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  })
}
