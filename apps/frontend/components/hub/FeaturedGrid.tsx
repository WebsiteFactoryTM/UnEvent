import Link from "next/link";
import { ListingCard } from "@/components/archives/ListingCard";
import { Button } from "@/components/ui/button";
import type { ListingCardData } from "@/lib/normalizers/hub";

type ListingType = "locatii" | "servicii" | "evenimente";

interface FeaturedGridProps {
  listingType: ListingType;
  items: ListingCardData[];
}

export default function FeaturedGrid({
  listingType,
  items,
}: FeaturedGridProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl md:text-3xl font-bold">
            Recomandate în toată România
          </h3>
        </div>
        <Button asChild variant="ghost">
          <Link href={`/${listingType}?p=2`}>Încarcă mai multe</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.slice(0, 12).map((item) => (
          <ListingCard
            key={`${item.listingType}_${item.slug}_${item.id}`}
            id={item.id}
            name={item.name}
            slug={item.slug}
            description={item.description}
            image={item.image}
            city={item.city}
            type={item.type}
            verified={item.verified}
            rating={item.rating}
            views={item.views}
            listingType={item.listingType}
            capacity={item.capacity}
            priceRange={item.priceRange}
            date={item.date}
            participants={item.participants}
            initialIsFavorited={item.initialIsFavorited}
          />
        ))}
      </div>
    </section>
  );
}
