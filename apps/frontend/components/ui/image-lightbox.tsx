"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { FaXmark, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import type { Media } from "@/types/payload-types";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: Media[];
  initialIndex: number;
  onIndexChange: (index: number) => void;
  title?: string;
}

const SWIPE_THRESHOLD = 50; // Minimum distance in pixels to trigger swipe

export function ImageLightbox({
  isOpen,
  onClose,
  images,
  initialIndex,
  onIndexChange,
  title = "",
}: ImageLightboxProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    onIndexChange((initialIndex + 1) % images.length);
  }, [initialIndex, images.length, onIndexChange]);

  const handlePrevious = useCallback(() => {
    onIndexChange((initialIndex - 1 + images.length) % images.length);
  }, [initialIndex, images.length, onIndexChange]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, handleNext, handlePrevious]);

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > SWIPE_THRESHOLD;
    const isRightSwipe = distance < -SWIPE_THRESHOLD;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }

    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[initialIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 p-3 text-white hover:bg-white/10 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Închide"
      >
        <FaXmark className="w-6 h-6" />
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 z-60 p-3 text-white hover:bg-white/10 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Imagine anterioară"
        >
          <FaChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image container */}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-4 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          <div
            key={initialIndex}
            className="relative w-full h-full animate-fade-in"
          >
            <Image
              src={currentImage.url || "/placeholder.svg"}
              alt={currentImage.alt || title}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 z-60 p-3 text-white hover:bg-white/10 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Imagine următoare"
        >
          <FaChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-60 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
          {initialIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
