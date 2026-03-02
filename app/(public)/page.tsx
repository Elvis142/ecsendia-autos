export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FeaturedCarsSection } from './FeaturedCarsSection'
import { Search, ShieldCheck, Car, TrendingDown } from 'lucide-react'

async function getFeaturedCars() {
  return prisma.car.findMany({
    where: { featured: true, visibility: 'PUBLISHED', status: 'AVAILABLE' },
    include: { photos: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
}

async function getStats() {
  const [total, available, makes] = await Promise.all([
    prisma.car.count({ where: { visibility: 'PUBLISHED' } }),
    prisma.car.count({ where: { visibility: 'PUBLISHED', status: 'AVAILABLE' } }),
    prisma.car.groupBy({ by: ['make'], where: { visibility: 'PUBLISHED' } }),
  ])
  return { total, available, makesCount: makes.length }
}

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedCars(), getStats()])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1600')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-maroon-400/40 to-transparent" />

        <div className="relative container-site py-24 md:py-32 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-maroon-700/20 backdrop-blur-sm border border-maroon-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-maroon-400 animate-pulse" />
              <span className="text-maroon-300 font-semibold text-xs tracking-widest uppercase">Ecsendia Autos</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Drive the Car
              <span className="block mt-1 text-gradient">You Deserve</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-lg">
              Premium imported vehicles sourced from the US, carefully inspected and fairly priced in Naira.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/inventory"
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-maroon-600 to-maroon-700 hover:from-maroon-700 hover:to-maroon-800 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-maroon-700/30 hover:-translate-y-0.5"
              >
                <Car size={20} />
                Browse All Cars
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5"
              >
                Contact Us
              </Link>
            </div>

            <div className="flex gap-0 mt-12 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden w-fit">
              {[
                { value: `${stats.available}+`, label: 'Cars Available' },
                { value: `${stats.makesCount}+`, label: 'Brands' },
                { value: '100%', label: 'Verified' },
              ].map((stat, i) => (
                <div key={stat.label} className={`px-7 py-4 ${i < 2 ? 'border-r border-white/15' : ''}`}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-gradient-to-r from-maroon-700 via-maroon-600 to-maroon-700 text-white py-6">
        <div className="container-site">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: 'Verified Listings', desc: 'Every car vetted before listing' },
              { icon: TrendingDown, title: 'Transparent Pricing', desc: 'Fair Naira prices, no hidden fees' },
              { icon: Search, title: 'Smart Search', desc: 'Filter by make, price, year & more' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-white/65 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      {featured.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="container-site">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-maroon-600 font-semibold text-xs uppercase tracking-widest mb-2">Hand-Picked</p>
                <h2 className="section-title">Featured Vehicles</h2>
              </div>
              <Link href="/inventory" className="text-sm font-semibold text-maroon-600 hover:text-maroon-700 transition-colors">
                View All →
              </Link>
            </div>
            <FeaturedCarsSection cars={featured} availableCount={stats.available} />
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16">
        <div className="container-site">
          <div className="text-center mb-12">
            <p className="text-maroon-600 font-semibold text-xs uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="section-title">How It Works</h2>
            <p className="text-gray-500 mt-2">Three steps to your dream car</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Browse & Filter', desc: 'Search our inventory by make, model, price, year and more.' },
              { step: '02', title: 'Get More Info', desc: 'Found a car you like? Submit an inquiry. We respond promptly.' },
              { step: '03', title: 'Close the Deal', desc: 'Agree on price, arrange inspection, and complete your purchase.' },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-16 h-16 gradient-emerald rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-maroon-700/20 group-hover:-translate-y-1 transition-all">
                  <span className="text-white font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16 border-t border-gray-100">
        <div className="container-site">
          <div className="text-center mb-10">
            <p className="text-maroon-600 font-semibold text-xs uppercase tracking-widest mb-2">Happy Customers</p>
            <h2 className="section-title">What Our Buyers Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Adebayo Okafor',
                location: 'Lagos',
                rating: 5,
                text: 'Ecsendia made buying my Toyota Camry completely stress-free. No pressure, honest pricing, and they answered every question I had. Highly recommend.',
              },
              {
                name: 'Chioma Nwosu',
                location: 'Abuja, FCT',
                rating: 5,
                text: 'I was worried about buying a car from Lagos being in Abuja, but the team handled shipping and documentation professionally. The car arrived in perfect condition.',
              },
              {
                name: 'Emeka Eze',
                location: 'Port Harcourt',
                rating: 5,
                text: 'The Honda CR-V I bought was exactly as described — clean title, great condition. I appreciated the detailed photos and honest description on the listing.',
              },
              {
                name: 'Fatima Aliyu',
                location: 'Kano',
                rating: 5,
                text: 'Got a great deal on a 2020 Lexus RX. Their WhatsApp response was fast and they guided me through every step. Will definitely buy my next car here.',
              },
              {
                name: 'Tunde Adeyemi',
                location: 'Ibadan',
                rating: 5,
                text: 'Transparent pricing means what it says — no hidden extras were added at the last minute. The car was ready exactly when promised. Solid experience.',
              },
              {
                name: 'Blessing Okeke',
                location: 'Enugu',
                rating: 5,
                text: 'Used the inquiry form and got a call back within the hour. The sales team was knowledgeable and never pushy. Very professional outfit.',
              },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden bg-charcoal-800 text-white py-20">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1600')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-800/95 via-charcoal-800/80 to-charcoal-800/95" />
        <div className="relative container-site text-center">
          <p className="text-maroon-400 font-semibold text-xs uppercase tracking-widest mb-3">Get Started Today</p>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Ready to Find Your Car?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Browse our full inventory or reach out — we&apos;re here to help you find the perfect vehicle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inventory" className="inline-flex items-center justify-center gap-2 btn-primary px-10 py-4 text-base">
              <Car size={18} />
              Browse Inventory
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 font-semibold px-10 py-4 rounded-2xl transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
