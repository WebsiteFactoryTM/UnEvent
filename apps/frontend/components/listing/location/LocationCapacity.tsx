import { FaUsers, FaSquareParking, FaChair } from "react-icons/fa6";
import type { Location } from "@/types/payload-types";

interface LocationCapacityProps {
  capacity: Location["capacity"];
  surface: Location["surface"];
}

export function LocationCapacity({ capacity, surface }: LocationCapacityProps) {
  if (!capacity) return null;

  const hasCapacityData =
    capacity.indoor ||
    capacity.outdoor ||
    capacity.seating ||
    capacity.parking ||
    surface;

  if (!hasCapacityData) return null;

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">Capacitate</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {capacity.indoor && (
          <div className=" p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FaUsers className="h-5 w-5" />
              <span className="font-semibold">Interior</span>
            </div>
            <p className="text-2xl font-bold">{capacity.indoor} persoane</p>
          </div>
        )}

        {capacity.outdoor && (
          <div className=" p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FaUsers className="h-5 w-5" />
              <span className="font-semibold">Exterior</span>
            </div>
            <p className="text-2xl font-bold">{capacity.outdoor} persoane</p>
          </div>
        )}

        {capacity.seating && (
          <div className=" p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FaChair className="h-5 w-5" />
              <span className="font-semibold">Locuri pe scaune</span>
            </div>
            <p className="text-2xl font-bold">{capacity.seating} locuri</p>
          </div>
        )}

        {capacity.parking && (
          <div className=" p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FaSquareParking className="h-5 w-5" />
              <span className="font-semibold">Parcare</span>
            </div>
            <p className="text-2xl font-bold">{capacity.parking} locuri</p>
          </div>
        )}

        {surface && (
          <div className=" p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <span className="font-semibold">Suprafață</span>
            </div>
            <p className="text-2xl font-bold">{surface} m²</p>
          </div>
        )}
      </div>
    </div>
  );
}
