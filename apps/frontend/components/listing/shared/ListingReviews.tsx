import type { ListingType } from "@/types/listings";

import { FaStar } from "react-icons/fa6";

import ListingReviewsList from "./ListingReviewsList";
import ReviewForm from "./ReviewForm";

export function ListingReviews({
  type,
  listingId,
  listingRating,
  listingReviewCount,
  hasReviewedByViewer,
}: {
  type: ListingType;
  listingId: number | null;
  listingRating: number | null;
  listingReviewCount: number | null;
  hasReviewedByViewer: boolean;
}) {
  return (
    <div className="glass-card p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Recenzii</h2>
        {listingRating && listingReviewCount && (
          <div className="flex items-center gap-2">
            <FaStar className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold">{listingRating}</span>
            <span className="text-sm text-muted-foreground">
              ({listingReviewCount} recenzii)
            </span>
          </div>
        )}
      </div>

      {/* Add review button */}
      <ReviewForm
        type={type}
        listingId={listingId as number}
        hasReviewedByViewer={hasReviewedByViewer}
      />

      <ListingReviewsList type={type} listingId={listingId as number} />
    </div>
  );
}
