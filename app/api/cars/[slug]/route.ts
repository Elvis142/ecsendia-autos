import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const car = await prisma.car.findUnique({
    where: { slug: params.slug, visibility: 'PUBLISHED' },
    include: { photos: { orderBy: { order: 'asc' } } },
  })

  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  }

  return NextResponse.json(car)
}
