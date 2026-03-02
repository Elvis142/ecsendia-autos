'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getRecentlyViewed, type RecentItem } from '@/lib/recently-viewed'
import { formatNaira } from '@/lib/formatting'
import { Clock } from 'lucide-react'

interface RecentlyViewedProps {
  excludeSlug?: string
}

export function RecentlyViewed({ excludeSlug }: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentItem[]>([])

  useEffect(() => {
    const all = getRecentlyViewed()
    setItems(excludeSlug ? all.filter((c) => c.slug !== excludeSlug) : all)
  }, [excludeSlug])

  if (items.length === 0) return null

  return (
    <section className="py-10 border-t border-gray-100">
      <div className="container-site">
        <div className="flex items-center gap-2 mb-5">
          <Clock size={16} className="text-maroon-600" />
          <h2 className="font-bold text-gray-900 text-base">Recently Viewed</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {items.map((car) => (
            <Link
              key={car.id}
              href={`/inventory/${car.slug}`}
              className="flex-shrink-0 w-44 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {car.mainPhotoUrl ? (
                  <Image
                    src={car.mainPhotoUrl}
                    alt={car.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="176px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-1">{car.title}</p>
                <p className="text-sm font-bold text-maroon-700">{formatNaira(car.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
