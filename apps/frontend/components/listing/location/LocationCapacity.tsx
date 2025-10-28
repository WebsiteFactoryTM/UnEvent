import { FaUsers, FaSquareParking, FaChair } from "react-icons/fa6"
import type { Location } from "@/payload-types"

interface LocationCapacityProps {
  location: Location
}

export function LocationCapacity({ location }: LocationCapacityProps) {
  const capacity = location.capacity

  if (!capacity) return null

  const hasCapacityData =
    capacity.indoor || capacity.outdoor || capacity.seating || capacity.parking || location.surface

  if (!hasCapacityData) return null

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">Capacitate</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {capacity.indoor && (
          <div className="feature-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FaUsers className="h-5 w-5" />
              <span className="font-semibold">Interior</span>
            </div>
            <p className="text-2xl font-bold">{capacity.indoor} persoane</p>
          </div>
        )}

        {capacity.outdoor && (
          <div className="feature-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FaUsers className="h-5 w-5" />
              <span className="font-semibold">Exterior</span>
            </div>
            <p className="text-2xl font-bold">{capacity.outdoor} persoane</p>
          </div>
        )}

        {capacity.seating && (
          <div className="feature-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FaChair className="h-5 w-5" />
              <span className="font-semibold">Locuri pe scaune</span>
            </div>
            <p className="text-2xl font-bold">{capacity.seating} locuri</p>
          </div>
        )}

        {capacity.parking && (
          <div className="feature-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FaSquareParking className="h-5 w-5" />
              <span className="font-semibold">Parcare</span>
            </div>
            <p className="text-2xl font-bold">{capacity.parking} locuri</p>
          </div>
        )}

        {location.surface && (
          <div className="feature-card p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <span className="font-semibold">Suprafață</span>
            </div>
            <p className="text-2xl font-bold">{location.surface} m²</p>
          </div>
        )}
      </div>
    </div>
  )
}
