"use client";

import { useState } from "react";
import { SectionCard } from "@/components/cont/SectionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAllFavorites } from "@/hooks/useAllFavorites";
import {
  LocationListing,
  EventListing,
  ServiceListing,
} from "@/types/listings";
import { VirtualizedFavoritesList } from "@/components/cont/VirtualizedFavoritesList";

export default function FavoritePage() {
  const [activeTab, setActiveTab] = useState<
    "locations" | "events" | "services"
  >("locations");

  // Use separate hooks for each tab to optimize data fetching
  const locationsData = useAllFavorites("locations");
  const eventsData = useAllFavorites("events");
  const servicesData = useAllFavorites("services");

  // Get active tab data
  const activeData =
    activeTab === "locations"
      ? locationsData
      : activeTab === "events"
        ? eventsData
        : servicesData;

  const handleRemoveFavorite = async (
    listingId: number,
    listingType: "locatii" | "servicii" | "evenimente",
  ) => {
    try {
      await activeData.removeFavoriteAsync({ listingType, listingId });
      toast.success("Eliminat din favorite");
    } catch (err) {
      toast.error("Eroare la eliminarea din favorite");
    }
  };

  // Helper functions to extract data from listings
  const getCityName = (
    listing: LocationListing | EventListing | ServiceListing,
  ): string => {
    if (typeof listing.city === "object" && listing.city) {
      return listing.city.name || "";
    }
    return "";
  };

  const getImageUrl = (
    listing: LocationListing | EventListing | ServiceListing,
  ): string => {
    if (listing.featuredImage && typeof listing.featuredImage === "object") {
      return listing.featuredImage.url || "/placeholder.svg";
    }
    return "/placeholder.svg";
  };

  const isVerified = (
    listing: LocationListing | EventListing | ServiceListing,
  ): boolean => {
    return listing.verifiedStatus === "approved";
  };

  const getRating = (
    listing: LocationListing | EventListing | ServiceListing,
  ) => {
    return {
      average: listing.rating || 0,
      count: listing.reviewCount || 0,
    };
  };

  if (activeData.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Favorite</h1>
          <p className="text-muted-foreground">
            Listările tale salvate pentru referință rapidă
          </p>
        </div>
        <SectionCard
          title="Eroare"
          description="A apărut o eroare la încărcarea favoritelor"
        >
          <p className="text-destructive">
            {activeData.error instanceof Error
              ? activeData.error.message
              : "Eroare necunoscută"}
          </p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Favorite</h1>
        <p className="text-muted-foreground">
          Listările tale salvate pentru referință rapidă
        </p>
      </div>

      <SectionCard
        title="Listările tale favorite"
        description="Gestionează locațiile, serviciile și evenimentele salvate"
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "locations" | "events" | "services")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="locations">
              Locații
              <Badge variant="secondary" className="ml-2">
                {locationsData.locations.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="services">
              Servicii
              <Badge variant="secondary" className="ml-2">
                {servicesData.services.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="events">
              Evenimente
              <Badge variant="secondary" className="ml-2">
                {eventsData.events.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Locații Tab */}
          <TabsContent value="locations" className="space-y-4">
            <VirtualizedFavoritesList
              favorites={locationsData.locations}
              isLoading={locationsData.isLoading}
              isFetchingNextPage={locationsData.isFetchingNextPage}
              hasNextPage={locationsData.hasNextPage || false}
              onLoadMore={() => locationsData.fetchNextPage()}
              onRemoveFavorite={handleRemoveFavorite}
              isRemoving={locationsData.isRemoving}
              type="locations"
              getCityName={getCityName}
              getImageUrl={getImageUrl}
              isVerified={isVerified}
              getRating={getRating}
            />
          </TabsContent>

          {/* Servicii Tab */}
          <TabsContent value="services" className="space-y-4">
            <VirtualizedFavoritesList
              favorites={servicesData.services}
              isLoading={servicesData.isLoading}
              isFetchingNextPage={servicesData.isFetchingNextPage}
              hasNextPage={servicesData.hasNextPage || false}
              onLoadMore={() => servicesData.fetchNextPage()}
              onRemoveFavorite={handleRemoveFavorite}
              isRemoving={servicesData.isRemoving}
              type="services"
              getCityName={getCityName}
              getImageUrl={getImageUrl}
              isVerified={isVerified}
              getRating={getRating}
            />
          </TabsContent>

          {/* Evenimente Tab */}
          <TabsContent value="events" className="space-y-4">
            <VirtualizedFavoritesList
              favorites={eventsData.events}
              isLoading={eventsData.isLoading}
              isFetchingNextPage={eventsData.isFetchingNextPage}
              hasNextPage={eventsData.hasNextPage || false}
              onLoadMore={() => eventsData.fetchNextPage()}
              onRemoveFavorite={handleRemoveFavorite}
              isRemoving={eventsData.isRemoving}
              type="events"
              getCityName={getCityName}
              getImageUrl={getImageUrl}
              isVerified={isVerified}
              getRating={getRating}
            />
          </TabsContent>
        </Tabs>
      </SectionCard>
    </div>
  );
}
