"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTaxonomies } from "@/lib/react-query/taxonomies.queries";
import type {
  UnifiedListingFormData,
  EventFormData,
} from "@/forms/listing/schema";
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

  const eventTypes = taxonomies?.eventTypes || [];

  const selectedTypes = watch("type") || [];
  const pricingEnabled = watch("pricing.enabled");
  const pricingType = watch("pricing.type");
  // const description = watch("description") || ""; // Removed legacy watch

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
      <GroupedMultiSelect
        label="Tip eveniment"
        description="Selectează tipul sau tipurile de eveniment"
        placeholder="Selectează tipuri de evenimente..."
        searchPlaceholder="Caută tipuri de evenimente..."
        items={eventTypes}
        selectedIds={selectedTypes}
        onSelectionChange={(ids) =>
          setValue("type", ids, { shouldValidate: true })
        }
        isLoading={isLoading}
        emptyMessage="Nu s-au găsit tipuri de evenimente"
        errorMessage={errors.type?.message}
        required
      />

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Descriere eveniment</Label>
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
              placeholder="Descrie evenimentul: ce activități vor fi, cine participă, ce trebuie să știe invitații..."
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
            Adaugă preț bilet (opțional)
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
                  <p className="text-sm text-destructive">
                    {errors.pricing.amount.message}
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {pricingType === "free"
                ? 'Evenimentul va fi afișat cu eticheta "Intrare liberă"'
                : `Prețul va fi afișat: "${watch("pricing.amount") || "..."} RON/bilet"`}
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Capacity */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Controller
            control={control}
            name="capacity.enabled"
            render={({ field }) => (
              <Checkbox
                id="capacity-enabled"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label
            htmlFor="capacity-enabled"
            className="cursor-pointer font-medium"
          >
            Specifică capacitatea evenimentului (opțional)
          </Label>
        </div>

        {watch("capacity.enabled") && (
          <div className="ml-6 space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="capacity-total">
                Număr maxim de participanți
              </Label>
              <Input
                id="capacity-total"
                type="number"
                min="1"
                placeholder="ex: 100"
                {...register("capacity.total", { valueAsNumber: true })}
              />
              {(errors as Partial<Record<keyof EventFormData, any>>).capacity
                ?.total && (
                <p className="text-sm text-destructive">
                  {
                    (errors as Partial<Record<keyof EventFormData, any>>)
                      .capacity?.total?.message
                  }
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Capacitatea va fi afișată pe pagina evenimentului
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Ticket URL */}
      <div className="space-y-2">
        <Label htmlFor="ticketUrl">Link pentru cumpărarea biletelor</Label>
        <Input
          id="ticketUrl"
          type="url"
          placeholder="https://example.com/tickets"
          {...register("ticketUrl" as keyof EventFormData)}
          aria-invalid={
            (errors as Partial<Record<keyof EventFormData, any>>).ticketUrl
              ? "true"
              : "false"
          }
          aria-describedby={
            (errors as Partial<Record<keyof EventFormData, any>>).ticketUrl
              ? "ticketUrl-error"
              : undefined
          }
        />
        {(errors as Partial<Record<keyof EventFormData, any>>).ticketUrl && (
          <p id="ticketUrl-error" className="text-sm text-destructive">
            {
              (errors as Partial<Record<keyof EventFormData, any>>).ticketUrl
                ?.message
            }
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Opțional - Link către pagina unde utilizatorii pot cumpăra bilete
        </p>
      </div>
    </div>
  );
}
