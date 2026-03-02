import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.car.update({
      where: { slug: params.slug },
      data: { viewCount: { increment: 1 } },
    })
    return NextResponse.json({ ok: true })
  } catch {
    // Silently ignore — view counting is non-critical
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
