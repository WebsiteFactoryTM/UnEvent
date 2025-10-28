import Link from "next/link"
import { FaHouse, FaChevronRight } from "react-icons/fa6"
import type { Location } from "@/payload-types"

interface LocationBreadcrumbsProps {
  location: Location
}

export function LocationBreadcrumbs({ location }: LocationBreadcrumbsProps) {
  const cityName = typeof location.city === "object" ? location.city.name : "România"

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
        <FaHouse className="h-4 w-4" />
        <span>Acasă</span>
      </Link>
      <FaChevronRight className="h-3 w-3" />
      <Link href="/locatii" className="hover:text-foreground transition-colors">
        Locații
      </Link>
      <FaChevronRight className="h-3 w-3" />
      <Link href={`/locatii?city=${cityName}`} className="hover:text-foreground transition-colors">
        {cityName}
      </Link>
      <FaChevronRight className="h-3 w-3" />
      <span className="text-foreground font-medium line-clamp-1">{location.title}</span>
    </nav>
  )
}
