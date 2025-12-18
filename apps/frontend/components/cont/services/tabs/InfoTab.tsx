"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTaxonomies } from "@/lib/react-query/taxonomies.queries";
import type { UnifiedListingFormData } from "@/forms/listing/schema";
import { GroupedMultiSelect } from "@/components/ui/grouped-multi-select";
import { RestrictedRichTextEditor } from "@/components/editor/RestrictedRichTextEditor";

export function InfoTab() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<UnifiedListingFormData>();

  const { data: taxonomies, isLoading } = useTaxonomies({ fullList: true });
  const serviceTypes = taxonomies?.serviceTypes || [];
  const eventTypes = taxonomies?.eventTypes || [];

  const selectedTypes = watch("type") || [];
  const selectedEvents = watch("suitableFor") || [];
  const pricingEnabled = watch("pricing.enabled");
  // const description = watch("description") || ""; // Removed legacy watch

  return (
    <div className="space-y-6">
      {/* Service Provider Name */}
      <div className="space-y-2">
        <Label htmlFor="title" className="required">
          Nume furnizor servicii
        </Label>
        <Input
          id="title"
          placeholder="Ex: DJ Marian - Sonorizare Evenimente Premium"
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

      {/* Service Type */}
      <GroupedMultiSelect
        label="Tip serviciu"
        description="Selectează categoriile de servicii pe care le oferi"
        placeholder="Selectează tipuri de servicii..."
        searchPlaceholder="Caută tipuri de servicii..."
        items={serviceTypes}
        selectedIds={selectedTypes}
        onSelectionChange={(ids) =>
          setValue("type", ids, { shouldValidate: true })
        }
        isLoading={isLoading}
        emptyMessage="Nu s-au găsit tipuri de servicii"
        errorMessage={errors.type?.message}
        required
      />

      <Separator />

      {/* Suitable For (Event Types) */}
      <GroupedMultiSelect
        label="Destinat pentru"
        description="Selectează tipurile de evenimente pentru care oferi serviciile"
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
        <Label htmlFor="description">Descriere servicii</Label>
        <Controller
          control={control}
          name="description_rich"
          render={({ field }) => (
            <RestrictedRichTextEditor
              initialValue={field.value}
              legacyValue={watch("description") || ""}
              onChange={(json) => {
                field.onChange(json);
              }}
              placeholder="Descrie serviciile oferite: experiență, echipament, ce te diferențiază..."
            />
          )}
        />
        {errors.description && !watch("description_rich") && (
          <p id="description-error" className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
        {errors.description_rich && (
          <p className="text-sm text-destructive">
            {errors.description_rich.message as string}
          </p>
        )}
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
            Adaugă preț pentru servicii (opțional)
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
                  placeholder="ex: 2000"
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
