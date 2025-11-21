"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFilters } from "./useFilters";
import { useDebounce } from "./useDebounce";
import { useSearchParams } from "next/navigation";
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

interface UseMapExploreOptions {
  listingType: "locatii" | "servicii" | "evenimente";
  listings?: Array<{
    id: number;
    slug: string;
    title: string;
    geo?: [number, number]; // [lat, lng]
    imageUrl?: string;
  }>;
  isLoading?: boolean;
}

/**
 * Calculate distance between two coordinates in meters (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useMapExplore({
  listingType,
  listings = [],
  isLoading = false,
}: UseMapExploreOptions) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { setFilters, applyFilters } = useFilters({ listingType });
  const isInitialized = useRef(false);
  const lastAppliedBounds = useRef<string | null>(null);
  const lastAppliedLat = useRef<number | null>(null);
  const lastAppliedLng = useRef<number | null>(null);
  const lastAppliedRadius = useRef<number | null>(null);

  // Get initial center/zoom from URL params or defaults
  const initialCenter = useMemo(() => {
    const lat = searchParams.get("mapCenterLat");
    const lng = searchParams.get("mapCenterLng");
    if (lat && lng) {
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    }
    return { lat: 45.7494, lng: 21.2272 }; // Default to Timisoara
  }, [searchParams]);

  const initialZoom = useMemo(() => {
    const zoom = searchParams.get("mapZoom");
    return zoom ? parseInt(zoom, 10) : 12;
  }, [searchParams]);

  // Initialize lastApplied values from URL params on mount
  const hasInitializedFromUrl = useRef(false);
  useEffect(() => {
    if (hasInitializedFromUrl.current) return;
    hasInitializedFromUrl.current = true;

    const lat = searchParams.get("lat") || searchParams.get("mapCenterLat");
    const lng = searchParams.get("lng") || searchParams.get("mapCenterLng");
    const radius = searchParams.get("radius");

    if (lat && lastAppliedLat.current === null) {
      lastAppliedLat.current = parseFloat(lat);
    }
    if (lng && lastAppliedLng.current === null) {
      lastAppliedLng.current = parseFloat(lng);
    }
    if (radius && lastAppliedRadius.current === null) {
      lastAppliedRadius.current = parseFloat(radius);
    }
  }, [searchParams]);

  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);
  // Track center/zoom internally - don't update from URL params after initial load
  // This prevents the map from resetting when URL changes
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    initialCenter,
  );
  const [zoom, setZoom] = useState<number>(initialZoom);

  // Only update center/zoom from URL on initial mount, not on every URL change
  const hasInitializedCenterZoom = useRef(false);
  useEffect(() => {
    if (!hasInitializedCenterZoom.current) {
      hasInitializedCenterZoom.current = true;
      const lat = searchParams.get("mapCenterLat");
      const lng = searchParams.get("mapCenterLng");
      const zoomParam = searchParams.get("mapZoom");
      if (lat && lng) {
        setCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
      }
      if (zoomParam) {
        setZoom(parseInt(zoomParam, 10));
      }
    }
  }, []); // Only run on mount

  // Debounce bounds changes
  const debouncedBounds = useDebounce(bounds, 400);

  // Handle bounds change
  const handleBoundsChange = useCallback(
    (newBounds: google.maps.LatLngBounds) => {
      // Mark as initialized after first bounds change
      if (!isInitialized.current) {
        isInitialized.current = true;
      }
      setBounds(newBounds);

      // Update center and zoom from bounds (for URL persistence)
      const mapCenter = newBounds.getCenter();
      const mapZoom = mapManager.getMapInstance()?.getZoom();
      if (mapCenter) {
        setCenter({ lat: mapCenter.lat(), lng: mapCenter.lng() });
      }
      if (mapZoom !== undefined) {
        setZoom(mapZoom);
      }
    },
    [],
  );

  // When bounds change (debounced), update filters
  useEffect(() => {
    // Skip if map hasn't initialized yet or no bounds
    if (!debouncedBounds || !isInitialized.current) return;

    const ne = debouncedBounds.getNorthEast();
    const sw = debouncedBounds.getSouthWest();
    const mapCenter = debouncedBounds.getCenter();

    // Calculate center
    const centerLat = mapCenter.lat();
    const centerLng = mapCenter.lng();

    // Create a bounds signature to compare with last applied bounds
    const boundsSignature = `${centerLat.toFixed(4)},${centerLng.toFixed(4)},${ne.lat().toFixed(4)},${ne.lng().toFixed(4)},${sw.lat().toFixed(4)},${sw.lng().toFixed(4)}`;

    // Skip if bounds haven't meaningfully changed
    if (lastAppliedBounds.current === boundsSignature) {
      return;
    }

    // Calculate radius as distance from center to northeast corner
    const radius = calculateDistance(centerLat, centerLng, ne.lat(), ne.lng());

    // Check if values are different from last applied values to avoid unnecessary updates
    const latChanged =
      lastAppliedLat.current === null ||
      Math.abs(lastAppliedLat.current - centerLat) > 0.0001;
    const lngChanged =
      lastAppliedLng.current === null ||
      Math.abs(lastAppliedLng.current - centerLng) > 0.0001;
    const radiusChanged =
      lastAppliedRadius.current === null ||
      Math.abs(lastAppliedRadius.current - radius) > 100; // 100m threshold

    // Only update if values have meaningfully changed
    if (latChanged || lngChanged || radiusChanged) {
      // Mark this bounds and values as applied first
      lastAppliedBounds.current = boundsSignature;
      lastAppliedLat.current = centerLat;
      lastAppliedLng.current = centerLng;
      lastAppliedRadius.current = radius;

      // Get current zoom from map instance
      const currentZoom = mapManager.getMapInstance()?.getZoom() || zoom;

      const filtersToApply = {
        lat: centerLat,
        lng: centerLng,
        radius: Math.round(radius), // Round to meters
        mapCenterLat: centerLat,
        mapCenterLng: centerLng,
        mapZoom: currentZoom,
      };

      // Update all filters in a single batch
      setFilters(filtersToApply);

      // Apply filters immediately with the values (bypasses state update delay)
      applyFilters(filtersToApply);
    }
  }, [debouncedBounds, setFilters, applyFilters]);

  // Convert listings to markers
  const markers: MapMarker[] = useMemo(() => {
    const validListings = listings.filter(
      (listing) =>
        listing.geo && Array.isArray(listing.geo) && listing.geo.length === 2,
    );

    return validListings.map((listing) => {
      // PayloadCMS stores geo as [lat, lng]
      const geo = listing.geo!;
      return {
        id: `listing-${listing.id}`,
        title: listing.title,
        latitude: geo[0], // First element is lat
        longitude: geo[1], // Second element is lng
        thumbnail: listing.imageUrl,
        detailPath: `/${listingType}/${listing.slug}`,
      };
    });
  }, [listings, listingType]);

  return {
    mapRef,
    markers,
    isLoading,
    bounds,
    center,
    zoom,
    handleBoundsChange,
    initialCenter,
    initialZoom,
  };
}
