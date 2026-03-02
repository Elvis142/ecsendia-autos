import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const accountSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
})

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any)?.id
  if (!userId) return NextResponse.json({ error: 'Session missing user ID' }, { status: 400 })

  try {
    const body = await req.json()
    const data = accountSchema.parse(body)

    if (!data.name && !data.email) {
      return NextResponse.json({ error: 'Provide at least a name or email to update' }, { status: 400 })
    }

    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: userId } },
      })
      if (existing) {
        return NextResponse.json({ message: 'Email is already in use by another account' }, { status: 409 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
      },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
