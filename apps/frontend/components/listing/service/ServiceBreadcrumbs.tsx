import Link from "next/link"
import { FaHouse, FaChevronRight } from "react-icons/fa6"
import type { Service } from "@/payload-types"

interface ServiceBreadcrumbsProps {
  service: Service
}

export default function ServiceBreadcrumbs({ service }: ServiceBreadcrumbsProps) {
  const cityName = typeof service.city === "object" && service.city ? service.city.name : "România"
  const citySlug = typeof service.city === "object" && service.city ? service.city.slug : ""

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors" aria-label="Acasă">
        <FaHouse className="w-4 h-4" />
      </Link>
      <FaChevronRight className="w-3 h-3" />
      <Link href="/servicii" className="hover:text-foreground transition-colors">
        Servicii
      </Link>
      <FaChevronRight className="w-3 h-3" />
      <Link href={`/servicii?city=${citySlug}`} className="hover:text-foreground transition-colors">
        {cityName}
      </Link>
      <FaChevronRight className="w-3 h-3" />
      <span className="text-foreground font-medium line-clamp-1">{service.title}</span>
    </nav>
  )
}
