import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  subject: z.string().min(3).max(100),
  message: z.string().min(10).max(2000),
})

// In-memory rate limit: 5 submissions per IP per hour
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const LIMIT = 5
const WINDOW = 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  const now = Date.now()
  const record = rateLimit.get(ip)
  if (record && now < record.resetAt) {
    if (record.count >= LIMIT) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
    record.count++
  } else {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW })
  }

  try {
    const data = schema.parse(await req.json())

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@ecsendiautos.com',
      to: process.env.ADMIN_EMAIL || 'admin@ecsendiautos.com',
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${data.fullName} (${data.email})</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 })
    }
    return NextResponse.json({ message: 'Failed to send message' }, { status: 500 })
  }
}
