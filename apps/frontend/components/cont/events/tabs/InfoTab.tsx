"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Badge } from "@/components/ui/badge"
import { eventTypes } from "@/mocks/locations/types"
import type { EventFormData } from "@/forms/event/schema"

export function InfoTab() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<EventFormData>()

  const selectedType = watch("type")
  const pricingEnabled = watch("pricing.enabled")
  const pricingType = watch("pricing.type")
  const description = watch("description") || ""

  // Get first selected type for badge preview
  const selectedTypeLabel = selectedType?.[0]
    ? eventTypes.find(t => t.value === selectedType[0])?.label
    : null

  const typeOptions = eventTypes.map((type) => ({
    value: type.value,
    label: type.label,
  }))

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="required">
          Titlul evenimentului
        </Label>
        <Input
          id="title"
          placeholder="Ex: Concert caritabil de crăciun"
          {...register("title")}
          aria-invalid={errors.title ? "true" : "false"}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive">
            {errors.title.message}
          </p>
        )}
      </div>

      <Separator />

      {/* Event Type */}
      <div className="space-y-2">
        <Label htmlFor="type" className="required">
          Tip eveniment
        </Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <SearchableSelect
              options={typeOptions}
              value={field.value?.[0] || ""}
              onValueChange={(value) => field.onChange([value])}
              placeholder="Selectează tipul de eveniment"
            />
          )}
        />
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
        
        {/* Badge Preview */}
        {selectedTypeLabel && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Preview:</span>
            <Badge variant="secondary">{selectedTypeLabel}</Badge>
          </div>
        )}
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descriere eveniment</Label>
        <Textarea
          id="description"
          placeholder="Descrie evenimentul: ce activități vor fi, cine participă, ce trebuie să știe invitații..."
          rows={6}
          maxLength={5000}
          {...register("description")}
          aria-invalid={errors.description ? "true" : "false"}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Minim 50 caractere</span>
          <span>
            {description.length} / 5000
          </span>
        </div>
      </div>

      <Separator />

      {/* Pricing */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name="pricing.enabled"
            render={({ field }) => (
              <Checkbox
                id="pricing-enabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="pricing-enabled" className="cursor-pointer font-medium">
            Adaugă preț bilet
          </Label>
        </div>

        {pricingEnabled && (
          <div className="ml-6 space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="pricing-type">Tarif</Label>
              <Controller
                control={control}
                name="pricing.type"
                render={({ field }) => (
                  <SearchableSelect
                    options={[
                      { value: "free", label: "Intrare liberă" },
                      { value: "paid", label: "Preț (RON)" },
                    ]}
                    value={field.value || "free"}
                    onValueChange={field.onChange}
                    placeholder="Selectează tariful"
                  />
                )}
              />
            </div>

            {pricingType === "paid" && (
              <div className="space-y-2">
                <Label htmlFor="pricing-amount">Preț bilet (RON)</Label>
                <Input
                  id="pricing-amount"
                  type="number"
                  min="1"
                  placeholder="ex: 50"
                  {...register("pricing.amount", { valueAsNumber: true })}
                />
                {errors.pricing?.amount && (
                  <p className="text-sm text-destructive">{errors.pricing.amount.message}</p>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {pricingType === "free" 
                ? "Evenimentul va fi afișat cu eticheta \"Intrare liberă\""
                : `Prețul va fi afișat: "${watch("pricing.amount") || "..."} RON/bilet"`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

