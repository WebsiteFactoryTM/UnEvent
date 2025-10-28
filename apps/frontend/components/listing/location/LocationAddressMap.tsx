import { FaLocationDot } from "react-icons/fa6"
import type { Location } from "@/payload-types"

interface LocationAddressMapProps {
  location: Location
}

export function LocationAddressMap({ location }: LocationAddressMapProps) {
  const cityName = typeof location.city === "object" ? location.city.name : "România"

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">Locație & Adresă</h2>

      <div className="space-y-4">
        {/* Address */}
        <div className="flex items-start gap-3">
          <FaLocationDot className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="font-medium">{location.address}</p>
            <p className="text-sm text-muted-foreground">{cityName}, România</p>
          </div>
        </div>

        {/* Map placeholder - TODO: Integrate real map */}
        <div className="relative h-64 sm:h-80 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          <div className="text-center space-y-2">
            <FaLocationDot className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Hartă interactivă (în curând)</p>
            {location.geo && (
              <p className="text-xs text-muted-foreground">
                Coordonate: {location.geo[0].toFixed(6)}, {location.geo[1].toFixed(6)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
