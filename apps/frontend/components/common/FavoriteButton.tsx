"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { FaHeart } from "react-icons/fa6";
import { useToast } from "@/hooks/use-toast";
import { useFavorites } from "@/hooks/useFavorites";
import { useTracking } from "@/hooks/useTracking";
import { ListingType } from "@/types/listings";

const FavoriteButton = ({
  listingType,
  listingId,
  initialIsFavorited,
  listingSlug,
  ownerId,
}: {
  listingType: ListingType;
  listingId: number;
  initialIsFavorited?: boolean;
  listingSlug?: string;
  ownerId?: string | number;
}) => {
  const { toast } = useToast();
  const { trackEvent } = useTracking();
  const { toggleAsync, isFavorited, isLoading, isToggling } = useFavorites({
    listingType,
    listingId,
    initialIsFavorited, // Don't convert undefined to false - let the hook handle it
  });
  const [showSparkle, setShowSparkle] = useState(false);

  const handleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await toggleAsync();

      // Track add/remove from favorites
      if (result.isFavorite) {
        trackEvent("addToFavorites", undefined, {
          listing_id: listingId,
          listing_type: listingType,
          listing_slug: listingSlug,
          owner_id: ownerId,
        });
        // Trigger sparkle animation when adding to favorites
        setShowSparkle(true);
      } else {
        trackEvent("removeFromFavorites", undefined, {
          listing_id: listingId,
          listing_type: listingType,
          listing_slug: listingSlug,
          owner_id: ownerId,
        });
      }
    } catch (e) {
      const err = e as any;
      const message = (err?.message as string | undefined) || "";
      toast({
        title: "Eroare",
        description:
          message || "Nu am putut actualiza favoritele. Încearcă din nou.",
        variant: "destructive",
      } as any);
    }
  };

  // Reset sparkle animation after it completes
  useEffect(() => {
    if (showSparkle) {
      const timer = setTimeout(() => setShowSparkle(false), 500);
      return () => clearTimeout(timer);
    }
  }, [showSparkle]);

  return (
    <Button
      size="icon"
      variant="ghost"
      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 z-50"
      onClick={handleFavorite}
      disabled={isLoading || isToggling}
    >
      <FaHeart className={`h-4 w-4 ${isFavorited ? "fill-red-500" : ""}`} />
      {showSparkle && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Sparkle particles - positioned in a circle */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 360) / 12;
            const radians = (angle * Math.PI) / 180;
            const distance = 20;
            const x = Math.cos(radians) * distance;
            const y = Math.sin(radians) * distance;
            return (
              <div
                key={i}
                className="sparkle-particle"
                style={
                  {
                    "--sparkle-index": i,
                    "--sparkle-x": `${x}px`,
                    "--sparkle-y": `${y}px`,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      )}
    </Button>
  );
};

export default FavoriteButton;
