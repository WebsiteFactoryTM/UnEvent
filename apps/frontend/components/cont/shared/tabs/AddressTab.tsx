"use client";

import { useMemo, useState } from "react";
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
import { GoogleMap } from "@/components/common/GoogleMaps";
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

  const selectedCityData = useMemo(() => {
    return (
      citiesData
        ?.filter((city) => city.id === selectedCity)
        ?.map((city) => ({
          id: city.id.toString(),
          title: city.name || "",
          detailPath: `/oras/${city.slug}`,
          latitude: city.geo?.[1] || undefined,
          longitude: city.geo?.[0] || undefined,
        })) || []
    );
  }, [citiesData, selectedCity]);

  const handleManualPinToggle = (checked: boolean) => {
    setValue("geo.manualPin", checked, { shouldValidate: true });
  };

  const onSelectCity = (cityId: string) => {
    setValue("city", parseInt(cityId), { shouldValidate: true });
    const selectedCity = citiesData?.find(
      (city) => city.id === parseInt(cityId),
    );
    if (selectedCity) {
      setValue("geo.lat", selectedCity.geo?.[1] || 0, { shouldValidate: true });
      setValue("geo.lon", selectedCity.geo?.[0] || 0, { shouldValidate: true });
    }

    console.log(selectedCity);
  };

  const markerItems = useMemo(() => {
    if (geoCoords?.lat && geoCoords?.lon) {
      return [
        {
          id: "address",
          title: "Locație selectată",
          latitude: geoCoords.lat,
          longitude: geoCoords.lon,
          detailPath: "#",
        },
      ];
    }
    return selectedCityData;
  }, [geoCoords?.lat, geoCoords?.lon, selectedCityData]);

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

      {/* Map Placeholder */}
      <div className="space-y-3">
        <Label>Hartă și locație</Label>

        <div className="relative border rounded-lg overflow-hidden bg-muted/30">
          <GoogleMap
            items={markerItems}
            center={
              geoCoords
                ? { lat: geoCoords.lat || 0, lng: geoCoords.lon || 0 }
                : { lat: 0, lng: 0 }
            }
            zoom={13}
            autoFitBounds={true}
            selectedCitySlug={
              citiesData?.find((c) => c.id === selectedCity)?.slug || ""
            }
            cities={
              citiesData?.map((city) => ({
                id: city.id.toString(),
                name: city.name || "",
                slug: city.slug || "",
                // Backend geo is [lon, lat]; Google expects { lat, lng }
                lat: typeof city.geo?.[1] === "number" ? city.geo?.[1] : null,
                lng: typeof city.geo?.[0] === "number" ? city.geo?.[0] : null,
              })) || []
            }
          />
        </div>
      </div>
    </div>
  );
}
