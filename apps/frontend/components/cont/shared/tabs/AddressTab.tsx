"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { useTaxonomies } from "@/lib/react-query/taxonomies.queries";
import type { UnifiedListingFormData } from "@/forms/listing/schema";
import { City } from "@/types/payload-types";

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

  const { data: taxonomies, isLoading } = useTaxonomies({ fullList: true });

  const selectedCity = watch("city");
  const geoCoords = watch("geo");
  const manualPin = watch("geo.manualPin");

  const handleManualPinToggle = (checked: boolean) => {
    setValue("geo.manualPin", checked, { shouldValidate: true });
  };

  const simulatePinDrag = () => {
    // Simulate pin dragging (UI only - will be replaced with actual map interaction)
    const mockLat = 44.4268 + (Math.random() - 0.5) * 0.1;
    const mockLon = 26.1025 + (Math.random() - 0.5) * 0.1;
    setValue("geo.lat", mockLat, { shouldValidate: true });
    setValue("geo.lon", mockLon, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {/* City Selection */}
      <div className="space-y-2">
        <Label htmlFor="city" className="required">
          Oraș
        </Label>
        <Select
          value={selectedCity?.toString() || ""}
          onValueChange={(value) =>
            setValue("city", parseInt(value), { shouldValidate: true })
          }
        >
          <SelectTrigger id="city">
            <SelectValue placeholder="Selectează orașul" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Se încarcă...
              </SelectItem>
            ) : (
              taxonomies?.cities.map((city: City) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                  {city.county ? `, ${city.county}` : ""}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.city && (
          <p className="text-sm text-destructive">{errors.city.message}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Adresă completă</Label>
        <Input
          id="address"
          {...register("address")}
          placeholder="Str. Exemplu, Nr. 123"
        />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
        <p className="text-sm text-muted-foreground">
          Include strada, numărul, blocul, scara, etajul, apartamentul (dacă e
          cazul)
        </p>
      </div>

      {/* Map Placeholder */}
      <div className="space-y-3">
        <Label>Hartă și locație</Label>

        <div className="relative border rounded-lg overflow-hidden bg-muted/30">
          {/* Map container placeholder */}
          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
            <div className="text-center space-y-3 p-6">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Google Maps auto-detect
                </p>
                <p className="text-sm text-muted-foreground">
                  (Placeholder - va fi integrat cu Google Maps API)
                </p>
              </div>

              {geoCoords && geoCoords.lat && geoCoords.lon && (
                <div className="mt-4">
                  <p className="text-xs font-mono text-muted-foreground">
                    Lat: {geoCoords.lat.toFixed(6)}, Lon:{" "}
                    {geoCoords.lon.toFixed(6)}
                  </p>
                </div>
              )}

              {/* Mock pin icon overlay */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                <MapPin className="h-8 w-8 text-destructive fill-destructive drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 bg-background/95 backdrop-blur px-3 py-2 rounded-md border shadow-sm">
              <Checkbox
                id="manualPin"
                checked={manualPin}
                onCheckedChange={handleManualPinToggle}
              />
              <Label
                htmlFor="manualPin"
                className="text-sm cursor-pointer select-none"
              >
                Plasare manuală pin
              </Label>
            </div>

            {manualPin && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={simulatePinDrag}
                className="bg-background/95 backdrop-blur border shadow-sm"
              >
                <Move className="h-4 w-4 mr-2" />
                Simulează mutarea pin-ului
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {manualPin
            ? "Poți trage pin-ul pe hartă pentru a selecta locația exactă"
            : "Locația va fi detectată automat pe baza adresei"}
        </p>
      </div>
    </div>
  );
}
