"use client";

import type { ListingType } from "@/types/listings";
import { useState } from "react";
import Image from "next/image";
import { Media } from "@/types/payload-types";
import { FaXmark, FaChevronLeft, FaChevronRight } from "react-icons/fa6";

export function ListingMedia({
  type,
  title,
  featuredImage,
  gallery,
}: {
  type: ListingType;
  title: string;
  featuredImage: Media;
  gallery: Media[];
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages: Media[] = [];

  if (featuredImage && typeof featuredImage === "object") {
    allImages.push(featuredImage);
  }

  if (gallery) {
    gallery.forEach((item) => {
      if (typeof item === "object") {
        allImages.push(item);
      }
    });
  }

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length,
    );
  };

  if (allImages.length === 0) return null;

  const thumbnails = allImages.slice(1, 9);

  return (
    <>
      <div className="space-y-4">
        {/* Featured Image */}
        <div
          className="relative w-full h-64 sm:h-96 lg:h-[500px] rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={featuredImage.url || "/placeholder.svg"}
            alt={featuredImage.alt || title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Thumbnail Gallery */}
        {thumbnails.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {thumbnails.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(index + 1)}
              >
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt || `${title} - Imagine ${index + 2}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 z-50 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Închide"
          >
            <FaXmark className="w-6 h-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Imagine anterioară"
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4">
            <Image
              src={allImages[currentImageIndex].url || "/placeholder.svg"}
              alt={allImages[currentImageIndex].alt || title}
              fill
              className="object-contain"
            />
          </div>

          <button
            onClick={nextImage}
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Imagine următoare"
          >
            <FaChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
}
