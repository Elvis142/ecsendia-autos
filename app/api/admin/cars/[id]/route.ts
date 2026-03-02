import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return false
  return true
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: { photos: { orderBy: { order: 'asc' } }, inquiries: { orderBy: { createdAt: 'desc' }, take: 5 } },
  })
  
  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(car)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const body = await req.json()
    const { photos, inquiries, id, createdAt, updatedAt, ...rawData } = body

    // Convert empty strings to null — Prisma enum fields reject "" but accept null
    const data = Object.fromEntries(
      Object.entries(rawData).map(([k, v]) => [k, v === '' ? null : v])
    )

    const title = [data.year, data.make, data.model, data.trim].filter(Boolean).join(' ')

    const car = await prisma.car.update({
      where: { id: params.id },
      data: { ...data, title },
    })
    
    return NextResponse.json(car)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  await prisma.car.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
