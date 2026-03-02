'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { isInWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist'
import { toast } from 'sonner'

export function WishlistButton({ carId, carTitle }: { carId: string; carTitle: string }) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isInWishlist(carId))
  }, [carId])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (saved) {
      removeFromWishlist(carId)
      setSaved(false)
      toast.success('Removed from saved cars')
    } else {
      addToWishlist(carId)
      setSaved(true)
      toast.success('Saved! View in Saved Cars')
    }
    // Dispatch event so Navbar badge updates
    window.dispatchEvent(new Event('wishlist-changed'))
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? `Remove ${carTitle} from saved` : `Save ${carTitle}`}
      className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${
        saved
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white'
      }`}
    >
      <Heart size={15} className={saved ? 'fill-current' : ''} />
    </button>
  )
}
