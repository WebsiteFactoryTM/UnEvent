"use client"

import { useState } from "react"
import { useFormContext, Controller } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ChevronDown, X } from "lucide-react"
import { eventTypes } from "@/mocks/locations/types"
import type { ServiceFormData } from "@/forms/service/schema"

export function InfoTab() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ServiceFormData>()

  const selectedEvents = watch("suitableFor") || []
  const pricingEnabled = watch("pricing.enabled")
  const description = watch("description") || ""

  const [eventSearchTerm, setEventSearchTerm] = useState("")
  const [isEventOpen, setIsEventOpen] = useState(false)

  const handleEventToggle = (eventValue: string) => {
    const current = selectedEvents
    if (current.includes(eventValue)) {
      setValue(
        "suitableFor",
        current.filter((e) => e !== eventValue),
        { shouldValidate: true }
      )
    } else {
      setValue("suitableFor", [...current, eventValue], { shouldValidate: true })
    }
  }

  const handleRemoveEvent = (eventValue: string) => {
    setValue(
      "suitableFor",
      selectedEvents.filter((e) => e !== eventValue),
      { shouldValidate: true }
    )
  }

  const filteredEvents = eventTypes.filter((event) =>
    event.label.toLowerCase().includes(eventSearchTerm.toLowerCase())
  )

  const getEventLabel = (value: string) => {
    return eventTypes.find((e) => e.value === value)?.label || value
  }

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

      {/* Suitable For (Event Types) */}
      <div className="space-y-3">
        <Label className="required">Destinat pentru</Label>
        <p className="text-sm text-muted-foreground">
          Selectează tipurile de evenimente pentru care oferi serviciile
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
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                {filteredEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Nu s-au găsit tipuri de evenimente
                  </p>
                ) : (
                  <div className="space-y-1">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.value}
                        className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                        onClick={() => handleEventToggle(event.value)}
                      >
                        <Checkbox
                          checked={selectedEvents.includes(event.value)}
                          onCheckedChange={() => handleEventToggle(event.value)}
                        />
                        <label className="flex-1 text-sm cursor-pointer">
                          {event.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-3 border-t bg-muted/30">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue("suitableFor", [], { shouldValidate: true })
                  setIsEventOpen(false)
                }}
                className="w-full"
              >
                Șterge selecțiile
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {errors.suitableFor && (
          <p className="text-sm text-destructive">{errors.suitableFor.message}</p>
        )}

        {/* Selected events as tags */}
        {selectedEvents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedEvents.map((eventValue) => (
              <Badge
                key={eventValue}
                variant="secondary"
                className="pl-3 pr-2 py-1.5 gap-2"
              >
                <span>{getEventLabel(eventValue)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEvent(eventValue)}
                  className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Elimină ${getEventLabel(eventValue)}`}
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
        <Label htmlFor="description">Descriere servicii</Label>
        <Textarea
          id="description"
          placeholder="Descrie serviciile oferite: experiență, echipament, ce te diferențiază..."
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
            Adaugă preț pentru servicii
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
                  <p className="text-sm text-destructive">{errors.pricing.amount.message}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Prețul va fi afișat ca „de la {watch("pricing.amount") || "..."} RON/{watch("pricing.period") === "hour" ? "oră" : watch("pricing.period") === "day" ? "zi" : "eveniment"}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

