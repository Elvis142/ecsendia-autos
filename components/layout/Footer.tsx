import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-charcoal-800 text-gray-300">
      <div className="container-site py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.svg" alt="Ecsendia Autos" width={36} height={36} className="rounded-lg" />
              <div>
                <span className="font-bold text-white text-lg leading-none block">Ecsendia</span>
                <span className="text-maroon-400 text-xs font-semibold tracking-widest uppercase">Autos</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted source for quality used vehicles in Nigeria. We source, inspect, and stand behind every car.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Home' },
                { href: '/inventory', label: 'Inventory' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-maroon-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Inventory */}
          <div>
            <h3 className="text-white font-semibold mb-4">Browse By</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/inventory?bodyType=SUV', label: 'SUVs' },
                { href: '/inventory?bodyType=SEDAN', label: 'Sedans' },
                { href: '/inventory?bodyType=TRUCK', label: 'Trucks' },
                { href: '/inventory?status=AVAILABLE', label: 'Available Now' },
                { href: '/inventory?featured=true', label: 'Featured Cars' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-maroon-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-maroon-400 mt-0.5 shrink-0" />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-maroon-400 shrink-0" />
                <a href="tel:+2349138863986" className="hover:text-maroon-400 transition-colors">
                  +234 913 886 3986
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-maroon-400 shrink-0" />
                <a href="mailto:autosales@ecsendia.site" className="hover:text-maroon-400 transition-colors">
                  autosales@ecsendia.site
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Ecsendia Autos. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
