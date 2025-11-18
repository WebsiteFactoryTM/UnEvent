"use client";

import { useMemo } from "react";
import { UniversalMap } from "@/components/common/UniversalMap";
import { useMapExplore } from "@/hooks/useMapExplore";
import { ListingType } from "@/types/listings";

interface ArchiveMapViewListing {
  id: number;
  slug: string;
  title: string;
  geo?: [number, number]; // [lon, lat]
  imageUrl?: string;
}

interface ArchiveMapViewProps {
  listingType: ListingType;
  listings: ArchiveMapViewListing[];
  isLoading?: boolean;
}

export function ArchiveMapView({
  listingType,
  listings,
  isLoading = false,
}: ArchiveMapViewProps) {
  // Convert listingType to the format expected by useMapExplore
  const mapListingType = useMemo(() => {
    const mapping: Record<ListingType, "locatii" | "servicii" | "evenimente"> =
      {
        locatii: "locatii",
        servicii: "servicii",
        evenimente: "evenimente",
      };
    return mapping[listingType];
  }, [listingType]);

  const {
    markers,
    isLoading: mapLoading,
    handleBoundsChange,
    initialCenter,
    initialZoom,
  } = useMapExplore({
    listingType: mapListingType,
    listings,
    isLoading,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-lg overflow-hidden border border-border">
        <UniversalMap
          onBoundsChange={handleBoundsChange}
          markers={markers}
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          className="h-[600px]"
        />
      </div>

      {isLoading || mapLoading ? (
        <div className="text-center text-muted-foreground py-4">
          Se încarcă locațiile...
        </div>
      ) : markers.length === 0 ? (
        <div className="text-center text-muted-foreground py-4">
          Nu există locații cu coordonate în această zonă.
        </div>
      ) : (
        <div className="text-sm text-muted-foreground text-center">
          {markers.length} locații afișate pe hartă
        </div>
      )}
    </div>
  );
}
