"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  const locationTypes = taxonomies?.locationTypes || [];
  const eventTypes = taxonomies?.eventTypes || [];

  const selectedTypes = watch("type") || [];
  const selectedEvents = watch("suitableFor") || [];
  const pricingEnabled = watch("pricing.enabled");
  const description = watch("description") || "";

  const [typeSearchTerm, setTypeSearchTerm] = useState("");
  const [eventSearchTerm, setEventSearchTerm] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);

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

  const handleEventToggle = (eventId: number) => {
    const current = selectedEvents;
    if (current.includes(eventId)) {
      setValue(
        "suitableFor",
        current.filter((e) => e !== eventId),
        { shouldValidate: true },
      );
    } else {
      setValue("suitableFor", [...current, eventId], {
        shouldValidate: true,
      });
    }
  };

  const handleRemoveType = (typeId: number) => {
    setValue(
      "type",
      selectedTypes.filter((t) => t !== typeId),
      { shouldValidate: true },
    );
  };

  const handleRemoveEvent = (eventId: number) => {
    setValue(
      "suitableFor",
      selectedEvents.filter((e) => e !== eventId),
      { shouldValidate: true },
    );
  };

  const filteredTypes = locationTypes.filter((type: ListingType) =>
    type.title.toLowerCase().includes(typeSearchTerm.toLowerCase()),
  );

  const filteredEvents = eventTypes.filter((event: ListingType) =>
    event.title.toLowerCase().includes(eventSearchTerm.toLowerCase()),
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
    {} as Record<string, typeof locationTypes>,
  );

  // Group filtered events by category
  const filteredEventsByCategory = filteredEvents.reduce(
    (acc: Record<string, ListingType[]>, event: ListingType) => {
      const category = event.category || "Altele";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(event);
      return acc;
    },
    {} as Record<string, typeof eventTypes>,
  );

  const getTypeLabel = (id: number) => {
    return (
      locationTypes.find((t: ListingType) => t.id === id)?.title || String(id)
    );
  };

  const getEventLabel = (id: number) => {
    return (
      eventTypes.find((e: ListingType) => e.id === id)?.title || String(id)
    );
  };

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
      <div className="space-y-3">
        <Label className="required">Tip locație</Label>
        <p className="text-sm text-muted-foreground">
          Selectează toate tipurile care se potrivesc locației tale
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
                  ? "Selectează tipuri de locație..."
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
                placeholder="Caută tipuri de locație..."
                value={typeSearchTerm}
                onChange={(e) => setTypeSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>

            <ScrollArea className="h-[250px]">
              <div className="p-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Se încarcă tipurile de locație...
                  </p>
                ) : Object.keys(filteredTypesByCategory).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nu s-au găsit tipuri de locație
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

      {/* Suitable For */}
      <div className="space-y-3">
        <Label className="required">
          Destinată pentru (tipuri de evenimente)
        </Label>
        <p className="text-sm text-muted-foreground">
          Selectează tipurile de evenimente pentru care este potrivită această
          locație
        </p>

        <Popover open={isEventOpen} onOpenChange={setIsEventOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isEventOpen}
              className="w-full justify-between h-auto min-h-10 px-3 py-2"
            >
              <span className="text-left">
                {selectedEvents.length === 0
                  ? "Selectează tipuri de evenimente..."
                  : `${selectedEvents.length} ${selectedEvents.length === 1 ? "tip selectat" : "tipuri selectate"}`}
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
                value={eventSearchTerm}
                onChange={(e) => setEventSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>

            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Se încarcă tipurile de evenimente...
                  </p>
                ) : Object.keys(filteredEventsByCategory).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nu s-au găsit tipuri de evenimente
                  </p>
                ) : (
                  Object.keys(filteredEventsByCategory).map((category) => (
                    <div key={category} className="mb-4 last:mb-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        {category}
                      </p>
                      <div className="space-y-1">
                        {filteredEventsByCategory[category].map(
                          (event: ListingType) => (
                            <div
                              key={event.id}
                              className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                              onClick={() => handleEventToggle(event.id)}
                            >
                              <Checkbox
                                checked={selectedEvents.includes(event.id)}
                                onCheckedChange={() =>
                                  handleEventToggle(event.id)
                                }
                              />
                              <label className="flex-1 text-sm cursor-pointer">
                                {event.title}
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
                  setValue("suitableFor", [], { shouldValidate: true });
                  setIsEventOpen(false);
                }}
                className="w-full"
              >
                Șterge selecțiile
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* {errors.suitableFor && (
            <p className="text-sm text-destructive">
              {errors.suitableFor.message}
            </p>
          )} */}

        {/* Selected events as tags */}
        {selectedEvents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedEvents.map((eventId) => (
              <Badge
                key={eventId}
                variant="secondary"
                className="pl-3 pr-2 py-1.5 gap-2"
              >
                <span>{getEventLabel(eventId)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEvent(eventId)}
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Elimină ${getEventLabel(eventId)}`}
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
          {/* {errors.surface && (
            <p className="text-sm text-destructive">{errors.surface.message}</p>
          )} */}
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
