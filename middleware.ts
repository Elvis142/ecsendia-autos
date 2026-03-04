import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// ─── Rate Limiter ────────────────────────────────────────────────────────────
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 10

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = loginAttempts.get(ip)
  if (!record) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return false
  }
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return false
  }
  record.count++
  return record.count > MAX_ATTEMPTS
}

// ─── Geo Lookup ──────────────────────────────────────────────────────────────
interface GeoInfo {
  country_code: string
  city: string
}

async function getGeoInfo(ip: string): Promise<GeoInfo | null> {
  // Skip for local/private IPs
  if (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  ) {
    return { country_code: 'US', city: 'Local' }
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'ecsendia-autos/1.0' },
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return null
    const data = await res.json()
    return { country_code: data.country_code || '', city: data.city || '' }
  } catch {
    return null // fail open — don't block if geo API is down
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'

  // ── Login endpoint: geo-block + rate limit ──
  if (pathname === '/api/auth/callback/credentials' && req.method === 'POST') {
    // Rate limit check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    // US-only geo check
    const geo = await getGeoInfo(ip)
    if (geo && geo.country_code && geo.country_code !== 'US') {
      // Fire-and-forget blocked login alert (via API route to avoid edge restrictions)
      fetch(`${req.nextUrl.origin}/api/security/login-blocked`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, country: geo.country_code, city: geo.city }),
      }).catch(() => {})

      return NextResponse.json(
        { error: 'Access restricted. Admin login is only allowed from the United States.' },
        { status: 403 }
      )
    }

    // Attach geo info as headers so auth.ts can include it in the login alert email
    const requestWithGeo = new NextRequest(req.url, {
      method: req.method,
      headers: new Headers(req.headers),
      body: req.body,
      duplex: 'half',
    } as any)
    requestWithGeo.headers.set('x-geo-country', geo?.country_code || 'US')
    requestWithGeo.headers.set('x-geo-city', geo?.city || '')
    return NextResponse.next({ request: requestWithGeo })
  }

  // ── Admin routes: require valid ADMIN session ──
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
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
