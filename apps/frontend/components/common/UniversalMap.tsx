"use client";

import { useEffect, useRef, useState } from "react";
import { mapManager } from "@/lib/mapManager";

interface MapMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  thumbnail?: string;
  subtitle?: string;
  detailPath?: string;
}

interface UniversalMapProps {
  onClick?: (lat: number, lng: number) => void;
  onBoundsChange?: (bounds: google.maps.LatLngBounds) => void;
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  className?: string;
}

export const UniversalMap = ({
  onClick,
  onBoundsChange,
  markers = [],
  center,
  zoom,
  initialCenter = { lat: 45.7494, lng: 21.2272 },
  initialZoom = 8,
  className = "",
}: UniversalMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialized = useRef(false);

  // Track initialization state for effect dependencies
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || isInitialized.current) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const finalCenter = center || initialCenter;
        const finalZoom = zoom || initialZoom;

        if (mapRef.current) {
          await mapManager.initializeMap(mapRef.current, {
            center: finalCenter,
            zoom: finalZoom,
          });
          isInitialized.current = true;
          setIsMapReady(true); // Trigger re-render to update markers
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Eroare la încărcarea hărții");
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Register click listener
  useEffect(() => {
    if (!isInitialized.current || !onClick) return;

    mapManager.onMapClick(onClick);

    return () => {
      mapManager.removeEventListeners();
    };
  }, [onClick, isInitialized.current]);

  // Register bounds changed listener
  useEffect(() => {
    if (!isInitialized.current || !onBoundsChange) return;

    mapManager.onBoundsChanged(onBoundsChange);

    return () => {
      mapManager.removeEventListeners();
    };
  }, [onBoundsChange, isInitialized.current]);

  // Update markers
  useEffect(() => {
    if (!isMapReady) {
      return;
    }

    if (markers.length === 0) {
      // Clear markers if empty
      mapManager.updateMarkers([]);
      return;
    }

    const mapItems = markers.map((marker) => ({
      id: marker.id,
      title: marker.title,
      latitude: marker.latitude,
      longitude: marker.longitude,
      thumbnail: marker.thumbnail,
      subtitle: marker.subtitle,
      detailPath: marker.detailPath || "#",
    }));

    mapManager.updateMarkers(mapItems);
  }, [markers, isMapReady]);

  // Update center and zoom - but only if they're significantly different
  // This prevents resetting the map when props change due to URL updates
  const lastCenterRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastZoomRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInitialized.current || !center) return;

    // Only update if center/zoom have changed significantly (more than 0.001 degrees or 1 zoom level)
    const shouldUpdate =
      !lastCenterRef.current ||
      !lastZoomRef.current ||
      Math.abs(lastCenterRef.current.lat - center.lat) > 0.001 ||
      Math.abs(lastCenterRef.current.lng - center.lng) > 0.001 ||
      Math.abs(lastZoomRef.current - (zoom || 0)) > 1;

    if (shouldUpdate) {
      mapManager.updateCenter(center, zoom);
      lastCenterRef.current = center;
      lastZoomRef.current = zoom || null;
    }
  }, [center, zoom, isInitialized.current]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isInitialized.current = false;
    };
  }, []);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-96 bg-muted rounded-lg ${className}`}
      >
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative h-96 w-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};
