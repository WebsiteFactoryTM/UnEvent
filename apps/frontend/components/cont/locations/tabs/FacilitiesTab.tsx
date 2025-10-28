"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown, X } from "lucide-react"
import { facilities, facilityCategories, facilitiesByCategory } from "@/mocks/locations/facilities"
import type { LocationFormData } from "@/forms/location/schema"

export function FacilitiesTab() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<LocationFormData>()

  const selectedFacilities = watch("facilities") || []
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleFacility = (facilityValue: string) => {
    const current = selectedFacilities
    if (current.includes(facilityValue)) {
      setValue(
        "facilities",
        current.filter((f) => f !== facilityValue),
        { shouldValidate: true }
      )
    } else {
      setValue("facilities", [...current, facilityValue], { shouldValidate: true })
    }
  }

  const handleRemoveFacility = (facilityValue: string) => {
    setValue(
      "facilities",
      selectedFacilities.filter((f) => f !== facilityValue),
      { shouldValidate: true }
    )
  }

  // Filter facilities by search term
  const filteredFacilities = facilities.filter((facility) =>
    facility.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group filtered facilities by category
  const filteredByCategory = filteredFacilities.reduce(
    (acc, facility) => {
      if (!acc[facility.category]) {
        acc[facility.category] = []
      }
      acc[facility.category].push(facility)
      return acc
    },
    {} as Record<string, typeof facilities>
  )

  const getSelectedFacilityLabel = (value: string) => {
    return facilities.find((f) => f.value === value)?.label || value
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Facilități disponibile</Label>
        <p className="text-sm text-muted-foreground">
          Selectează toate facilitățile disponibile la locația ta
        </p>
      </div>

      {/* Multi-select dropdown with search */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between h-auto min-h-[2.5rem] px-3 py-2"
          >
            <span className="text-left">
              {selectedFacilities.length === 0
                ? "Selectează facilități..."
                : `${selectedFacilities.length} facilități selectate`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <div className="p-3 border-b">
            <Input
              placeholder="Caută facilități..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>

          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {Object.keys(filteredByCategory).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nu s-au găsit facilități
                </p>
              ) : (
                Object.keys(filteredByCategory).map((category) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                      {category}
                    </p>
                    <div className="space-y-1">
                      {filteredByCategory[category].map((facility) => (
                        <div
                          key={facility.value}
                          className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                          onClick={() => handleToggleFacility(facility.value)}
                        >
                          <Checkbox
                            checked={selectedFacilities.includes(facility.value)}
                            onCheckedChange={() => handleToggleFacility(facility.value)}
                          />
                          <label className="flex-1 text-sm cursor-pointer">
                            {facility.label}
                          </label>
                        </div>
                      ))}
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
                setValue("facilities", [], { shouldValidate: true })
                setIsOpen(false)
              }}
              className="w-full"
            >
              Șterge selecțiile
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {errors.facilities && (
        <p className="text-sm text-destructive">{errors.facilities.message}</p>
      )}

      {/* Selected facilities chips */}
      {selectedFacilities.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label>Facilități selectate ({selectedFacilities.length})</Label>
            <div className="flex flex-wrap gap-2">
              {selectedFacilities.map((facilityValue) => {
                const facility = facilities.find((f) => f.value === facilityValue)
                return (
                  <Badge
                    key={facilityValue}
                    variant="secondary"
                    className="pl-3 pr-2 py-1.5 gap-2"
                  >
                    <span>{getSelectedFacilityLabel(facilityValue)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFacility(facilityValue)}
                      className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                      aria-label={`Elimină ${getSelectedFacilityLabel(facilityValue)}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Info box */}
      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
        <p className="text-sm font-medium">💡 Sfat</p>
        <p className="text-sm text-muted-foreground">
          Selectează toate facilitățile relevante pentru a crește șansele ca locația ta să apară în
          căutările potrivite. Facilități complete = mai multe rezervări!
        </p>
      </div>
    </div>
  )
}

