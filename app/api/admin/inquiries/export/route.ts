import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const inquiries = await prisma.inquiry.findMany({
    include: { car: { select: { title: true, price: true } } },
    orderBy: { createdAt: 'desc' },
  })
  
  const headers = ['ID', 'Date', 'Vehicle', 'Price', 'Customer', 'Email', 'Phone', 'Contact Pref', 'Offer', 'Shipping', 'Destination', 'Payment', 'Status', 'Notes']
  
  const rows = inquiries.map((i) => [
    i.id,
    new Date(i.createdAt).toLocaleDateString('en-NG'),
    i.car.title,
    `NGN ${i.vehiclePrice.toLocaleString()}`,
    i.fullName,
    i.email,
    i.phone,
    i.preferredContact,
    i.customerOffer ? `NGN ${i.customerOffer.toLocaleString()}` : '',
    i.shippingNeeded ? 'Yes' : 'No',
    [i.shippingCity, i.shippingState, i.shippingZip].filter(Boolean).join(', '),
    i.paymentPlan || '',
    i.status,
    (i.notes || '').replace(/,/g, ';'),
  ])
  
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
  
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="inquiries-${Date.now()}.csv"`,
    },
  })
}
