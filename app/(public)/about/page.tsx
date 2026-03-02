import { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Search, Truck, HeartHandshake, ArrowRight, Star, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Ecsendia Autos — our mission, how we source quality vehicles, and why thousands of Nigerians trust us for their car-buying journey.',
  openGraph: {
    title: 'About Ecsendia Autos',
    description: 'Trusted auto dealer in Lagos, Nigeria. Discover how we source quality vehicles and put customers first.',
  },
}

const trustPoints = [
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    description:
      'Every car in our inventory is manually reviewed and verified. We check VINs, service history, and condition before listing so you can shop with confidence.',
  },
  {
    icon: Search,
    title: 'Transparent Pricing',
    description:
      'No hidden fees, no pressure tactics. The price you see is the price we discuss — displayed in Nigerian Naira so there are no currency surprises.',
  },
  {
    icon: Truck,
    title: 'Nationwide Reach',
    description:
      'Based in Lagos but serving buyers across Nigeria. We can arrange logistics and shipping support to get your car to you wherever you are.',
  },
  {
    icon: HeartHandshake,
    title: 'Customer-First Service',
    description:
      'From first inquiry to final handover, our team is available to guide you. We believe buying a car should be straightforward, not stressful.',
  },
]

const sourcingSteps = [
  {
    step: '01',
    title: 'Identify Quality Vehicles',
    description:
      'Our sourcing team monitors auctions, direct listings, and trusted partners to find vehicles that meet our quality standards across popular makes and models.',
  },
  {
    step: '02',
    title: 'Inspection & Verification',
    description:
      'Shortlisted vehicles go through a multi-point inspection. We verify documentation, assess mechanical condition, and cross-check vehicle history reports.',
  },
  {
    step: '03',
    title: 'Fair Market Pricing',
    description:
      'We price each vehicle competitively, factoring in market data and condition. Our aim is value — you should never feel like you overpaid.',
  },
  {
    step: '04',
    title: 'Listed & Ready',
    description:
      'Approved vehicles are photographed, documented with full specs, and listed on our platform. You get all the details you need to make an informed decision.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-maroon-700 to-maroon-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/60 mb-4">Who We Are</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              About Ecsendia Autos
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed">
              We are a Nigerian auto dealership built on one simple idea: buying a quality car should be straightforward, honest, and stress-free — regardless of where you are in Nigeria.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/inventory"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-maroon-700 font-bold text-sm hover:bg-gray-100 transition-colors shadow"
              >
                Browse Inventory <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Star className="w-8 h-8 text-maroon-700 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              To make the car-buying experience in Nigeria more transparent, accessible, and trustworthy. We curate a selection of quality vehicles, provide honest information, and connect buyers with the right car at the right price — empowering Nigerians to move forward with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* How We Source Cars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How We Source Our Cars</h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
            Every vehicle in our inventory follows a deliberate, quality-focused process before it reaches you.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {sourcingSteps.map(({ step, title, description }) => (
            <div key={step} className="relative">
              <div className="text-5xl font-extrabold text-maroon-700/10 mb-3 leading-none">{step}</div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Why Choose Ecsendia Autos</h2>
            <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
              We have built our reputation on four core commitments to every customer.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {trustPoints.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-maroon-700/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-maroon-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick commitment list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-maroon-700 rounded-3xl p-8 sm:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Our Promise to You</h2>
              <p className="text-white/75 leading-relaxed">
                At Ecsendia Autos, we are not just selling cars — we are building long-term relationships. Our commitment to quality and transparency means you can trust what you see on our platform.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                'No pressure sales approach',
                'Accurate vehicle descriptions',
                'Responsive customer support',
                'Clear, Naira-denominated pricing',
                'Assistance with logistics & delivery',
                'Post-sale support',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/90">
                  <CheckCircle className="w-4 h-4 text-white/60 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Ready to Find Your Next Car?</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Browse our full inventory of quality vehicles available right now.
          </p>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-maroon-700 hover:bg-maroon-800 text-white font-bold text-sm tracking-wide transition-colors shadow"
          >
            View All Inventory <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
