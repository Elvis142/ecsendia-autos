'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Car } from 'lucide-react'
import { CarCard } from '@/components/inventory/CarCard'
import { InquiryModal } from '@/components/inventory/InquiryModal'

interface CarWithPhotos {
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

interface Props {
  cars: CarWithPhotos[]
  availableCount: number
}

export function FeaturedCarsSection({ cars, availableCount }: Props) {
  const [selectedCar, setSelectedCar] = useState<CarWithPhotos | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} onInquiry={(c) => setSelectedCar(c)} />
        ))}
      </div>
      <div className="text-center mt-12">
        <Link href="/inventory" className="inline-flex items-center gap-2 btn-primary px-10 py-4 text-base">
          <Car size={18} />
          See All {availableCount} Available Cars
        </Link>
      </div>

      <InquiryModal
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
        car={selectedCar}
      />
    </>
  )
}
