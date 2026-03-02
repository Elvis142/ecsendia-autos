import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { reason, saveForLater = false } = await req.json().catch(() => ({}))
  
  await prisma.aISuggestion.update({
    where: { id: params.id },
    data: {
      status: saveForLater ? 'SAVED_FOR_LATER' : 'REJECTED',
      rejectionReason: reason || null,
    },
  })
  
  return NextResponse.json({ success: true })
}
