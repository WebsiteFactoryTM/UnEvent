"use client";
import { Review } from "@/types/payload-types";
import { ListingType } from "@/types/listings";
import React from "react";
import { FaStar } from "react-icons/fa6";
import Image from "next/image";
import { useReviews } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ListingReviewsList({
  type,
  listingId,
  userPendingReview,
}: {
  type: ListingType;
  listingId: number;
  userPendingReview?: Review;
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
  const renderReview = (review: Review, isPending = false) => {
    const user = typeof review.user === "object" ? review.user : null;
    const avatar = user && typeof user.avatar === "object" ? user.avatar : null;

    const initials = (user?.displayName || user?.name || "UN")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        key={`review-${review.id}`}
        className={`p-4 rounded-lg border space-y-3 ${
          isPending ? "opacity-70 border-dashed border-border" : "border-border"
        }`}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 border border-white/20">
            <AvatarImage
              src={avatar === null ? undefined : avatar?.url || undefined}
              alt={user?.displayName || user?.name || ""}
            />
            <AvatarFallback className="">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  {user?.displayName || user?.name || "Utilizator"}
                </p>
                {isPending && (
                  <Badge variant="outline" className="text-xs">
                    Așteaptă aprobare
                  </Badge>
                )}
              </div>
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
  };

  if (reviews.length === 0 && !userPendingReview) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nu există recenzii încă.</p>
        <p className="text-sm">Fii primul care lasă o evaluare!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show pending review first if it exists */}
      {userPendingReview && renderReview(userPendingReview, true)}
      {/* Show approved reviews */}
      {reviews.map((review) => renderReview(review, false))}
    </div>
  );
}
