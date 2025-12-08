"use client";

import { useMemo, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Move } from "lucide-react";
import { useCities } from "@/lib/react-query/cities.queries";
import type { UnifiedListingFormData } from "@/forms/listing/schema";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useDebounce } from "@/hooks/useDebounce";
import { UniversalMap } from "@/components/common/UniversalMap";
import { useMapSelectLocation } from "@/hooks/useMapSelectLocation";
import { AddressInput } from "@/components/common/AddressInput";

/**
 * Shared AddressTab component for all listing types
 * Handles city selection, address, and geolocation
 */
export function AddressTab() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<UnifiedListingFormData>();

  const [search, setSearch] = useState("");
  // simple flow: user selects city, then address

  const debouncedSearch = useDebounce(search, 300);
  const { data: citiesData, isLoading: isCitiesLoading } = useCities({
    search: debouncedSearch,
    limit: 20,
    // popularFallback: true,
  });

  const selectedCity = watch("city");
  const geoCoords = watch("geo");
  const addressValue = watch("address");

  // Use map selection hook
  const { markers, handleMapClick, setMarker } = useMapSelectLocation({
    initialLat: geoCoords?.lat,
    initialLng: geoCoords?.lon,
    onLocationSelect: (lat, lng) => {
      setValue("geo.lat", lat, { shouldValidate: true });
      setValue("geo.lon", lng, { shouldValidate: true });
    },
  });

  // Update marker when geoCoords change from AddressInput
  useEffect(() => {
    if (geoCoords?.lat && geoCoords?.lon) {
      setMarker(geoCoords.lat, geoCoords.lon);
    }
  }, [geoCoords?.lat, geoCoords?.lon, setMarker]);

  const selectedCityData = useMemo(() => {
    const city = citiesData?.find((c) => c.id === selectedCity);
    if (city && city.geo && Array.isArray(city.geo) && city.geo.length === 2) {
      // Cities store geo as [longitude, latitude] (GeoJSON standard)
      return {
        lat: city.geo[1], // latitude (second element)
        lng: city.geo[0], // longitude (first element)
      };
    }
    return null;
  }, [citiesData, selectedCity]);

  const onSelectCity = (cityId: string) => {
    setValue("city", parseInt(cityId), { shouldValidate: true });
    const selectedCity = citiesData?.find(
      (city) => city.id === parseInt(cityId),
    );
    if (selectedCity && selectedCity.geo) {
      // Cities store geo as [longitude, latitude] (GeoJSON standard)
      const lng = selectedCity.geo[0] || 0; // longitude (first element)
      const lat = selectedCity.geo[1] || 0; // latitude (second element)
      setValue("geo.lat", lat, { shouldValidate: true });
      setValue("geo.lon", lng, { shouldValidate: true });
      setMarker(lat, lng);
    }
  };

  // Map center: use selected location or city center
  const mapCenter = useMemo(() => {
    if (geoCoords?.lat && geoCoords?.lon) {
      return { lat: geoCoords.lat, lng: geoCoords.lon };
    }
    if (selectedCityData) {
      return { lat: selectedCityData.lat, lng: selectedCityData.lng };
    }
    return { lat: 45.7494, lng: 21.2272 }; // Default to Timisoara
  }, [geoCoords, selectedCityData]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="city">Oraș</Label>
        <SearchableSelect
          id="city"
          searchValue={search}
          onSearchChange={setSearch}
          filterByLabel
          groupEnabled
          options={
            citiesData
              ?.map((city) => ({
                value: city.id.toString() || "",
                label: city.name || "",
                group: city.county || "",
              }))
              .sort((a, b) => a.label.localeCompare(b.label)) || []
          }
          value={String(selectedCity || "")}
          onValueChange={(v) => onSelectCity(v)}
          placeholder="Selectează orașul"
          searchPlaceholder="Caută oraș..."
          className="w-full"
          error={errors.city?.message}
        />
      </div>

      {/* Address */}
      <div className="space-y-2">
        <AddressInput
          label="Adresă completă"
          value={addressValue || ""}
          onChange={(addr) =>
            setValue("address", addr, { shouldValidate: true })
          }
          onCoordinatesChange={(lat, lng) => {
            setValue("geo.lat", lat, { shouldValidate: true });
            setValue("geo.lon", lng, { shouldValidate: true });
          }}
          onLocationInfoChange={(cityName) => {
            // Optionally infer city by name when found in current list
            const cityMatch = citiesData?.find(
              (c) =>
                (c.name || "").toLowerCase() === (cityName || "").toLowerCase(),
            );
            if (cityMatch) {
              const idNum = parseInt(cityMatch.id as unknown as string, 10);
              if (!Number.isNaN(idNum)) {
                setValue("city", idNum, { shouldValidate: true });
              }
            }
          }}
          placeholder="Str. Exemplu, Nr. 123"
          error={Boolean(errors.address)}
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      {/* Map */}
      <div className="space-y-3">
        <Label>Hartă și locație</Label>

        <div className="relative border rounded-lg overflow-hidden bg-muted/30">
          <UniversalMap
            onClick={handleMapClick}
            markers={markers}
            center={mapCenter}
            zoom={13}
            initialCenter={mapCenter}
            initialZoom={13}
          />
        </div>
      </div>
    </div>
  );
}
