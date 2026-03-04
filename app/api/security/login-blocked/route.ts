import { NextRequest, NextResponse } from 'next/server'
import { sendAdminLoginBlocked } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { ip, country, city } = await req.json()
    await sendAdminLoginBlocked({ ip, country, city, timestamp: new Date() })
  } catch {
    // silently fail — this is a background alert
  }
  return NextResponse.json({ ok: true })
}
