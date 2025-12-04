"use client";

import type { ListingType } from "@/types/listings";
import { useState } from "react";
import Image from "next/image";
import { Media } from "@/types/payload-types";
import { ImageLightbox } from "@/components/ui/image-lightbox";

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
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={allImages}
        initialIndex={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
        title={title}
      />
    </>
  );
}
