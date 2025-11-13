import { useEffect, useRef, useState } from "react";

import { mapManager } from "@/lib/mapManager";

interface MapItem {
  id: string;
  title: string;
  latitude?: number;
  longitude?: number;
  thumbnail?: string;
  subtitle?: string;
  detailPath: string;
}

interface UseGoogleMapOptions {
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

export function useGoogleMap({
  items,
  center = { lat: 45.7494, lng: 21.2272 },
  zoom = 8,
  autoFitBounds = false,
  selectedCitySlug,
  cities = [],
}: UseGoogleMapOptions) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  // Helper function to get city coordinates
  const getCityCoordinates = (citySlug: string) => {
    const city = cities.find((c) => c.slug === citySlug);
    return city ? { lat: city.lat, lng: city.lng } : null;
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || isInitialized.current) return;

    const initMap = async () => {
      console.log(zoom, "zoom in useGoogleMaps");

      try {
        setIsLoading(true);
        setError(null);

        // Determine initial center and zoom
        let initialCenter = center;
        let initialZoom = zoom;

        // If a city is selected, center on that city
        if (selectedCitySlug) {
          const cityCoords = getCityCoordinates(selectedCitySlug);
          if (cityCoords) {
            initialCenter = cityCoords as { lat: number; lng: number };
            initialZoom = zoom; // respect provided zoom
          }
        }

        // Initialize map using singleton manager
        if (mapRef.current) {
          await mapManager.initializeMap(mapRef.current, {
            center: initialCenter,
            zoom: initialZoom,
          });
          isInitialized.current = true;
        }

        // Update markers
        mapManager.updateMarkers(items);

        // Auto-fit bounds if enabled and no explicit city selection
        if (autoFitBounds && items.length > 0 && !selectedCitySlug) {
          mapManager.fitBounds(items);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Eroare la încărcarea hărții");
        setIsLoading(false);
      }
    };

    initMap();
  }, [
    center.lat,
    center.lng,
    zoom,
    selectedCitySlug,
    autoFitBounds,
    items.length,
  ]);

  // Update markers and map view when items, center or filters change
  useEffect(() => {
    if (mapManager.getMapInstance() && isInitialized.current) {
      // Update markers
      mapManager.updateMarkers(items);

      // Always respect provided center (e.g., geocoded address)
      if (center) {
        mapManager.updateCenter(center, zoom);
      }

      // Auto-fit bounds first (only if no explicit city selection)
      if (autoFitBounds && items.length > 0 && !selectedCitySlug) {
        mapManager.fitBounds(items);
      }
    }
  }, [items, center.lat, center.lng, selectedCitySlug, autoFitBounds, zoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Reset initialization flag when component unmounts
      isInitialized.current = false;
    };
  }, []);

  return {
    mapRef,
    isLoading,
    error,
  };
}
