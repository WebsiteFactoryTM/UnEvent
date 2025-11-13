"use client";
import { useGoogleMap } from "@/hooks/useGoogleMaps";

interface MapItem {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  thumbnail?: string;
  subtitle?: string;
  detailPath: string;
}

interface GoogleMapProps {
  items: MapItem[];
  center?: { lat: number; lng: number };
  zoom?: number;
  autoFitBounds?: boolean;
  selectedCitySlug?: string;
  cities?: Array<{
    id: string;
    name: string;
    slug: string;
    lat: number | null;
    lng: number | null | undefined;
  }>;
}

export const GoogleMap = ({
  items,
  center = { lat: 45.7494, lng: 21.2272 },
  zoom = 8,
  autoFitBounds = false,
  selectedCitySlug,
  cities = [],
}: GoogleMapProps) => {
  const { mapRef, isLoading, error } = useGoogleMap({
    items,
    center,
    zoom,
    autoFitBounds,
    selectedCitySlug,
    cities,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-96 w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};
