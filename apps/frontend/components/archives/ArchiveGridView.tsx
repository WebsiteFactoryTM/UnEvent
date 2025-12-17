import React from "react";
import { CardItem, ListingType } from "@/types/listings";
import { ListingCardData } from "@/lib/normalizers/hub";
import { Location } from "@/types/payload-types";
import { ListingCard } from "./ListingCard";

function cardItemToListingCardData(
  item: CardItem,
  entity: ListingType,
): ListingCardData {
  // Convert capacity number to Location["capacity"] format
  let capacity: Location["capacity"] | null | undefined = undefined;
  if (entity === "locatii" && item.capacity > 0) {
    capacity = { indoor: item.capacity };
  }

  return {
    id: item.listingId,
    title: item.title,
    slug: item.slug,
    description: item.description,
    image: {
      url: item.imageUrl || "/placeholder.svg",
      alt: item.title,
    },
    city: item.cityLabel,
    type: item.type,
    verified: item.verified,
    rating:
      item.ratingAvg !== undefined && item.ratingCount !== undefined
        ? { average: item.ratingAvg, count: item.ratingCount }
        : undefined,
    views: 0,
    listingType: entity,
    capacity,
    date: item.startDate,
    tier: item.tier,
  };
}

const ArchiveGridView = ({
  listings,
  entity,
  handlePageChange,
  disablePrevious,
  disableNext,
}: {
  listings: CardItem[];
  entity: ListingType;
  handlePageChange: (direction: "next" | "prev") => void;
  disablePrevious: boolean;
  disableNext: boolean;
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.length > 0 ? (
          listings.map((item: CardItem) => (
            <ListingCard
              key={item.slug}
              {...cardItemToListingCardData(item, entity)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center text-muted-foreground py-12">
            Nicio listare găsită.
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => handlePageChange("prev")}
          disabled={disablePrevious}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          ← Înapoi
        </button>
        <button
          onClick={() => handlePageChange("next")}
          disabled={disableNext}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Înainte →
        </button>
      </div>
    </>
  );
};

export default ArchiveGridView;
