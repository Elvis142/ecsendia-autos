import Link from 'next/link'
import { Car, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 w-20 h-20 bg-maroon-700/10 rounded-full flex items-center justify-center">
        <Car className="w-10 h-10 text-maroon-700" />
      </div>
      <h1 className="text-7xl font-bold text-maroon-700 mb-3">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">Page not found</h2>
      <p className="text-gray-500 max-w-md mb-8">
        This page doesn&apos;t exist or the vehicle may have been sold. Browse our current inventory to find your next car.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/inventory"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-maroon-700 text-white font-medium hover:bg-maroon-800 transition-colors"
        >
          Browse Inventory
        </Link>
      </div>
    </div>
  )
}
