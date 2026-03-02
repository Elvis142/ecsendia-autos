'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getWishlist } from '@/lib/wishlist'
import { CarCard } from '@/components/inventory/CarCard'
import { InquiryModal } from '@/components/inventory/InquiryModal'
import { Heart, ArrowRight, Car } from 'lucide-react'

interface CarData {
  id: string
  slug: string
  title: string
  year: number
  make: string
  model: string
  trim?: string | null
  price: number
  mileage?: number | null
  exteriorColor?: string | null
  city?: string | null
  state?: string | null
  status: string
  fuelType?: string | null
  bodyType?: string | null
  transmission?: string | null
  photos: Array<{ url: string; isMain: boolean }>
}

export default function SavedCarsPage() {
  const [cars, setCars] = useState<CarData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null)

  useEffect(() => {
    const ids = getWishlist()
    if (ids.length === 0) {
      setLoading(false)
      return
    }
    fetch(`/api/cars?ids=${ids.join(',')}`)
      .then((r) => r.json())
      .then((data) => setCars(data.cars ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-site py-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart size={20} className="text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Saved Cars</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {loading ? 'Loading...' : `${cars.length} saved vehicle${cars.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-site py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Car size={32} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No saved cars yet</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
              Tap the heart icon on any car listing to save it here for easy access later.
            </p>
            <Link
              href="/inventory"
              className="inline-flex items-center gap-2 btn-primary px-8 py-3.5"
            >
              Browse Inventory <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} onInquiry={(c) => setSelectedCar(c)} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/inventory" className="text-sm font-semibold text-maroon-600 hover:text-maroon-700 transition-colors inline-flex items-center gap-1">
                Browse more cars <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>

      <InquiryModal
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
        car={selectedCar}
      />
    </div>
  )
}
