'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Gauge, Calendar, MapPin, Fuel, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatNaira, formatMileage, getStatusColor } from '@/lib/formatting'
import { cn } from '@/lib/utils'
import { WishlistButton } from '@/components/inventory/WishlistButton'

interface CarCardProps {
  car: {
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
  onInquiry?: (car: CarCardProps['car']) => void
}

export function CarCard({ car, onInquiry }: CarCardProps) {
  // Put the main photo first, then the rest in order
  const photos = [
    ...car.photos.filter((p) => p.isMain),
    ...car.photos.filter((p) => !p.isMain),
  ]
  const total = photos.length

  const [idx, setIdx] = useState(0)
  const currentPhoto = photos[idx]

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIdx((i) => (i - 1 + total) % total)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIdx((i) => (i + 1) % total)
  }

  const statusColor = getStatusColor(car.status)
  const location = [car.city, car.state].filter(Boolean).join(', ')

  return (
    <div className="bg-white rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-black/8 transition-all duration-300 hover:-translate-y-1 border border-gray-100/80 shadow-sm">
      {/* Photo carousel */}
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        {/* Clickable photo area → detail page */}
        <Link href={`/inventory/${car.slug}`} className="absolute inset-0 z-0">
          {currentPhoto ? (
            <Image
              key={currentPhoto.url}
              src={currentPhoto.url}
              alt={`${car.title} — photo ${idx + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm', statusColor)}>
            {car.status}
          </span>
        </div>

        {/* Wishlist (z-10, stops its own propagation internally) */}
        <div className="z-10 relative">
          <WishlistButton carId={car.id} carTitle={car.title} />
        </div>

        {/* Prev / Next arrows — only render when multiple photos */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Photo counter */}
        {total > 1 && (
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
            {idx + 1} / {total}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <Link href={`/inventory/${car.slug}`}>
          <h3 className="font-bold text-gray-900 text-base leading-snug hover:text-maroon-700 transition-colors line-clamp-1 mb-0.5">
            {car.title}
          </h3>
        </Link>

        {/* Price */}
        <p className="text-2xl font-bold text-maroon-700 mt-1 mb-4">{formatNaira(car.price)}</p>

        {/* Specs pill row */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {car.mileage != null && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
              <Gauge size={11} className="text-gray-400" />
              {formatMileage(car.mileage)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
            <Calendar size={11} className="text-gray-400" />
            {car.year}
          </span>
          {car.fuelType && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
              <Fuel size={11} className="text-gray-400" />
              {car.fuelType.toLowerCase()}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
              <MapPin size={11} className="text-gray-400" />
              {location}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/inventory/${car.slug}`}
            className="flex-1 text-center text-sm font-semibold py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:border-maroon-600 hover:text-maroon-700 hover:bg-maroon-50/50 transition-all"
          >
            View Details
          </Link>
          <button
            onClick={() => onInquiry?.(car)}
            disabled={car.status === 'SOLD'}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl bg-gradient-to-r from-maroon-600 to-maroon-700 text-white hover:from-maroon-700 hover:to-maroon-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-maroon-700/20"
          >
            <Info size={14} />
            Get Info
          </button>
        </div>
      </div>
    </div>
  )
}
