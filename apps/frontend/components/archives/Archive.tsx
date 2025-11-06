// "use client" pragma for Next.js client components
"use client";

import { FeedQuery } from "@/lib/api/feed";
import { ListingType } from "@/types/listings";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchFeed } from "@/lib/api/feed";
import { feedKeys } from "@/lib/cacheKeys";
import React, { useMemo } from "react";
import { getListingTypeSlug } from "@/lib/getListingType";
import { ListingCard } from "./ListingCard";
import { ListingCardData } from "@/lib/normalizers/hub";

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

type CardItem = {
  listingId: number;
  slug: string;
  title: string;
  cityLabel: string;
  imageUrl: string | undefined;
  verified: boolean;
  ratingAvg: number | undefined;
  ratingCount: number | undefined;
  description: string;
  type: string;
  startDate: string | undefined;
  capacity: number;
  tier: "new" | "standard" | "sponsored" | "recommended" | null | undefined;
};

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

  const filters = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());

    // Convert eventWhen to date ranges for events
    const eventDateFilters =
      entity === "evenimente" && params.eventWhen
        ? convertEventWhenToDates(params.eventWhen, params.eventDate)
        : {};

    return {
      ...initialFilters,
      ...params,
      ...eventDateFilters, // Add converted date filters
      entity: getListingTypeSlug(entity),
      city,
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

  const { data, isLoading } = useQuery({
    queryKey: feedKeys.list(filters),
    queryFn: () => fetchFeed(filters),
    staleTime: 1000 * 60 * 5,
  });

  const combinedListings = [
    ...(data?.pinnedSponsored || []),
    ...(data?.organic || []),
  ];

  const handlePageChange = (direction: "next" | "prev") => {
    const currentPage = filters.page || 1;
    const nextPage = direction === "next" ? currentPage + 1 : currentPage - 1;
    if (nextPage < 1) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(nextPage));
    router.push(`?${newParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!combinedListings.length) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Nicio listare găsită.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {combinedListings.map((item: CardItem) => (
          <ListingCard
            key={item.slug}
            id={item.listingId}
            name={item.title}
            slug={item.slug}
            description={item.description}
            image={{
              url: item.imageUrl || "/placeholder.svg",
              alt: item.title,
            }}
            city={item.cityLabel}
            type={item.type}
            verified={item.verified}
            rating={
              item.ratingAvg
                ? { average: item.ratingAvg, count: item.ratingCount || 0 }
                : undefined
            }
            views={0}
            listingType={entity}
          />
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => handlePageChange("prev")}
          disabled={filters.page <= 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          ← Înapoi
        </button>
        <button
          onClick={() => handlePageChange("next")}
          disabled={!data?.meta?.hasMore}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Înainte →
        </button>
      </div>
    </div>
  );
};

export default CityArchive;
