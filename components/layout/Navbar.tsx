'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getWishlistCount } from '@/lib/wishlist'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    setSavedCount(getWishlistCount())
    const update = () => setSavedCount(getWishlistCount())
    window.addEventListener('wishlist-changed', update)
    return () => window.removeEventListener('wishlist-changed', update)
  }, [])

  return (
    <nav className="glass-nav sticky top-0 z-40">
      <div className="container-site">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/logo.svg" alt="Ecsendia Autos" width={36} height={36} className="rounded-xl shadow-sm" />
            <div>
              <span className="font-bold text-gray-900 text-lg leading-none block tracking-tight">Ecsendia</span>
              <span className="text-maroon-600 text-xs font-semibold tracking-widest uppercase">Autos</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  pathname === link.href
                    ? 'bg-maroon-50 text-maroon-700 shadow-sm'
                    : 'text-gray-600 hover:text-maroon-700 hover:bg-maroon-50/60'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+2349138863986"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-maroon-700 transition-colors"
            >
              <Phone size={15} />
              <span className="font-medium">+234 913 886 3986</span>
            </a>
            {/* Saved cars */}
            <Link
              href="/saved"
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                pathname === '/saved'
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50/60'
              )}
              aria-label="Saved cars"
            >
              <Heart size={15} className={savedCount > 0 ? 'fill-current text-red-500' : ''} />
              <span className="hidden lg:inline">Saved</span>
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </Link>
            <Link
              href="/inventory"
              className="btn-primary text-sm px-5 py-2"
            >
              View Cars
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/saved"
              className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100/80 transition-colors"
              aria-label="Saved cars"
            >
              <Heart size={20} className={savedCount > 0 ? 'fill-current text-red-500' : ''} />
              {savedCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </Link>
            <button
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100/80 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100/50 px-4 pb-5">
          <div className="pt-2 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  pathname === link.href
                    ? 'bg-maroon-50 text-maroon-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/saved"
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                pathname === '/saved'
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Heart size={15} className={savedCount > 0 ? 'fill-current text-red-500' : ''} />
              Saved Cars
              {savedCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </Link>
          </div>
          <Link
            href="/inventory"
            onClick={() => setMobileOpen(false)}
            className="mt-3 block w-full text-center btn-primary py-3 text-sm"
          >
            View All Cars
          </Link>
        </div>
      )}
    </nav>
  )
}
