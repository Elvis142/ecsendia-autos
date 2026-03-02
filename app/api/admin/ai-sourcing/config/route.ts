import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const config = await prisma.aISearchConfig.findFirst()
  return NextResponse.json(config)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const body = await req.json()
  const { id, createdAt, updatedAt, ...data } = body
  
  const config = await prisma.aISearchConfig.upsert({
    where: { id: id || 'default' },
    update: data,
    create: { id: 'default', ...data },
  })
  
  return NextResponse.json(config)
}
