import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// In-memory rate limiter for login attempts (single-server setup)
// Stores: IP -> { count, firstAttempt }
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>()

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 10 // max login attempts per window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return false
  }

  // Reset window if expired
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return false
  }

  record.count++
  if (record.count > MAX_ATTEMPTS) return true

  return false
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rate-limit the credentials login endpoint
  if (pathname === '/api/auth/callback/credentials' && req.method === 'POST') {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }
  }

  // Protect all /admin routes at the edge
  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token || (token as any).role !== 'ADMIN') {
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/auth/callback/credentials'],
}
