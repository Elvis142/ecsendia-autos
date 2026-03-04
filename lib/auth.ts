import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { sendAdminOTP, sendAdminLoginAlert } from './email'

// ─── In-memory OTP store (single-server) ─────────────────────────────────────
interface PendingOTP {
  code: string
  expires: number
  ip: string
}
const pendingOTPs = new Map<string, PendingOTP>()

const OTP_EXPIRES_MINUTES = 5

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ─── Auth Options ─────────────────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const ip =
          (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0].trim() ||
          (req?.headers?.['x-real-ip'] as string) ||
          'Unknown'

        // ── Validate password ──
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        if (!isPasswordValid) return null

        // ── Step 1: No OTP yet — send one ──
        if (!credentials.otp) {
          const code = generateOTP()
          pendingOTPs.set(credentials.email, {
            code,
            expires: Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000,
            ip,
          })

          try {
            await sendAdminOTP({ email: user.email, code, ip, expiresMinutes: OTP_EXPIRES_MINUTES })
          } catch (err) {
            console.error('[2FA] Failed to send OTP email:', err)
            throw new Error('OTP_SEND_FAILED')
          }

          throw new Error('OTP_SENT')
        }

        // ── Step 2: Validate OTP ──
        const pending = pendingOTPs.get(credentials.email)

        if (!pending) throw new Error('OTP_EXPIRED')
        if (Date.now() > pending.expires) {
          pendingOTPs.delete(credentials.email)
          throw new Error('OTP_EXPIRED')
        }
        if (pending.code !== credentials.otp.trim()) {
          throw new Error('OTP_INVALID')
        }

        // OTP valid — clean up and issue session
        pendingOTPs.delete(credentials.email)

        // Send login alert (non-blocking)
        sendAdminLoginAlert({
          email: user.email,
          ip,
          country: (req?.headers?.['x-geo-country'] as string) || 'US',
          city: (req?.headers?.['x-geo-city'] as string) || '',
          timestamp: new Date(),
        }).catch((err) => console.error('[Login alert] Failed:', err))

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).id = token.id
      }
      return session
    },
  },
}
