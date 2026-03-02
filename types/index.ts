import type { Car, Photo, Inquiry, AISuggestion, PriceHistory, User } from '@prisma/client'

export type CarWithPhotos = Car & {
  photos: Photo[]
}

export type CarWithAll = Car & {
  photos: Photo[]
  inquiries: Inquiry[]
}

export type InquiryWithCar = Inquiry & {
  car: Pick<Car, 'id' | 'title' | 'slug' | 'price'>
}

export type SuggestionWithHistory = AISuggestion & {
  priceHistory: PriceHistory[]
}

export type AdminUser = Pick<User, 'id' | 'email' | 'name' | 'role'>

export interface DashboardStats {
  totalCars: number
  availableCars: number
  soldCars: number
  totalInquiries: number
  newInquiries: number
  aiPending: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
}
