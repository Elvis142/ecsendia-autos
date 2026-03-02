import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const config = await prisma.aISearchConfig.findFirst()
  if (!config) {
    return NextResponse.json({ error: 'AI search not configured' }, { status: 400 })
  }

  if (!config.isActive) {
    return NextResponse.json({ error: 'AI sourcing is disabled. Enable it in Settings first.' }, { status: 400 })
  }

  // Prevent concurrent runs
  const alreadyRunning = await prisma.aIRunLog.findFirst({
    where: { status: 'RUNNING' },
  })
  if (alreadyRunning) {
    return NextResponse.json({ error: 'A search is already in progress. Please wait for it to finish.' }, { status: 409 })
  }

  // Create a run log entry
  const log = await prisma.aIRunLog.create({
    data: { status: 'RUNNING' },
  })
  
  // Run agent in background (non-blocking)
  import('@/lib/ai-agent').then(({ runFacebookMarketplaceAgent }) => {
    runFacebookMarketplaceAgent(config, log.id).catch(async (err) => {
      console.error('Agent run failed:', err)
      await prisma.aIRunLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', error: err.message, completedAt: new Date() },
      })
    })
  })
  
  return NextResponse.json({ runId: log.id, message: 'Search started' })
}
