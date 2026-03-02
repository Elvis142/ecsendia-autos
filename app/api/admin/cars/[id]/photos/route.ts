import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteCarPhoto } from '@/lib/supabase'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { photoId } = await req.json()
  
  const photo = await prisma.photo.findUnique({ where: { id: photoId } })
  if (!photo || photo.carId !== params.id) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }
  
  if (photo.key) {
    await deleteCarPhoto(photo.key)
  }
  
  await prisma.photo.delete({ where: { id: photoId } })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { photoId, isMain, order } = await req.json()
  
  if (isMain) {
    // Unset all others first
    await prisma.photo.updateMany({ where: { carId: params.id }, data: { isMain: false } })
  }
  
  const photo = await prisma.photo.update({
    where: { id: photoId },
    data: { ...(isMain !== undefined && { isMain }), ...(order !== undefined && { order }) },
  })
  
  return NextResponse.json(photo)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { url, key, isMain, order } = await req.json()
  
  if (isMain) {
    await prisma.photo.updateMany({ where: { carId: params.id }, data: { isMain: false } })
  }
  
  const photo = await prisma.photo.create({
    data: { carId: params.id, url, key, isMain: isMain || false, order: order || 0 },
  })
  
  return NextResponse.json(photo, { status: 201 })
}
