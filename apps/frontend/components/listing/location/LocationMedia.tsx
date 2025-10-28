"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FaChevronLeft, FaChevronRight, FaXmark } from "react-icons/fa6"
import type { Location } from "@/payload-types"

interface LocationMediaProps {
  location: Location
}

export function LocationMedia({ location }: LocationMediaProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const gallery = location.gallery || []

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % gallery.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length)
  }

  if (gallery.length === 0) return null

  return (
    <>
      <div className="space-y-2">
        {/* Main image */}
        {location.featuredImage && (
          <div
            className="relative h-64 sm:h-96 lg:h-[500px] rounded-lg overflow-hidden cursor-pointer"
            onClick={() => openLightbox(0)}
          >
            <Image
              src={location.featuredImage.url || "/placeholder.svg"}
              alt={location.featuredImage.alt || location.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Gallery thumbnails */}
        {gallery.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {gallery.slice(1, 15).map((media, index) => {
              const mediaObj = typeof media === "object" ? media : null
              if (!mediaObj) return null

              return (
                <div
                  key={mediaObj.id}
                  className="relative h-20 sm:h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openLightbox(index + 1)}
                >
                  <Image
                    src={mediaObj.url || "/placeholder.svg"}
                    alt={mediaObj.alt || ""}
                    fill
                    className="object-cover"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <FaXmark className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={prevImage}
            >
              <FaChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={nextImage}
            >
              <FaChevronRight className="h-6 w-6" />
            </Button>

            <div className="relative w-full h-full">
              {(() => {
                const media = gallery[currentIndex]
                const mediaObj = typeof media === "object" ? media : null
                if (!mediaObj) return null

                return (
                  <Image
                    src={mediaObj.url || "/placeholder.svg"}
                    alt={mediaObj.alt || ""}
                    fill
                    className="object-contain"
                  />
                )
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
