"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { MapPin, Move } from "lucide-react"
import { cities } from "@/mocks/locations/cities"
import type { LocationFormData } from "@/forms/location/schema"

export function AddressTab() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LocationFormData>()

  const manualPin = watch("manualPin")
  const geoCoords = watch("geo")

  const cityOptions = cities.map((city) => ({
    value: city.value,
    label: `${city.label}${city.county ? `, ${city.county}` : ""}`,
  }))

  // Simulate pin dragging (UI only)
  const handlePinMove = () => {
    // In real implementation, this would update with actual map interaction
    const mockLat = 44.4268 + (Math.random() - 0.5) * 0.1
    const mockLon = 26.1025 + (Math.random() - 0.5) * 0.1
    setValue("geo", [mockLat, mockLon], { shouldValidate: true })
  }

  return (
    <div className="space-y-6">
      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city" className="required">
          Oraș
        </Label>
        <Controller
          control={control}
          name="city"
          render={({ field }) => (
            <SearchableSelect
              options={cityOptions}
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Selectează orașul"
              searchPlaceholder="Caută oraș..."
            />
          )}
        />
        {errors.city && (
          <p className="text-sm text-destructive">{errors.city.message}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="required">
          Adresă completă
        </Label>
        <Input
          id="address"
          placeholder="ex: Strada Panoramei nr. 15, Sector 1"
          {...register("address")}
          aria-invalid={errors.address ? "true" : "false"}
          aria-describedby={errors.address ? "address-error" : undefined}
        />
        {errors.address && (
          <p id="address-error" className="text-sm text-destructive">
            {errors.address.message}
          </p>
        )}
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
                <p className="font-medium text-foreground">Google Maps auto-detect</p>
                <p className="text-sm text-muted-foreground">
                  (Placeholder - va fi integrat cu Google Maps API)
                </p>
              </div>

              {geoCoords && (
                <div className="mt-4">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {geoCoords[0].toFixed(6)}, {geoCoords[1].toFixed(6)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Mock pin/marker */}
            {manualPin && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                <MapPin className="h-8 w-8 text-destructive fill-destructive drop-shadow-lg" />
              </div>
            )}
          </div>

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
              <Controller
                control={control}
                name="manualPin"
                render={({ field }) => (
                  <Checkbox
                    id="manual-pin"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label
                htmlFor="manual-pin"
                className="cursor-pointer text-sm font-medium"
              >
                Setează manual pin-ul
              </Label>
            </div>

            {manualPin && (
              <button
                type="button"
                onClick={handlePinMove}
                className="flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg hover:bg-background transition-colors text-sm font-medium"
              >
                <Move className="h-4 w-4" />
                Simulează mișcare pin
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {manualPin
            ? "Pin-ul poate fi mutat prin drag & drop pe hartă (funcționalitate va fi activată la integrarea cu backend)"
            : "Locația va fi detectată automat pe baza adresei introduse"}
        </p>
      </div>

      {/* Coordinates display (when available) */}
      {geoCoords && (
        <div className="p-4 bg-muted/30 rounded-lg space-y-2">
          <p className="text-sm font-medium">Coordonate geografice:</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Latitudine:</span>
              <span className="ml-2 font-mono">{geoCoords[0].toFixed(6)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Longitudine:</span>
              <span className="ml-2 font-mono">{geoCoords[1].toFixed(6)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

