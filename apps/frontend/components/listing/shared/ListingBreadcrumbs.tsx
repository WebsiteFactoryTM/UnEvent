import type { ListingType } from "@/types/listings";

import Link from "next/link";
import { FaHouse, FaChevronRight } from "react-icons/fa6";

export function ListingBreadcrumbs({
  type,
  cityName,
  citySlug,
  title,
}: {
  type: ListingType;
  cityName: string;
  citySlug: string;
  title: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Link
        href="/"
        className="hover:text-foreground transition-colors flex items-center gap-1"
        aria-label="Acasă"
      >
        <FaHouse className="w-4 h-4" />
      </Link>

      <FaChevronRight className="w-3 h-3" />

      <Link
        href={`/${type}`}
        className="hover:text-foreground transition-colors"
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Link>

      <FaChevronRight className="w-3 h-3" />

      <Link
        href={`/${type}/oras/${citySlug}`}
        className="hover:text-foreground transition-colors"
      >
        {cityName}
      </Link>

      <FaChevronRight className="w-3 h-3" />

      <span className="text-foreground font-medium line-clamp-1">{title}</span>
    </nav>
  );
}
