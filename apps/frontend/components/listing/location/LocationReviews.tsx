"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaStar } from "react-icons/fa6";
import type { Location, Review } from "@/types/payload-types";

interface LocationReviewsProps {
  location: Location;
  reviews: Review[];
}

export function LocationReviews({ location, reviews }: LocationReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);

  const approvedReviews = reviews.filter((r) => r.status === "approved");

  return (
    <div className="glass-card p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">Recenzii</h2>
        {location.rating && location.reviewCount && (
          <div className="flex items-center gap-2">
            <FaStar className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold">{location.rating}</span>
            <span className="text-sm text-muted-foreground">
              ({location.reviewCount} recenzii)
            </span>
          </div>
        )}
      </div>

      {/* Add review button */}
      {!showReviewForm && (
        <Button
          onClick={() => setShowReviewForm(true)}
          variant="outline"
          className="w-full"
        >
          Lasă o evaluare
        </Button>
      )}

      {/* Review form */}
      {showReviewForm && (
        <div className="p-4 rounded-lg border border-border space-y-4">
          <h3 className="font-semibold">Adaugă o recenzie</h3>

          {/* Star rating */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="hover:scale-110 transition-transform"
                  aria-label={`${star} stele`}
                >
                  <FaStar
                    className={`h-6 w-6 ${star <= rating ? "text-yellow-500" : "text-muted"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Comentariu</p>
            <Textarea
              placeholder="Scrie recenzia ta aici..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">Publică recenzia</Button>
            <Button variant="outline" onClick={() => setShowReviewForm(false)}>
              Anulează
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Recenziile sunt moderate conform{" "}
            <a href="/politica-de-confidentialitate" className="underline">
              politicii noastre
            </a>
            .
          </p>
        </div>
      )}

      {/* Reviews list */}
      {approvedReviews.length > 0 ? (
        <div className="space-y-4">
          {approvedReviews.map((review) => {
            const user = typeof review.user === "object" ? review.user : null;
            const avatar =
              user && typeof user.avatar === "object" ? user.avatar : null;

            return (
              <div
                key={review.id}
                className="p-4 rounded-lg border border-border space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
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

                <p className="text-sm text-muted-foreground">
                  {review.comment}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nu există recenzii încă.</p>
          <p className="text-sm">Fii primul care lasă o evaluare!</p>
        </div>
      )}
    </div>
  );
}
