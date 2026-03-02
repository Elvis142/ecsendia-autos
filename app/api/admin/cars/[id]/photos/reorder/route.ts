import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { order } = await req.json() as { order: { id: string; order: number }[] }

  if (!Array.isArray(order)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await Promise.all(
    order.map(({ id, order: orderIndex }) =>
      prisma.photo.update({ where: { id }, data: { order: orderIndex } })
    )
  )

  return NextResponse.json({ success: true })
}
