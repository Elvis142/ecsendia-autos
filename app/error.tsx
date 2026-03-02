'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-3">Something went wrong</h1>
      <p className="text-gray-500 max-w-md mb-8">
        An unexpected error occurred. Please try again or contact us if the problem persists.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-maroon-700 text-white font-medium hover:bg-maroon-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
        >
          Back to Home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-gray-400">Error ID: {error.digest}</p>
      )}
    </div>
  )
}
