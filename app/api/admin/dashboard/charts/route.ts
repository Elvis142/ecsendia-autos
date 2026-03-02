import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [inquiries, topCars] = await Promise.all([
    prisma.inquiry.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.car.findMany({
      where: { visibility: 'PUBLISHED', viewCount: { gt: 0 } },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: { id: true, title: true, viewCount: true, slug: true, make: true, model: true, year: true },
    }),
  ])

  // Build a map of date → count for last 30 days
  const dateMap: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dateMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const inq of inquiries) {
    const key = inq.createdAt.toISOString().slice(0, 10)
    if (key in dateMap) dateMap[key]++
  }

  const inquiryChart = Object.entries(dateMap).map(([date, count]) => ({
    date,
    label: new Date(date + 'T00:00:00').toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
    count,
  }))

  return NextResponse.json({ inquiryChart, topCars })
}
