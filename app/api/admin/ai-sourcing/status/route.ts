import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const latestRun = await prisma.aIRunLog.findFirst({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      startedAt: true,
      completedAt: true,
      listingsFound: true,
      listingsQueued: true,
      error: true,
    },
  })

  return NextResponse.json({
    isRunning: latestRun?.status === 'RUNNING',
    latestRun,
  })
}
