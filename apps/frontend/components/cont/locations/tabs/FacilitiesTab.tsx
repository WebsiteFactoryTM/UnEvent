"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Facility } from "@/types/payload-types";

export function FacilitiesTab() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<UnifiedListingFormData>();

  const { data: taxonomies, isLoading } = useTaxonomies();
  const selectedFacilities = watch("facilities") || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const facilities = taxonomies?.facilities || [];

  const handleToggleFacility = (facilityId: number) => {
    const current = selectedFacilities;
    if (current.includes(facilityId)) {
      setValue(
        "facilities",
        current.filter((f) => f !== facilityId),
        { shouldValidate: true },
      );
    } else {
      setValue("facilities", [...current, facilityId], {
        shouldValidate: true,
      });
    }
  };

  const handleRemoveFacility = (facilityId: number) => {
    setValue(
      "facilities",
      selectedFacilities.filter((f) => f !== facilityId),
      { shouldValidate: true },
    );
  };

  // Filter facilities by search term
  const filteredFacilities = facilities.filter((facility: Facility) =>
    facility.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Group filtered facilities by category
  const filteredByCategory = filteredFacilities.reduce(
    (acc: Record<string, Facility[]>, facility: Facility) => {
      const category = facility.category || "Altele";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(facility);
      return acc;
    },
    {} as Record<string, typeof facilities>,
  );

  const getSelectedFacilityLabel = (id: number) => {
    return facilities.find((f: Facility) => f.id === id)?.title || String(id);
  };

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
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
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
                      {filteredByCategory[category].map(
                        (facility: Facility) => (
                          <div
                            key={facility.id}
                            className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                            onClick={() => handleToggleFacility(facility.id)}
                          >
                            <Checkbox
                              checked={selectedFacilities.includes(facility.id)}
                              onCheckedChange={() =>
                                handleToggleFacility(facility.id)
                              }
                            />
                            <label className="flex-1 text-sm cursor-pointer">
                              {facility.title}
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
                setValue("facilities", [], { shouldValidate: true });
                setIsOpen(false);
              }}
              className="w-full"
            >
              Șterge selecțiile
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* {errors.facilities && (
        <p className="text-sm text-destructive">{errors.facilities.message}</p>
      )} */}

      {/* Selected facilities chips */}
      {selectedFacilities.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label>Facilități selectate ({selectedFacilities.length})</Label>
            <div className="flex flex-wrap gap-2">
              {selectedFacilities.map((facilityId) => (
                <Badge
                  key={facilityId}
                  variant="secondary"
                  className="pl-3 pr-2 py-1.5 gap-2"
                >
                  <span>{getSelectedFacilityLabel(facilityId)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFacility(facilityId)}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
                    aria-label={`Elimină ${getSelectedFacilityLabel(facilityId)}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Info box */}
      <div className="p-4 bg-muted/30 rounded-lg space-y-2">
        <p className="text-sm font-medium">💡 Sfat</p>
        <p className="text-sm text-muted-foreground">
          Selectează toate facilitățile relevante pentru a crește șansele ca
          locația ta să apară în căutările potrivite. Facilități complete = mai
          multe rezervări!
        </p>
      </div>
    </div>
  );
}
