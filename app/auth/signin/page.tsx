'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignInPage() {
  const router = useRouter()
  const [step, setStep] = useState<'password' | 'otp'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpExpiry, setOtpExpiry] = useState(300)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer for OTP step
  useEffect(() => {
    if (step !== 'otp') return
    setOtpExpiry(300)
    const interval = setInterval(() => {
      setOtpExpiry((s) => {
        if (s <= 1) {
          clearInterval(interval)
          setError('Code expired. Please start over.')
          setStep('password')
          setOtp(['', '', '', '', '', ''])
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  const formatCountdown = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // ── Step 1: Submit password ──
  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await signIn('credentials', { email, password, otp: '', redirect: false })
      if (result?.status === 429) {
        setError('Too many attempts. Please wait 15 minutes and try again.')
      } else if (result?.status === 403) {
        setError('Access denied. Admin login is only allowed from the United States.')
      } else if (result?.error === 'OTP_SENT') {
        setStep('otp')
        setTimeout(() => otpRefs.current[0]?.focus(), 100)
      } else if (result?.error === 'OTP_SEND_FAILED') {
        setError('Failed to send verification code. Please try again.')
      } else if (result?.error) {
        setError('Invalid email or password.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Submit OTP ──
  const handleOtpSubmit = async (e?: React.FormEvent, overrideCode?: string) => {
    e?.preventDefault()
    const code = overrideCode || otp.join('')
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await signIn('credentials', { email, password, otp: code, redirect: false })
      if (result?.error === 'OTP_INVALID') {
        setError('Incorrect code. Please try again.')
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      } else if (result?.error === 'OTP_EXPIRED') {
        setError('Code expired. Please start over.')
        setStep('password')
        setOtp(['', '', '', '', '', ''])
      } else if (result?.error) {
        setError('Something went wrong. Please try again.')
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // OTP digit input handling
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
    if (digit && index === 5 && next.every(Boolean)) {
      handleOtpSubmit(undefined, next.join(''))
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = ['', '', '', '', '', '']
    pasted.split('').forEach((c, j) => { next[j] = c })
    setOtp(next)
    const focusIdx = Math.min(pasted.length, 5)
    otpRefs.current[focusIdx]?.focus()
    if (pasted.length === 6) handleOtpSubmit(undefined, pasted)
  }

  return (
    <div className="min-h-screen bg-charcoal-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Image src="/logo.svg" alt="Ecsendia Autos" width={48} height={48} className="rounded-xl" />
            <div className="text-left">
              <p className="text-white font-bold text-xl leading-none">Ecsendia</p>
              <p className="text-maroon-400 text-sm font-semibold tracking-widest uppercase">Autos</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-3">Admin Portal — Sign In</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Step indicator */}
          <div className="flex border-b border-gray-100">
            {[
              { icon: Lock, label: 'Password', key: 'password' },
              { icon: ShieldCheck, label: 'Verify', key: 'otp' },
            ].map((s, i) => (
              <div
                key={s.key}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  step === s.key
                    ? 'text-maroon-700 border-b-2 border-maroon-600 bg-maroon-50/50'
                    : i === 0 && step === 'otp'
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                <s.icon size={15} />
                {s.label}
              </div>
            ))}
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                {error}
              </div>
            )}

            {/* ── Step 1: Password ── */}
            {step === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
                <p className="text-gray-500 text-sm mb-5">Enter your credentials to receive a verification code.</p>

                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecsendiautos.com"
                  required
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    label="Password"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                  <Mail size={16} className="mr-1.5" />
                  Send Verification Code
                </Button>
              </form>
            )}

            {/* ── Step 2: OTP ── */}
            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">Check your email</h1>
                  <p className="text-gray-500 text-sm">
                    We sent a 6-digit code to{' '}
                    <span className="font-semibold text-gray-700">{email}</span>.
                    Expires in{' '}
                    <span className={`font-semibold ${otpExpiry < 60 ? 'text-red-500' : 'text-maroon-600'}`}>
                      {formatCountdown(otpExpiry)}
                    </span>.
                  </p>
                </div>

                {/* 6-digit OTP boxes */}
                <div className="flex gap-2.5 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                      className={`w-11 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all ${
                        digit
                          ? 'border-maroon-500 bg-maroon-50 text-maroon-700'
                          : 'border-gray-200 text-gray-900 focus:border-maroon-400'
                      }`}
                    />
                  ))}
                </div>

                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                  <ShieldCheck size={16} className="mr-1.5" />
                  Verify &amp; Sign In
                </Button>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep('password'); setOtp(['', '', '', '', '', '']); setError('') }}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePasswordSubmit()}
                    disabled={loading}
                    className="text-sm text-maroon-600 hover:text-maroon-700 font-medium transition-colors disabled:opacity-40"
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-xs text-gray-400 mt-6">
              Ecsendia Autos Admin Panel v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
