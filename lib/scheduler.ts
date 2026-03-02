/**
 * Daily AI Search Scheduler
 * Uses node-cron to run the Facebook Marketplace agent at a configured time.
 * This runs as a background process - import it in your app startup or run separately.
 */
import * as cron from 'node-cron'
import { prisma } from './prisma'
import { runFacebookMarketplaceAgent } from './ai-agent'

let scheduledTask: ReturnType<typeof cron.schedule> | null = null

export async function startScheduler() {
  // Stop any existing task
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
  }

  const config = await prisma.aISearchConfig.findFirst()
  if (!config || !config.isActive) {
    console.log('[Scheduler] AI sourcing is disabled or not configured')
    return
  }

  const [hour, minute] = (config.scheduledTime || '08:00').split(':')
  const cronExpression = `${minute} ${hour} * * *`

  console.log(`[Scheduler] AI search scheduled at ${config.scheduledTime} daily (cron: ${cronExpression})`)

  scheduledTask = cron.schedule(cronExpression, async () => {
    console.log('[Scheduler] Starting daily AI search run...')

    const log = await prisma.aIRunLog.create({
      data: { status: 'RUNNING' },
    })

    try {
      const freshConfig = await prisma.aISearchConfig.findFirst()
      if (!freshConfig || !freshConfig.isActive) {
        await prisma.aIRunLog.update({
          where: { id: log.id },
          data: { status: 'FAILED', error: 'Scheduler disabled', completedAt: new Date() },
        })
        return
      }

      const { found, queued } = await runFacebookMarketplaceAgent(freshConfig, log.id)
      console.log(`[Scheduler] Run complete: ${found} found, ${queued} queued`)
    } catch (err: any) {
      console.error('[Scheduler] Run failed:', err)
      await prisma.aIRunLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', error: err.message, completedAt: new Date() },
      })
    }
  })
}

export function stopScheduler() {
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
    console.log('[Scheduler] Stopped')
  }
}
