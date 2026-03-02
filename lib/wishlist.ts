const KEY = 'ecsendia_wishlist'

export function getWishlist(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addToWishlist(id: string): void {
  if (typeof window === 'undefined') return
  const current = getWishlist()
  if (!current.includes(id)) {
    localStorage.setItem(KEY, JSON.stringify([...current, id]))
  }
}

export function removeFromWishlist(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(getWishlist().filter((x) => x !== id)))
}

export function isInWishlist(id: string): boolean {
  return getWishlist().includes(id)
}

export function getWishlistCount(): number {
  return getWishlist().length
}
