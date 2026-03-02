'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoGalleryProps {
  photos: Array<{ url: string; isMain: boolean }>
  title: string
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const sorted = [...photos].sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0))
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = () => setCurrent((c) => (c === 0 ? sorted.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === sorted.length - 1 ? 0 : c + 1))

  if (!sorted.length) {
    return (
      <div className="aspect-[16/10] bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400">No photos available</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {/* Main image */}
        <div className="relative aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden group">
          <Image
            src={sorted[current].url}
            alt={`${title} - photo ${current + 1}`}
            fill
            className="object-cover"
            priority={current === 0}
            sizes="(max-width: 768px) 100vw, 60vw"
          />

          {/* Navigation */}
          {sorted.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
            {current + 1} / {sorted.length}
          </div>

          {/* Expand */}
          <button
            onClick={() => setLightbox(true)}
            className="absolute bottom-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Expand size={16} />
          </button>
        </div>

        {/* Thumbnails */}
        {sorted.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {sorted.map((photo, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all',
                  i === current ? 'border-maroon-700' : 'border-transparent opacity-60 hover:opacity-100'
                )}
              >
                <Image src={photo.url} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 text-white bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
          >
            <X size={20} />
          </button>

          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 text-white bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 text-white bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
          >
            <ChevronRight size={24} />
          </button>

          <div className="relative w-full max-w-4xl max-h-[85vh] mx-16">
            <Image
              src={sorted[current].url}
              alt={`${title} - photo ${current + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[85vh]"
            />
          </div>

          <div className="absolute bottom-4 text-white/60 text-sm">
            {current + 1} / {sorted.length}
          </div>
        </div>
      )}
    </>
  )
}
