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
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl md:text-3xl font-bold">
            {cityLabel} — Recomandate
          </h3>
        </div>
        <Button asChild variant="ghost">
          <Link href={`/${listingType}/oras/${citySlug}`}>
            Vezi toate în {cityLabel}
          </Link>
        </Button>
      </div>

      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem
              key={`${item.listingType}_${item.slug}_${item.id}`}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <ListingCard
                id={item.id}
                name={item.title}
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
