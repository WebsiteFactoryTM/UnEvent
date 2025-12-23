// "use client" pragma for Next.js client components
"use client";

import { FeedQuery } from "@/lib/api/feed";
import { ListingType, CardItem } from "@/types/listings";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchFeed } from "@/lib/api/feed";
import { useCityBySlug } from "@/lib/react-query/cities.queries";
import { feedKeys } from "@/lib/cacheKeys";
import React, { useMemo, useState, useEffect } from "react";
import { getListingTypeSlug } from "@/lib/getListingType";
import { cardItemToListingCardData } from "@/lib/normalizers/hub";
import { ArchiveMapView } from "./ArchiveMapView";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Map } from "lucide-react";
import ArchiveGridView from "./ArchiveGridView";
import { useBatchFavorites } from "@/hooks/useBatchFavorites";

// Utility function to convert eventWhen filter to date ranges
function convertEventWhenToDates(
  eventWhen: string | undefined,
  eventDate?: string,
): { startDate?: string; endDate?: string } {
  if (!eventWhen || eventWhen === "orice") {
    return {};
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  switch (eventWhen) {
    case "astazi":
      // Today: from start of today to end of today
      return {
        startDate: today.toISOString().split("T")[0], // YYYY-MM-DD
        endDate: today.toISOString().split("T")[0],
      };

    case "maine":
      // Tomorrow: from start of tomorrow to end of tomorrow
      return {
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: tomorrow.toISOString().split("T")[0],
      };

    case "saptamana":
      // This week: from today to end of this week (Sunday)
      const endOfWeek = new Date(today);
      const daysUntilSunday = 7 - today.getDay(); // 0 = Sunday
      endOfWeek.setDate(
        today.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday),
      );
      return {
        startDate: today.toISOString().split("T")[0],
        endDate: endOfWeek.toISOString().split("T")[0],
      };

    case "saptamana-viitoare":
      // Next week: from next Monday to next Sunday
      const nextWeekStart = new Date(today);
      const daysUntilNextMonday = (8 - today.getDay()) % 7 || 7; // Next Monday
      nextWeekStart.setDate(today.getDate() + daysUntilNextMonday);

      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6); // Next Sunday

      return {
        startDate: nextWeekStart.toISOString().split("T")[0],
        endDate: nextWeekEnd.toISOString().split("T")[0],
      };

    case "luna":
      // This month: from today to end of this month
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
      return {
        startDate: today.toISOString().split("T")[0],
        endDate: endOfMonth.toISOString().split("T")[0],
      };

    case "specific":
      // Specific date - use the eventDate parameter
      if (eventDate) {
        return {
          startDate: eventDate,
          endDate: eventDate,
        };
      }
      return {};

    default:
      return {};
  }
}

const CityArchive = ({
  entity,
  city,
  initialPage,
  initialLimit,
  initialFilters,
}: {
  entity: ListingType;
  city: string;
  initialPage: number;
  initialLimit: number;
  initialFilters: Partial<FeedQuery>;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch city data for coordinates
  const { data: cityData } = useCityBySlug(city || "", !!city);

  // Extract coordinates from city data
  const cityCoordinates = cityData?.geo
    ? { lat: cityData.geo[1], lng: cityData.geo[0] }
    : null;

  // Read viewMode from URL params, default to "grid"
  const urlViewMode = searchParams.get("view") as "grid" | "map" | null;
  const [viewMode, setViewMode] = useState<"grid" | "map">(
    urlViewMode === "grid" || urlViewMode === "map" ? urlViewMode : "grid",
  );

  // Sync viewMode when URL params change (e.g., browser back/forward)
  useEffect(() => {
    const newViewMode = searchParams.get("view") as "grid" | "map" | null;
    if (newViewMode === "grid" || newViewMode === "map") {
      setViewMode(newViewMode);
    }
  }, [searchParams]);

  // Update URL when viewMode changes
  const handleViewModeChange = (mode: "grid" | "map") => {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams);
    params.set("view", mode);
    console.log("view mode change params", params.toString());

    // Use replace for view mode toggle to avoid cluttering history
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const filters = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());

    // Convert eventWhen to date ranges for events
    const eventDateFilters =
      entity === "evenimente" && params.eventWhen
        ? convertEventWhenToDates(params.eventWhen, params.eventDate)
        : {};

    // Parse numeric filters
    const lat = params.lat ? Number(params.lat) : undefined;
    const lng = params.lng ? Number(params.lng) : undefined;
    const radius = params.radius ? Number(params.radius) : undefined;

    return {
      ...initialFilters,
      ...params,
      ...eventDateFilters, // Add converted date filters
      entity: getListingTypeSlug(entity),
      city,
      lat: isNaN(lat as number) ? undefined : lat,
      lng: isNaN(lng as number) ? undefined : lng,
      radius: isNaN(radius as number) ? undefined : radius,
      page: (() => {
        const pageValue = Number(params.page || initialPage);
        return isNaN(pageValue) ? initialPage : pageValue;
      })(),
      limit: (() => {
        const limitValue = Number(params.limit || initialLimit);
        return isNaN(limitValue) ? initialLimit : limitValue;
      })(),
    };
  }, [searchParams, entity, city, initialPage, initialLimit, initialFilters]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: feedKeys.list(filters),
    queryFn: () => fetchFeed(filters),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
    // staleTime: 1000 * 60 * 5,
    enabled: !!filters.lat || viewMode === "grid", // Only fetch if we have coordinates in map mode, or if we're in grid mode
  });

  const combinedListings = [
    ...(data?.pinnedSponsored || []),
    ...(data?.organic || []),
  ];

  // Convert CardItem[] to ListingCardData[] for batch favorites
  const normalizedListings = useMemo(() => {
    return combinedListings.map((item: CardItem) =>
      cardItemToListingCardData(item, entity),
    );
  }, [combinedListings, entity]);

  // Batch fetch favorites for all listings
  const { listings: enrichedListings } = useBatchFavorites(normalizedListings);

  // Transform listings for map view
  const mapListings = useMemo(() => {
    const transformed = combinedListings.map((item: CardItem) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      geo: item.geo ?? undefined,
      imageUrl: item.imageUrl,
    }));

    return transformed;
  }, [combinedListings, filters]);

  const handlePageChange = (direction: "next" | "prev") => {
    const currentPage = filters.page || 1;
    const nextPage = direction === "next" ? currentPage + 1 : currentPage - 1;
    if (nextPage < 1) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(nextPage));
    router.push(`?${newParams.toString()}`);
  };

  // Only show loading skeleton on initial load (when there's no data at all)
  // Use isFetching for subtle loading indicators while keeping existing data visible
  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* View Toggle */}
      <div className="flex justify-end gap-2">
        <Button
          variant={viewMode === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => handleViewModeChange("grid")}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Grid
        </Button>
        <Button
          variant={viewMode === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => handleViewModeChange("map")}
        >
          <Map className="h-4 w-4 mr-2" />
          Hartă
        </Button>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <ArchiveGridView
          listings={enrichedListings}
          entity={entity}
          handlePageChange={handlePageChange}
          disablePrevious={filters.page <= 1}
          disableNext={!data?.meta?.hasMore}
        />
      )}

      {/* Map View */}
      {viewMode === "map" && (
        <ArchiveMapView
          listingType={entity}
          listings={mapListings}
          isLoading={isLoading}
          cityCoordinates={cityCoordinates || undefined}
        />
      )}
    </div>
  );
};

export default CityArchive;
