import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendInquiryNotification } from '@/lib/email'
import { z } from 'zod'

// Rate limit: max 5 inquiries per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const schema = z.object({
  carId: z.string(),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  preferredContact: z.enum(['TEXT', 'CALL', 'EMAIL']),
  vehiclePrice: z.number(),
  customerOffer: z.number().nullable().optional(),
  shippingNeeded: z.boolean(),
  shippingCity: z.string().optional().nullable(),
  shippingState: z.string().optional().nullable(),
  shippingZip: z.string().optional().nullable(),
  budgetRange: z.string().optional().nullable(),
  paymentPlan: z.enum(['CASH', 'FINANCE', 'NOT_SURE']).optional().nullable(),
  notes: z.string().optional().nullable(),
  consent: z.boolean(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    
    // Rate limit check
    const now = Date.now()
    const limit = rateLimitMap.get(ip)
    if (limit) {
      if (now < limit.resetAt) {
        if (limit.count >= 5) {
          return NextResponse.json({ message: 'Too many inquiries. Please try again later.' }, { status: 429 })
        }
        limit.count++
      } else {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 })
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 })
    }

    const body = await req.json()
    const data = schema.parse(body)

    if (!data.consent) {
      return NextResponse.json({ message: 'Consent is required' }, { status: 400 })
    }

    const car = await prisma.car.findUnique({
      where: { id: data.carId },
    })

    if (!car) {
      return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 })
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        carId: data.carId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        preferredContact: data.preferredContact,
        vehiclePrice: data.vehiclePrice,
        customerOffer: data.customerOffer,
        shippingNeeded: data.shippingNeeded,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingZip: data.shippingZip,
        budgetRange: data.budgetRange,
        paymentPlan: data.paymentPlan,
        notes: data.notes,
        ipAddress: ip,
        status: 'NEW',
      },
    })

    // Send email notification (non-blocking)
    sendInquiryNotification({
      inquiryId: inquiry.id,
      customerName: data.fullName,
      customerEmail: data.email,
      customerPhone: data.phone,
      preferredContact: data.preferredContact,
      carTitle: car.title,
      carSlug: car.slug,
      vehiclePrice: data.vehiclePrice,
      customerOffer: data.customerOffer,
      shippingNeeded: data.shippingNeeded,
      shippingDestination: [data.shippingCity, data.shippingState, data.shippingZip].filter(Boolean).join(', '),
      paymentPlan: data.paymentPlan,
      notes: data.notes,
      timestamp: new Date(),
    }).catch(console.error)

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid form data', errors: err.errors }, { status: 400 })
    }
    console.error('Inquiry error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
