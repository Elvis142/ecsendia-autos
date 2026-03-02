const KEY = 'ecsendia_recently_viewed'
const MAX = 10

export interface RecentItem {
  id: string
  slug: string
  title: string
  price: number
  year: number
  make: string
  model: string
  mainPhotoUrl: string | null
}

export function getRecentlyViewed(): RecentItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addRecentlyViewed(item: RecentItem): void {
  if (typeof window === 'undefined') return
  const current = getRecentlyViewed().filter((c) => c.id !== item.id)
  const updated = [item, ...current].slice(0, MAX)
  localStorage.setItem(KEY, JSON.stringify(updated))
}
