"use client";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import type { Facility } from "@/types/payload-types";

interface LocationFacilitiesProps {
  facilities: Facility[];
}

export function LocationFacilities({ facilities }: LocationFacilitiesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!facilities || facilities?.length === 0) return null;

  // Group facilities by category
  const facilitiesByCategory = facilities.reduce(
    (acc, facility) => {
      const facilityObj = typeof facility === "object" ? facility : null;
      if (!facilityObj) return acc;

      const category = facilityObj.category || "Altele";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(facilityObj);
      return acc;
    },
    {} as Record<string, Facility[]>,
  );

  // Flatten all facilities for counting and limiting
  const allFacilities = Object.entries(facilitiesByCategory).flatMap(
    ([category, items]) => items.map((facility) => ({ ...facility, category })),
  );

  const maxFacilities = 8;
  const shouldShowToggle = allFacilities.length > maxFacilities;
  const displayedFacilities = isExpanded
    ? allFacilities
    : allFacilities.slice(0, maxFacilities);

  // Group displayed facilities back by category
  const displayedByCategory = displayedFacilities.reduce(
    (acc, facility) => {
      const category = facility.category || "Altele";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(facility);
      return acc;
    },
    {} as Record<string, Facility[]>,
  );

  return (
    <div className="glass-card p-4 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Facilități</h2>

      <div className="space-y-6">
        {Object.entries(displayedByCategory).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold text-muted-foreground">
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((facility) => (
                <div key={facility.id} className="flex items-center gap-2">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <FaCheck className="h-3 w-3 text-green-500" />
                  </div>
                  <span className="text-sm">{facility.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {shouldShowToggle && (
        <div className="pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-auto p-0 text-primary hover:text-primary/80 transition-colors"
          >
            <span className="text-sm font-medium mr-2">
              {isExpanded
                ? "Arată mai puține facilități"
                : `Arată toate facilitățile (${allFacilities.length})`}
            </span>
            {isExpanded ? (
              <FaChevronUp className="h-4 w-4" />
            ) : (
              <FaChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
