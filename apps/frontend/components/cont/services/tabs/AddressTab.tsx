"use client"

import { useState } from "react"
import { useFormContext, Controller } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { MapPin, Move } from "lucide-react"
import { cities } from "@/mocks/shared/cities"
import type { ServiceFormData } from "@/forms/service/schema"

export function AddressTab() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ServiceFormData>()

  const [manualPin, setManualPin] = useState(false)
  const geo = watch("geo")

  const handleManualPinChange = (checked: boolean) => {
    setManualPin(checked)
    if (geo) {
      setValue("geo.manualPin", checked, { shouldValidate: true })
    }
  }

  const cityOptions = cities.map((city) => ({
    value: city.value,
    label: city.label,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Locația serviciului</h3>
        <p className="text-sm text-muted-foreground">
          Adaugă informații despre locația de unde oferi serviciile sau unde poți fi contactat.
        </p>
      </div>

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
          placeholder="Ex: Strada Victoriei nr. 12, Sectorul 1"
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

      <Separator />

      {/* Map Placeholder */}
      <div className="space-y-3">
        <Label>Locație pe hartă</Label>
        <div className="border rounded-lg p-6 bg-muted/20 min-h-[200px] flex flex-col items-center justify-center gap-3">
          <MapPin className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Google Maps auto-detect (placeholder)
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            În versiunea finală, harta va detecta automat coordonatele pe baza adresei introduse.
          </p>
        </div>

        {/* Manual Pin Control */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="manual-pin"
            checked={manualPin}
            onCheckedChange={handleManualPinChange}
          />
          <Label htmlFor="manual-pin" className="cursor-pointer font-normal">
            Setează manual pin-ul pe hartă
          </Label>
        </div>

        {manualPin && (
          <div className="ml-6 p-4 border rounded-lg bg-muted/30 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Move className="h-4 w-4" />
              <span>Trage pin-ul pe hartă pentru a seta locația exactă (UI only)</span>
            </div>

            {geo && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Latitudine:</span>
                  <span className="ml-2 font-mono">{geo.lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Longitudine:</span>
                  <span className="ml-2 font-mono">{geo.lon.toFixed(6)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Separator />

      <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Notă:</strong> Locația ta va fi vizibilă pe hartă în pagina de profil. 
          Adresa exactă va fi partajată doar după confirmarea unei rezervări.
        </p>
      </div>
    </div>
  )
}

