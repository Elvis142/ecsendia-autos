'use client'
import { useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000  // 30 minutes
const WARN_BEFORE_MS  = 2 * 60 * 1000   // warn at 2 minutes remaining

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

export function IdleLogout() {
  const [warning, setWarning] = useState(false)
  const [countdown, setCountdown] = useState(120)
  const idleTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countTimer  = useRef<ReturnType<typeof setInterval> | null>(null)

  function logout() {
    signOut({ callbackUrl: '/auth/signin' })
  }

  function clearTimers() {
    if (idleTimer.current)  clearTimeout(idleTimer.current)
    if (warnTimer.current)  clearTimeout(warnTimer.current)
    if (countTimer.current) clearInterval(countTimer.current)
  }

  function resetTimers() {
    clearTimers()
    setWarning(false)

    warnTimer.current = setTimeout(() => {
      setWarning(true)
      setCountdown(WARN_BEFORE_MS / 1000)
      countTimer.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countTimer.current!)
            return 0
          }
          return c - 1
        })
      }, 1000)
    }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS)

    idleTimer.current = setTimeout(logout, IDLE_TIMEOUT_MS)
  }

  useEffect(() => {
    resetTimers()
    EVENTS.forEach((e) => window.addEventListener(e, resetTimers, { passive: true }))
    return () => {
      clearTimers()
      EVENTS.forEach((e) => window.removeEventListener(e, resetTimers))
    }
  }, [])

  if (!warning) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⏱</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session expiring</h2>
        <p className="text-gray-500 text-sm mb-4">
          You've been inactive. You'll be signed out in{' '}
          <span className="font-bold text-red-600">{countdown}s</span>.
        </p>
        <button
          onClick={resetTimers}
          className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-semibold py-2.5 rounded-xl transition-colors"
        >
          Stay signed in
        </button>
        <button
          onClick={logout}
          className="mt-2 w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          Sign out now
        </button>
      </div>
    </div>
  )
}
