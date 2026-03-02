import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { searchParams } = new URL(req.url)
  const tab = searchParams.get('status') || 'PENDING'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  // Map UI tab values to actual DB enum values
  const statusFilter: any =
    tab === 'APPROVED'
      ? { in: ['APPROVED_DRAFT', 'APPROVED_PUBLISHED'] }
      : tab === 'SAVED'
      ? 'SAVED_FOR_LATER'
      : tab // PENDING, REJECTED pass through as-is

  const [suggestions, total] = await Promise.all([
    prisma.aISuggestion.findMany({
      where: { status: statusFilter },
      include: { priceHistory: { orderBy: { recordedAt: 'asc' } } },
      orderBy: [{ opportunityScore: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.aISuggestion.count({ where: { status: statusFilter } }),
  ])
  
  return NextResponse.json({ suggestions, meta: { total, page, limit, pages: Math.ceil(total / limit) } })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tab = searchParams.get('status') || 'PENDING'

  const statusFilter: any =
    tab === 'APPROVED'
      ? { in: ['APPROVED_DRAFT', 'APPROVED_PUBLISHED'] }
      : tab === 'SAVED'
      ? 'SAVED_FOR_LATER'
      : tab

  const { count } = await prisma.aISuggestion.deleteMany({
    where: { status: statusFilter },
  })

  return NextResponse.json({ deleted: count })
}
