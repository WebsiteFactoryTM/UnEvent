"use client"

import Link from "next/link"
import { FaHouse, FaChevronRight } from "react-icons/fa6"
import type { Event } from "@/payload-types"

interface EventBreadcrumbsProps {
  event: Event
}

export default function EventBreadcrumbs({ event }: EventBreadcrumbsProps) {
  const cityName = typeof event.city === "object" && event.city ? event.city.name : "România"
  const citySlug = typeof event.city === "object" && event.city ? event.city.slug : "romania"

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1" aria-label="Acasă">
        <FaHouse className="w-4 h-4" />
      </Link>

      <FaChevronRight className="w-3 h-3" />

      <Link href="/evenimente" className="hover:text-foreground transition-colors">
        Evenimente
      </Link>

      <FaChevronRight className="w-3 h-3" />

      <Link href={`/evenimente?city=${citySlug}`} className="hover:text-foreground transition-colors">
        {cityName}
      </Link>

      <FaChevronRight className="w-3 h-3" />

      <span className="text-foreground font-medium line-clamp-1">{event.title}</span>
    </nav>
  )
}
