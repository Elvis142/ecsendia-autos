export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { PhotoGallery } from '@/components/inventory/PhotoGallery'
import {
  formatNaira,
  formatMileage,
  getTransmissionLabel,
  getDriveLabel,
  getFuelLabel,
  getBodyLabel,
  getConditionLabel,
} from '@/lib/formatting'
import { InquiryModalTrigger } from './InquiryModalTrigger'
import { ShareButtons } from '@/components/inventory/ShareButtons'
import { ViewTracker } from '@/components/inventory/ViewTracker'
import { RecentlyViewed } from '@/components/inventory/RecentlyViewed'
import { ChevronRight, Home, Tag, Gauge, Calendar, Zap, GitBranch, Fuel, Car, Shield, Palette, Hash, MapPin, CheckCircle, Eye } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

/** Parse and render the car description, handling AI-structured format cleanly */
function renderDescription(raw: string) {
  // Strip "--- Imported by AI on ... ---" footer
  const cleaned = raw
    .replace(/\n*---\s*Imported by AI on[^-]*---\s*$/i, '')
    .trim()

  if (!cleaned) return null

  // No section markers → plain text (manually entered description)
  if (!cleaned.includes('---')) {
    return (
      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{cleaned}</p>
    )
  }

  // Split on "--- Section Title ---" markers
  const parts = cleaned.split(/\n?---\s*([^-\n]+?)\s*---\n?/)
  // parts[0] = text before first --- (usually empty)
  // parts[1, 3, 5, ...] = section titles
  // parts[2, 4, 6, ...] = section content

  const sections: Array<{ title: string; content: string }> = []
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i]?.trim() ?? ''
    const content = parts[i + 1]?.trim() ?? ''
    if (title && content) sections.push({ title, content })
  }

  if (sections.length === 0) {
    return (
      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{cleaned}</p>
    )
  }

  return (
    <div className="space-y-6">
      {sections.map(({ title, content }) => {
        const lower = title.toLowerCase()

        if (lower.includes('vehicle details')) {
          // Parse "Key: Value" lines (handles "Exterior: Silver · Interior: Black")
          const lines = content.split('\n').filter((l) => l.trim())
          const pairs = lines.flatMap((line) =>
            line
              .split('·')
              .map((seg) => seg.trim())
              .filter(Boolean)
              .map((seg) => {
                const m = seg.match(/^([^:]+):\s*(.+)$/)
                return m ? { label: m[1].trim(), value: m[2].trim() } : null
              })
              .filter(Boolean)
          ) as Array<{ label: string; value: string }>

          if (pairs.length === 0) return null

          return (
            <div key={title}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">From Original Listing</p>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                {pairs.map((p, i) => (
                  <div key={i}>
                    <dt className="text-xs text-gray-400">{p.label}</dt>
                    <dd className="text-sm text-gray-800 font-semibold mt-0.5">{p.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        }

        // Listing Text / Seller Description / any other section → clean text block
        return (
          <div key={title}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Seller Notes</p>
            <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">{content}</p>
          </div>
        )
      })}
    </div>
  )
}

async function getCar(slug: string) {
  return prisma.car.findUnique({
    where: { slug, visibility: 'PUBLISHED' },
    include: {
      photos: { orderBy: [{ isMain: 'desc' }, { order: 'asc' }] },
    },
  })
}

async function getRelatedCars(make: string, currentId: string) {
  return prisma.car.findMany({
    where: {
      make,
      id: { not: currentId },
      visibility: 'PUBLISHED',
      status: 'AVAILABLE',
    },
    include: {
      photos: { where: { isMain: true }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const car = await getCar(params.slug)
  if (!car) return { title: 'Car Not Found' }

  const mainPhoto = car.photos.find((p) => p.isMain) ?? car.photos[0]
  const title = `${car.title} — ${formatNaira(car.price)}`
  const plainDesc = car.description
    ?.replace(/---[^-\n]*---/g, '')
    .replace(/\s{3,}/g, ' ')
    .trim()
  const description =
    plainDesc?.slice(0, 155) ??
    `${car.year} ${car.make} ${car.model}${car.trim ? ` ${car.trim}` : ''} for sale at ${formatNaira(car.price)}. ${car.mileage ? formatMileage(car.mileage) + '.' : ''} Available now at Ecsendia Autos, Lagos Nigeria.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_NG',
      siteName: 'Ecsendia Autos',
      ...(mainPhoto ? { images: [{ url: mainPhoto.url, alt: car.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(mainPhoto ? { images: [mainPhoto.url] } : {}),
    },
    alternates: {
      canonical: `/inventory/${car.slug}`,
    },
  }
}

function buildJsonLd(car: NonNullable<Awaited<ReturnType<typeof getCar>>>) {
  const mainPhoto = car.photos.find((p) => p.isMain) ?? car.photos[0]
  return {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: car.title,
    description: car.description ?? undefined,
    image: mainPhoto?.url,
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'NGN',
      availability:
        car.status === 'AVAILABLE'
          ? 'https://schema.org/InStock'
          : car.status === 'PENDING'
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'AutoDealer',
        name: 'Ecsendia Autos',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Lagos',
          addressCountry: 'NG',
        },
      },
    },
    vehicleModelDate: car.year.toString(),
    brand: { '@type': 'Brand', name: car.make },
    model: car.model,
    ...(car.mileage ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: car.mileage, unitCode: 'SMI' } } : {}),
    ...(car.vin ? { vehicleIdentificationNumber: car.vin } : {}),
    ...(car.transmission ? { vehicleTransmission: getTransmissionLabel(car.transmission) } : {}),
    ...(car.fuelType ? { fuelType: getFuelLabel(car.fuelType) } : {}),
    ...(car.driveType ? { driveWheelConfiguration: getDriveLabel(car.driveType) } : {}),
    ...(car.engine ? { vehicleEngine: { '@type': 'EngineSpecification', name: car.engine } } : {}),
    ...(car.exteriorColor ? { color: car.exteriorColor } : {}),
    ...(car.bodyType ? { bodyType: getBodyLabel(car.bodyType) } : {}),
  }
}

export default async function CarDetailPage({ params }: PageProps) {
  const [car, relatedCars] = await Promise.all([
    getCar(params.slug),
    getCar(params.slug).then((c) => (c ? getRelatedCars(c.make, c.id) : [])),
  ])

  if (!car) notFound()

  const statusColors: Record<string, { badge: string; label: string }> = {
    AVAILABLE: { badge: 'bg-green-100 text-green-800 ring-green-600/20', label: 'Available' },
    PENDING:   { badge: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20', label: 'Pending Sale' },
    SOLD:      { badge: 'bg-red-100 text-red-800 ring-red-600/20', label: 'Sold' },
  }
  const statusStyle = statusColors[car.status] ?? { badge: 'bg-gray-100 text-gray-700 ring-gray-500/20', label: car.status }

  const specs = [
    { icon: Calendar,   label: 'Year',         value: car.year.toString() },
    { icon: Gauge,      label: 'Mileage',       value: car.mileage != null ? formatMileage(car.mileage) : null },
    { icon: GitBranch,  label: 'Transmission',  value: car.transmission ? getTransmissionLabel(car.transmission) : null },
    { icon: Car,        label: 'Drive Type',    value: car.driveType ? getDriveLabel(car.driveType) : null },
    { icon: Fuel,       label: 'Fuel Type',     value: car.fuelType ? getFuelLabel(car.fuelType) : null },
    { icon: Tag,        label: 'Body Style',    value: car.bodyType ? getBodyLabel(car.bodyType) : null },
    { icon: Shield,     label: 'Condition',     value: car.condition ? getConditionLabel(car.condition) : null },
    { icon: Zap,        label: 'Engine',        value: car.engine ?? null },
    { icon: Hash,       label: 'VIN',           value: car.vin ?? null },
    { icon: Palette,    label: 'Ext. Color',    value: car.exteriorColor ?? null },
    { icon: Palette,    label: 'Int. Color',    value: car.interiorColor ?? null },
    { icon: MapPin,     label: 'Location',      value: [car.city, car.state].filter(Boolean).join(', ') || null },
  ].filter((s) => s.value !== null) as { icon: React.ElementType; label: string; value: string }[]

  const mainPhoto = car.photos.find((p) => p.isMain) ?? car.photos[0]
  const jsonLd = buildJsonLd(car)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Track view + add to recently viewed on mount */}
      <ViewTracker
        slug={car.slug}
        car={{
          id: car.id,
          slug: car.slug,
          title: car.title,
          price: car.price,
          year: car.year,
          make: car.make,
          model: car.model,
          mainPhotoUrl: mainPhoto?.url ?? null,
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500">
              <Link href="/" className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <Link href="/inventory" className="hover:text-gray-900 transition-colors">Inventory</Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <Link href={`/inventory?make=${encodeURIComponent(car.make)}`} className="hover:text-gray-900 transition-colors">{car.make}</Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 font-medium truncate max-w-[200px]">{car.title}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title + Status + Share */}
          <div className="flex flex-wrap items-start gap-3 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {car.title}
              </h1>
              {car.trim && (
                <p className="mt-1 text-gray-500 text-base">{car.trim}</p>
              )}
              {/* Share buttons */}
              <div className="mt-3">
                <ShareButtons title={car.title} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ring-1 ring-inset ${statusStyle.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  car.status === 'AVAILABLE' ? 'bg-green-600' :
                  car.status === 'PENDING'   ? 'bg-yellow-500' : 'bg-red-600'
                }`} />
                {statusStyle.label}
              </span>
              {car.viewCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                  <Eye size={12} />
                  {car.viewCount.toLocaleString()} view{car.viewCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Main layout: Photo gallery left, inquiry panel right */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Left column — gallery + details */}
            <div className="lg:col-span-2 space-y-8">
              <PhotoGallery photos={car.photos} title={car.title} />

              {/* Specs grid */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicle Details</h2>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <dl className="divide-y divide-gray-100">
                    {specs.map(({ icon: Icon, label, value }, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-5 py-3.5">
                        <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                        <dt className="text-sm font-medium text-gray-500 w-36 shrink-0">{label}</dt>
                        <dd className="text-sm text-gray-900 font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>

              {/* Features */}
              {car.features.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Features &amp; Options</h2>
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                      {car.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-maroon-700 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Description */}
              {car.description && renderDescription(car.description) && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    {renderDescription(car.description)}
                  </div>
                </section>
              )}
            </div>

            {/* Right column — sticky inquiry panel */}
            <div className="mt-8 lg:mt-0">
              <div className="lg:sticky lg:top-6 space-y-4">
                {/* Price card */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-6">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Asking Price</p>
                    <p className="text-3xl font-extrabold text-maroon-700 tracking-tight">
                      {formatNaira(car.price)}
                    </p>
                    {car.mileage != null && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formatMileage(car.mileage)} &middot; {car.year} {car.make}
                      </p>
                    )}
                  </div>

                  <div className="px-6 pb-6 space-y-3">
                    {car.status === 'AVAILABLE' ? (
                      <InquiryModalTrigger
                        car={{ id: car.id, title: car.title, price: car.price, slug: car.slug }}
                      />
                    ) : (
                      <div className="w-full text-center py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold text-sm">
                        {car.status === 'SOLD' ? 'This vehicle has been sold' : 'Sale pending — check back soon'}
                      </div>
                    )}

                    <Link
                      href="/inventory"
                      className="block w-full text-center py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                    >
                      Browse More Cars
                    </Link>
                  </div>
                </div>

                {/* Quick specs card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Specs</h3>
                  <dl className="space-y-3">
                    {[
                      { label: 'Year',         value: car.year.toString() },
                      { label: 'Mileage',      value: car.mileage != null ? formatMileage(car.mileage) : '—' },
                      { label: 'Transmission', value: car.transmission ? getTransmissionLabel(car.transmission) : '—' },
                      { label: 'Fuel',         value: car.fuelType ? getFuelLabel(car.fuelType) : '—' },
                      { label: 'Drive',        value: car.driveType ? getDriveLabel(car.driveType) : '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <dt className="text-gray-500">{label}</dt>
                        <dd className="text-gray-900 font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-400 leading-relaxed px-1">
                  All listings subject to prior sale. Information is subject to change without notice. Prices are displayed in Nigerian Naira (₦) and do not include applicable taxes, duties, or fees.
                </p>
              </div>
            </div>
          </div>

          {/* Related Cars */}
          {relatedCars.length > 0 && (
            <section className="mt-14">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">More {car.make} Vehicles</h2>
                <Link
                  href={`/inventory?make=${encodeURIComponent(car.make)}`}
                  className="text-sm font-medium text-maroon-700 hover:underline"
                >
                  View all {car.make}s
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCars.map((related: (typeof relatedCars)[number]) => {
                  const photo = related.photos[0]
                  return (
                    <Link
                      key={related.id}
                      href={`/inventory/${related.slug}`}
                      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
                        {photo ? (
                          <img
                            src={photo.url}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-maroon-700 transition-colors">
                          {related.title}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-maroon-700 font-bold text-base">{formatNaira(related.price)}</p>
                          {related.mileage != null && (
                            <p className="text-xs text-gray-500">{formatMileage(related.mileage)}</p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Recently Viewed */}
      <RecentlyViewed excludeSlug={car.slug} />
    </>
  )
}
