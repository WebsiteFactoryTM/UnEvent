"use client";
import { Review } from "@/types/payload-types";
import { ListingType } from "@/types/listings";
import React from "react";
import { FaStar } from "react-icons/fa6";
import Image from "next/image";
import { useReviews } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";

export default function ListingReviewsList({
  type,
  listingId,
}: {
  type: ListingType;
  listingId: number;
}) {
  const { reviews, isLoading, isFetching } = useReviews({ type, listingId });
  if (isLoading || isFetching) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nu există recenzii încă.</p>
        <p className="text-sm">Fii primul care lasă o evaluare!</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const user = typeof review.user === "object" ? review.user : null;

        const avatar =
          user && typeof user.avatar === "object" ? user.avatar : null;

        return (
          <div
            key={`review-${review.id}`}
            className="p-4 rounded-lg border border-border space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                <Image
                  src={avatar?.url || "/placeholder.svg?height=40&width=40"}
                  alt={user?.name || "User"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {user?.displayName || user?.name || "Utilizator"}
                  </p>
                  <div className="flex items-center gap-1">
                    <FaStar className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{review.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("ro-RO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{review.comment}</p>
          </div>
        );
      })}
    </div>
  );
}
