"use client";
import { MapPin, Loader2, Check, AlertCircle, Map } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  geocodeAddress,
  debounce,
  GeocodingResult,
  GeocodingError,
} from "@/lib/geocoding";
import { cn } from "@/lib/utils";

interface AddressInputProps {
  value: string;
  onChange: (address: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
  onLocationInfoChange?: (city: string, county: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  showMapButton?: boolean;
  onMapClick?: () => void;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  onCoordinatesChange,
  onLocationInfoChange,
  placeholder = "Introduceți adresa completă...",
  label = "Adresa",
  className,
  error = false,
  disabled = false,
  showMapButton = false,
  onMapClick,
}) => {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingResult, setGeocodingResult] =
    useState<GeocodingResult | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [hasGeocoded, setHasGeocoded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced geocoding function
  const debouncedGeocode = useRef(
    debounce(async (address: string) => {
      if (!address || address.trim().length < 5) {
        setGeocodingResult(null);
        setGeocodingError(null);
        setHasGeocoded(false);
        return;
      }

      setIsGeocoding(true);
      setGeocodingError(null);

      try {
        const result = await geocodeAddress(address);

        if ("error" in result) {
          setGeocodingError(result.message);
          setGeocodingResult(null);
          setHasGeocoded(false);
        } else {
          setGeocodingResult(result);
          setGeocodingError(null);
          setHasGeocoded(true);

          // Update coordinates if callback provided
          if (onCoordinatesChange) {
            onCoordinatesChange(result.lat, result.lng);
          }

          // Update location info if callback provided
          if (onLocationInfoChange && result.address_components) {
            const { city, county } = extractLocationInfo(
              result.address_components,
            );
            onLocationInfoChange(city, county);
          }
        }
      } catch (error) {
        setGeocodingError("Eroare la geocodificare");
        setGeocodingResult(null);
        setHasGeocoded(false);
      } finally {
        setIsGeocoding(false);
      }
    }, 800),
  ).current;

  // Trigger geocoding when address changes
  useEffect(() => {
    if (value && value.trim().length >= 5) {
      debouncedGeocode(value);
    } else {
      setGeocodingResult(null);
      setGeocodingError(null);
      setHasGeocoded(false);
    }
  }, [value, debouncedGeocode]);

  // Extract city and county from address components
  const extractLocationInfo = (
    addressComponents: any[],
  ): { city: string; county: string } => {
    let city = "";
    let county = "";

    for (const component of addressComponents) {
      if (component.types.includes("locality")) {
        city = component.long_name;
      } else if (component.types.includes("administrative_area_level_1")) {
        county = component.long_name;
      }
    }

    return { city, county };
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    onChange(newAddress);
  };

  const handleUseGeocodedAddress = () => {
    if (geocodingResult) {
      onChange(geocodingResult.formatted_address);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="address" className="text-sm font-medium">
        {label}
      </Label>

      <div className="relative">
        <Input
          ref={inputRef}
          id="address"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleAddressChange}
          disabled={disabled}
          className={cn(
            "pr-20",
            error && "border-destructive",
            hasGeocoded && "border-green-500",
          )}
        />

        {/* Status indicators */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isGeocoding && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {hasGeocoded && !isGeocoding && (
            <Check className="h-4 w-4 text-green-500" />
          )}

          {geocodingError && !isGeocoding && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}

          {showMapButton && onMapClick && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onMapClick}
              className="h-6 w-6 p-0"
            >
              <Map className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Geocoding results */}
      {geocodingResult && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <MapPin className="h-4 w-4" />
            <span>Adresă găsită</span>
          </div>

          {geocodingResult.formatted_address !== value && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Adresă sugerată: {geocodingResult.formatted_address}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseGeocodedAddress}
                className="text-xs"
              >
                Folosește această adresă
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              Lat: {geocodingResult.lat.toFixed(4)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Lng: {geocodingResult.lng.toFixed(4)}
            </Badge>
          </div>
        </div>
      )}

      {/* Geocoding error */}
      {geocodingError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{geocodingError}</span>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Introduceți adresa completă pentru a obține automat coordonatele.
        Coordonatele vor fi calculate automat când adresa este găsită.
      </p>
    </div>
  );
};
