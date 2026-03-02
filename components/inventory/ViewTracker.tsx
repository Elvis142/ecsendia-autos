'use client'

import { useEffect } from 'react'
import { addRecentlyViewed, type RecentItem } from '@/lib/recently-viewed'

interface ViewTrackerProps {
  slug: string
  car: RecentItem
}

export function ViewTracker({ slug, car }: ViewTrackerProps) {
  useEffect(() => {
    // Increment server-side view counter
    fetch(`/api/cars/${slug}/view`, { method: 'POST' }).catch(() => {})
    // Add to client-side recently viewed
    addRecentlyViewed(car)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  return null
}
