import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const carId = searchParams.get('carId')
  const status = searchParams.get('status')
  
  const where: any = {
    ...(carId && { carId }),
    ...(status && { status }),
  }
  
  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      include: { car: { select: { id: true, title: true, slug: true, price: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inquiry.count({ where }),
  ])
  
  return NextResponse.json({ inquiries, meta: { total, page, limit, pages: Math.ceil(total / limit) } })
}
