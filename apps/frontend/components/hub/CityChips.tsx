import { Button } from "@/components/ui/button";
import Link from "next/link";

type ListingType = "locatii" | "servicii" | "evenimente";

export interface CityChipsProps {
  listingType: ListingType;
  options: { slug: string; label: string }[];
  defaultCity?: string;
}

export function CityChips({
  listingType,
  options,
  defaultCity,
}: CityChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Link href={`/${listingType}/oras/${opt.slug}`} key={opt.slug}>
          <Button
            key={opt.slug}
            variant="outline"
            className="rounded-full"
            aria-label={`Vezi orașul ${opt.label}`}
          >
            {opt.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}
