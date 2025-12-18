"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard } from "@/components/archives/ListingCard";
import { toListingCardData } from "@/lib/normalizers/hub";
import type { Listing } from "@/types/listings";
import type { ListingCardData } from "@/lib/normalizers/hub";

interface ProfileListingsTabsProps {
  locations: Listing[];
  services: Listing[];
  events: Listing[];
}

export function ProfileListingsTabs({
  locations,
  services,
  events,
}: ProfileListingsTabsProps) {
  const totalListings = locations.length + services.length + events.length;

  // Convert listings to ListingCardData format
  const locationCards: ListingCardData[] = locations.map((loc) =>
    toListingCardData("locatii", loc),
  );
  const serviceCards: ListingCardData[] = services.map((srv) =>
    toListingCardData("servicii", srv),
  );
  const eventCards: ListingCardData[] = events.map((evt) =>
    toListingCardData("evenimente", evt),
  );

  return (
    <div className="glass-card p-6 animate-fade-in-up animation-delay-200">
      <h2 className="text-2xl font-bold mb-6">Listări ({totalListings})</h2>

      <Tabs defaultValue="locations" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="locations">
            Locații ({locations.length})
          </TabsTrigger>
          <TabsTrigger value="services">
            Servicii ({services.length})
          </TabsTrigger>
          <TabsTrigger value="events">Evenimente ({events.length})</TabsTrigger>
        </TabsList>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          {locationCards.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nu există locații listate.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {locationCards.map((card) => (
                <ListingCard key={card.id} {...card} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          {serviceCards.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nu există servicii listate.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {serviceCards.map((card) => (
                <ListingCard key={card.id} {...card} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {eventCards.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nu există evenimente listate.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {eventCards.map((card) => (
                <ListingCard key={card.id} {...card} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
