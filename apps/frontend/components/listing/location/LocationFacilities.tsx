import { FaCheck } from "react-icons/fa6";
import type { Facility } from "@/types/payload-types";

interface LocationFacilitiesProps {
  facilities: Facility[];
}

export function LocationFacilities({ facilities }: LocationFacilitiesProps) {
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

  return (
    <div className="glass-card p-4 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Facilități</h2>

      <div className="space-y-6">
        {Object.entries(facilitiesByCategory).map(([category, items]) => (
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
    </div>
  );
}
