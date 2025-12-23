"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ListingCard } from "@/components/archives/ListingCard";
import type { ListingCardData } from "@/lib/normalizers/hub";
import { useBatchFavorites } from "@/hooks/useBatchFavorites";

type ListingType = "locatii" | "servicii" | "evenimente";

interface CityRowProps {
  listingType: ListingType;
  citySlug: string;
  cityLabel: string;
  items: ListingCardData[];
}

export function CityRow({
  listingType,
  citySlug,
  cityLabel,
  items,
}: CityRowProps) {
  const { listings: enrichedItems } = useBatchFavorites(items);
  const listingTypeLabel =
    listingType.charAt(0).toUpperCase() + listingType.slice(1);
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl md:text-3xl font-bold">
            {listingTypeLabel} populare în {cityLabel}
          </h3>
        </div>
        <Button asChild variant="ghost">
          <Link href={`/${listingType}/oras/${citySlug}`}>
            Vezi mai multe în {cityLabel}
          </Link>
        </Button>
      </div>

      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {enrichedItems.map((item) => (
            <CarouselItem
              key={`${item.listingType}_${item.slug}_${item.id}`}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <ListingCard {...item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
