"use client";

import { useCallback, useMemo, useRef, useState } from "react";

interface UseMapSelectLocationOptions {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
}

interface MapMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
}

export function useMapSelectLocation({
  initialLat,
  initialLng,
  onLocationSelect,
}: UseMapSelectLocationOptions = {}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLat, setSelectedLat] = useState<number | undefined>(
    initialLat,
  );
  const [selectedLng, setSelectedLng] = useState<number | undefined>(
    initialLng,
  );

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setSelectedLat(lat);
      setSelectedLng(lng);
      onLocationSelect?.(lat, lng);
    },
    [onLocationSelect],
  );

  const setMarker = useCallback((lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
  }, []);

  const setCenter = useCallback((lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
  }, []);

  const marker: MapMarker | undefined = useMemo(() => {
    if (selectedLat !== undefined && selectedLng !== undefined) {
      return {
        id: "selected-location",
        title: "Locație selectată",
        latitude: selectedLat,
        longitude: selectedLng,
      };
    }
    return undefined;
  }, [selectedLat, selectedLng]);

  const markers = useMemo(() => {
    return marker ? [marker] : [];
  }, [marker]);

  return {
    mapRef,
    marker,
    markers,
    selectedLat,
    selectedLng,
    handleMapClick,
    setMarker,
    setCenter,
  };
}
