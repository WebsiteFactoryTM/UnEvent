import { FaLocationDot } from "react-icons/fa6"
import type { Service } from "@/payload-types"

interface ServiceAddressMapProps {
  service: Service
}

export default function ServiceAddressMap({ service }: ServiceAddressMapProps) {
  const cityName = typeof service.city === "object" && service.city ? service.city.name : ""
  const address = service.address

  return (
    <div className="glass-card p-6 md:p-8 space-y-4">
      <h2 className="text-2xl font-bold">Locație & Adresă</h2>

      <div className="space-y-4">
        {/* Address Info */}
        <div className="flex items-start gap-3">
          <FaLocationDot className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          <div>
            {address && <p className="font-medium">{address}</p>}
            {cityName && <p className="text-muted-foreground">{cityName}, România</p>}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">Hartă interactivă (în dezvoltare)</p>
        </div>
      </div>
    </div>
  )
}
