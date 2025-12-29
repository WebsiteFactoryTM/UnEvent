import Link from "next/link";
import { Button } from "@/components/ui/button";

type ListingType = "locatii" | "servicii" | "evenimente";

interface PopularSearchItem {
  citySlug: string;
  cityLabel: string;
  typeSlug: string; // Contains category slug (e.g., "nunti-ceremonii")
  typeLabel: string; // Contains category label (e.g., "NUNȚI & CEREMONII")
}

interface PopularSearchesProps {
  listingType: ListingType;
  items: PopularSearchItem[];
}

export default function PopularSearches({
  listingType,
  items,
}: PopularSearchesProps) {
  if (!items?.length) return null;
  return (
    <section className="space-y-4">
      <h3 className="text-2xl md:text-3xl font-bold">Căutări populare</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <Button
            key={`${it.citySlug}_${it.typeSlug}`}
            asChild
            variant="outline"
            className="rounded-full"
            aria-label={`Vezi ${it.typeLabel} în ${it.cityLabel}`}
          >
            <Link href={`/${listingType}/oras/${it.citySlug}/${it.typeSlug}`}>
              {it.typeLabel} — {it.cityLabel}
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
