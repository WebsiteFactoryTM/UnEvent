"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, X } from "lucide-react";
import { useTaxonomies } from "@/lib/react-query/taxonomies.queries";
import type { UnifiedListingFormData } from "@/forms/listing/schema";
import type { ListingType } from "@/types/payload-types";

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
  const description = watch("description") || "";

  const [typeSearchTerm, setTypeSearchTerm] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const handleTypeToggle = (typeId: number) => {
    const current = selectedTypes;
    if (current.includes(typeId)) {
      setValue(
        "type",
        current.filter((t) => t !== typeId),
        { shouldValidate: true },
      );
    } else {
      setValue("type", [...current, typeId], { shouldValidate: true });
    }
  };

  const handleRemoveType = (typeId: number) => {
    setValue(
      "type",
      selectedTypes.filter((t) => t !== typeId),
      { shouldValidate: true },
    );
  };

  const filteredTypes = eventTypes.filter((type: ListingType) =>
    type.title.toLowerCase().includes(typeSearchTerm.toLowerCase()),
  );

  // Group filtered types by category
  const filteredTypesByCategory = filteredTypes.reduce(
    (acc: Record<string, ListingType[]>, type: ListingType) => {
      const category = type.category || "Altele";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(type);
      return acc;
    },
    {} as Record<string, typeof eventTypes>,
  );

  const getTypeLabel = (id: number) => {
    return (
      eventTypes.find((t: ListingType) => t.id === id)?.title || String(id)
    );
  };

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
      <div className="space-y-3">
        <Label className="required">Tip eveniment</Label>
        <p className="text-sm text-muted-foreground">
          Selectează tipul sau tipurile de eveniment
        </p>

        <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isTypeOpen}
              className="w-full justify-between h-auto min-h-10 px-3 py-2"
            >
              <span className="text-left">
                {selectedTypes.length === 0
                  ? "Selectează tipuri de evenimente..."
                  : `${selectedTypes.length} ${selectedTypes.length === 1 ? "tip selectat" : "tipuri selectate"}`}
              </span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
          >
            <div className="p-3 border-b">
              <Input
                placeholder="Caută tipuri de evenimente..."
                value={typeSearchTerm}
                onChange={(e) => setTypeSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>

            <ScrollArea className="h-[250px]">
              <div className="p-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Se încarcă tipurile de evenimente...
                  </p>
                ) : Object.keys(filteredTypesByCategory).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nu s-au găsit tipuri de evenimente
                  </p>
                ) : (
                  Object.keys(filteredTypesByCategory).map((category) => (
                    <div key={category} className="mb-4 last:mb-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        {category}
                      </p>
                      <div className="space-y-1">
                        {filteredTypesByCategory[category].map(
                          (type: ListingType) => (
                            <div
                              key={type.id}
                              className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                              onClick={() => handleTypeToggle(type.id)}
                            >
                              <Checkbox
                                checked={selectedTypes.includes(type.id)}
                                onCheckedChange={() =>
                                  handleTypeToggle(type.id)
                                }
                              />
                              <label className="flex-1 text-sm cursor-pointer">
                                {type.title}
                              </label>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t bg-muted/30">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue("type", [], { shouldValidate: true });
                  setIsTypeOpen(false);
                }}
                className="w-full"
              >
                Șterge selecțiile
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}

        {/* Selected types as tags */}
        {selectedTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTypes.map((typeId) => (
              <Badge
                key={typeId}
                variant="secondary"
                className="pl-3 pr-2 py-1.5 gap-2"
              >
                <span>{getTypeLabel(typeId)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveType(typeId)}
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Elimină ${getTypeLabel(typeId)}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
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
    </div>
  );
}
