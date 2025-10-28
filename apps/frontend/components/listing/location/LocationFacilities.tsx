import { FaCheck } from "react-icons/fa6"
import type { Location, Facility } from "@/payload-types"

interface LocationFacilitiesProps {
  location: Location
}

export function LocationFacilities({ location }: LocationFacilitiesProps) {
  const facilities = location.facilities || []
  if (facilities.length === 0) return null

  // Group facilities by category
  const facilitiesByCategory = facilities.reduce(
    (acc, facility) => {
      const facilityObj = typeof facility === "object" ? facility : null
      if (!facilityObj) return acc

      const category = facilityObj.category || "Altele"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(facilityObj)
      return acc
    },
    {} as Record<string, Facility[]>,
  )

  return (
    <div className="glass-card p-4 sm:p-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Facilități</h2>

      <div className="space-y-6">
        {Object.entries(facilitiesByCategory).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold text-muted-foreground">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((facility) => (
                <div key={facility.id} className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <FaCheck className="h-3 w-3 text-green-500" />
                  </div>
                  <span className="text-sm">{facility.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Capacity info */}
      {location.capacity && (
        <div className="pt-6 border-t border-border space-y-3">
          <h3 className="text-lg font-semibold">Capacitate</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {location.capacity.indoor && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Interior</p>
                <p className="text-lg font-semibold">{location.capacity.indoor} pers.</p>
              </div>
            )}
            {location.capacity.outdoor && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Exterior</p>
                <p className="text-lg font-semibold">{location.capacity.outdoor} pers.</p>
              </div>
            )}
            {location.capacity.seating && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Locuri așezate</p>
                <p className="text-lg font-semibold">{location.capacity.seating} pers.</p>
              </div>
            )}
            {location.capacity.parking && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Parcare</p>
                <p className="text-lg font-semibold">{location.capacity.parking} locuri</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Surface */}
      {location.surface && (
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">Suprafață</p>
          <p className="text-lg font-semibold">{location.surface} m²</p>
        </div>
      )}
    </div>
  )
}
