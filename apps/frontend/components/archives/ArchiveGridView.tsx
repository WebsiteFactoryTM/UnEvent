import React from "react";
import { ListingType } from "@/types/listings";
import { ListingCardData } from "@/lib/normalizers/hub";
import { ListingCard } from "./ListingCard";

const ArchiveGridView = ({
  listings,
  entity,
  handlePageChange,
  disablePrevious,
  disableNext,
}: {
  listings: ListingCardData[];
  entity: ListingType;
  handlePageChange: (direction: "next" | "prev") => void;
  disablePrevious: boolean;
  disableNext: boolean;
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.length > 0 ? (
          listings.map((item: ListingCardData) => (
            <ListingCard key={item.slug} {...item} />
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
