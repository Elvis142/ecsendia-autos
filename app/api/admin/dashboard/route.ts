import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const [
    totalCars,
    availableCars,
    soldCars,
    totalInquiries,
    newInquiries,
    recentInquiries,
    recentCars,
    aiPending,
  ] = await Promise.all([
    prisma.car.count(),
    prisma.car.count({ where: { status: 'AVAILABLE' } }),
    prisma.car.count({ where: { status: 'SOLD' } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: 'NEW' } }),
    prisma.inquiry.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      include: { car: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.car.findMany({
      orderBy: { createdAt: 'desc' },
      include: { photos: { take: 1, orderBy: { order: 'asc' } } },
      take: 5,
    }),
    prisma.aISuggestion.count({ where: { status: 'PENDING' } }),
  ])
  
  return NextResponse.json({
    stats: { totalCars, availableCars, soldCars, totalInquiries, newInquiries, aiPending },
    recentInquiries,
    recentCars,
  })
}
