'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CarCard } from '@/components/inventory/CarCard'
import { InquiryModal } from '@/components/inventory/InquiryModal'
import { FilterSidebar } from '@/components/inventory/FilterSidebar'
import { RecentlyViewed } from '@/components/inventory/RecentlyViewed'
import { SlidersHorizontal, Car, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Car {
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

interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}

function InventoryContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cars, setCars] = useState<Car[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 12, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/cars?${searchParams.toString()}`)
      const data = await res.json()
      setCars(data.cars || [])
      setMeta(data.meta || { total: 0, page: 1, limit: 12, pages: 1 })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/inventory?${params.toString()}`)
  }

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/inventory?${params.toString()}`)
  }

  const sortValue = searchParams.get('sort') || 'newest'

  return (
    <>
    <div className="container-site py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? 'Loading...' : `${meta.total} vehicle${meta.total !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sortValue}
            onChange={(e) => setParam('sort', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-maroon-500"
          >
            <option value="newest">Recently Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="year_desc">Year: Newest First</option>
            <option value="year_asc">Year: Oldest First</option>
            <option value="mileage_asc">Mileage: Low to High</option>
          </select>

          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="md"
            className="lg:hidden"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal size={16} />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <FilterSidebar
          searchParams={Object.fromEntries(searchParams.entries())}
          onParamChange={setParam}
          mobileOpen={filterOpen}
          onMobileClose={() => setFilterOpen(false)}
        />

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-20">
              <Car className="mx-auto text-gray-300 mb-4" size={56} />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No vehicles found</h3>
              <p className="text-gray-400 text-sm mb-6">Try adjusting your filters</p>
              <Button variant="outline" onClick={() => router.push('/inventory')}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} onInquiry={(c) => setSelectedCar(c)} />
                ))}
              </div>

              {/* Pagination */}
              {meta.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(meta.page - 1)}
                    disabled={meta.page <= 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-maroon-700 hover:text-maroon-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: Math.min(meta.pages, 7) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => setPage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          page === meta.page
                            ? 'bg-maroon-700 text-white'
                            : 'border border-gray-200 text-gray-600 hover:border-maroon-700 hover:text-maroon-700'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage(meta.page + 1)}
                    disabled={meta.page >= meta.pages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-maroon-700 hover:text-maroon-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <InquiryModal
        isOpen={!!selectedCar}
        onClose={() => setSelectedCar(null)}
        car={selectedCar}
      />
    </div>

    <RecentlyViewed />
    </>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="container-site py-8 text-center text-gray-400">Loading inventory...</div>}>
      <InventoryContent />
    </Suspense>
  )
}
