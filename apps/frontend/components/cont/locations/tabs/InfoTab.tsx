"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useTaxonomies } from "@/lib/react-query/taxonomies.queries";
import type { UnifiedListingFormData } from "@/forms/listing/schema";
import { GroupedMultiSelect } from "@/components/ui/grouped-multi-select";

export function InfoTab() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<UnifiedListingFormData>();

  const { data: taxonomies, isLoading } = useTaxonomies({ fullList: true });
  const locationTypes = taxonomies?.locationTypes || [];
  const eventTypes = taxonomies?.eventTypes || [];

  const selectedTypes = watch("type") || [];
  const selectedEvents = watch("suitableFor") || [];
  const pricingEnabled = watch("pricing.enabled");
  const description = watch("description") || "";

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="required">
          Titlul locației
        </Label>
        <Input
          id="title"
          placeholder="ex: Vila Panoramic - Sală de evenimente premium"
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

      {/* Location Type */}
      <GroupedMultiSelect
        label="Tip locație"
        description="Selectează toate tipurile care se potrivesc locației tale"
        placeholder="Selectează tipuri de locație..."
        searchPlaceholder="Caută tipuri de locație..."
        items={locationTypes}
        selectedIds={selectedTypes}
        onSelectionChange={(ids) =>
          setValue("type", ids, { shouldValidate: true })
        }
        isLoading={isLoading}
        emptyMessage="Nu s-au găsit tipuri de locație"
        errorMessage={errors.type?.message}
        required
      />

      <Separator />

      {/* Suitable For */}
      <GroupedMultiSelect
        label="Destinată pentru (tipuri de evenimente)"
        description="Selectează tipurile de evenimente pentru care este potrivită această locație"
        placeholder="Selectează tipuri de evenimente..."
        searchPlaceholder="Caută tipuri de evenimente..."
        items={eventTypes}
        selectedIds={selectedEvents}
        onSelectionChange={(ids) =>
          setValue("suitableFor", ids, { shouldValidate: true })
        }
        isLoading={isLoading}
        emptyMessage="Nu s-au găsit tipuri de evenimente"
        errorMessage={(errors as any).suitableFor?.message}
        required
      />

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descriere locație</Label>
        <Textarea
          id="description"
          placeholder="Descrie locația ta în detaliu: facilități, atmosferă, ce o face specială..."
          rows={6}
          maxLength={5000}
          {...register("description")}
          aria-invalid={errors.description ? "true" : "false"}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Minim 50 caractere</span>
          <span>{description.length} / 5000</span>
        </div>
      </div>

      <Separator />

      {/* Capacity & Surface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label>Capacitate (persoane)</Label>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="capacity-indoor" className="text-sm font-normal">
                Interior
              </Label>
              <Input
                id="capacity-indoor"
                type="number"
                min="0"
                placeholder="ex: 150"
                {...register("capacity.indoor", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity-outdoor" className="text-sm font-normal">
                Exterior
              </Label>
              <Input
                id="capacity-outdoor"
                type="number"
                min="0"
                placeholder="ex: 200"
                {...register("capacity.outdoor", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity-seating" className="text-sm font-normal">
                Locuri la mese
              </Label>
              <Input
                id="capacity-seating"
                type="number"
                min="0"
                placeholder="ex: 180"
                {...register("capacity.seating", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity-parking" className="text-sm font-normal">
                Locuri parcare
              </Label>
              <Input
                id="capacity-parking"
                type="number"
                min="0"
                placeholder="ex: 50"
                {...register("capacity.parking", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="surface">Suprafață (m²)</Label>
          <Input
            id="surface"
            type="number"
            min="1"
            placeholder="ex: 450"
            {...register("surface", { valueAsNumber: true })}
          />
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
          <Label
            htmlFor="pricing-enabled"
            className="cursor-pointer font-medium"
          >
            Adaugă preț pentru închiriere (opțional)
          </Label>
        </div>

        {pricingEnabled && (
          <div className="ml-6 space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricing-period">Facturare</Label>
                <Controller
                  control={control}
                  name="pricing.period"
                  render={({ field }) => (
                    <SearchableSelect
                      options={[
                        { value: "hour", label: "Pe oră" },
                        { value: "day", label: "Pe zi" },
                        { value: "event", label: "Pe eveniment" },
                      ]}
                      value={field.value || "event"}
                      onValueChange={field.onChange}
                      placeholder="Selectează perioada"
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricing-amount">Preț (RON)</Label>
                <Input
                  id="pricing-amount"
                  type="number"
                  min="1"
                  placeholder="ex: 5000"
                  {...register("pricing.amount", { valueAsNumber: true })}
                />
                {errors.pricing?.amount && (
                  <p className="text-sm text-destructive">
                    {errors.pricing.amount.message}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Prețul va fi afișat ca „de la {watch("pricing.amount") || "..."}{" "}
              RON/
              {watch("pricing.period") === "hour"
                ? "oră"
                : watch("pricing.period") === "day"
                  ? "zi"
                  : "eveniment"}
              "
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
