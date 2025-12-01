"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FaStar } from "react-icons/fa6";
import type { Profile, Review } from "@/types/payload-types";

interface ProfileReviewsProps {
  reviews: Review[];
  rating?: Profile["rating"];
}

export function ProfileReviews({ reviews, rating }: ProfileReviewsProps) {
  const hasReviews = reviews.length > 0;

  // Calculate average rating from actual reviews if available, otherwise use profile rating
  const calculatedAvgRating = hasReviews
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
      reviews.length
    : 0;
  const avgRating = hasReviews ? calculatedAvgRating : rating?.average || 0;

  // Use reviews count if available, otherwise use profile rating count
  const totalReviews = hasReviews ? reviews.length : rating?.count || 0;

  // Calculate rating distribution from actual reviews
  const distribution = hasReviews
    ? [
        { stars: 5, count: reviews.filter((r) => r.rating === 5).length },
        { stars: 4, count: reviews.filter((r) => r.rating === 4).length },
        { stars: 3, count: reviews.filter((r) => r.rating === 3).length },
        { stars: 2, count: reviews.filter((r) => r.rating === 2).length },
        { stars: 1, count: reviews.filter((r) => r.rating === 1).length },
      ]
    : [];

  // Helper to get reviewer name from profile
  const getReviewerName = (review: Review): string => {
    if (typeof review.user === "object" && review.user) {
      return review.user.displayName || review.user.name || "Utilizator anonim";
    }
    return "Utilizator anonim";
  };

  // Helper to get reviewer avatar from profile
  const getReviewerAvatar = (review: Review): string | undefined => {
    if (typeof review.user === "object" && review.user) {
      if (
        review.user.avatar &&
        typeof review.user.avatar === "object" &&
        "url" in review.user.avatar
      ) {
        return review.user.avatar.url || undefined;
      }
    }
    return undefined;
  };

  return (
    <div className="glass-card p-6 space-y-6 animate-fade-in-up animation-delay-300">
      <h2 className="text-2xl font-bold">
        Evaluări și recenzii ({totalReviews})
      </h2>

      {hasReviews ? (
        <div className="space-y-6">
          {/* Rating Summary */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  {avgRating.toFixed(1)}
                </span>
                <FaStar className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-muted-foreground">
                Bazat pe {totalReviews}{" "}
                {totalReviews === 1 ? "recenzie" : "recenzii"}
              </p>
            </div>

            {/* Distribution */}
            <div className="space-y-2">
              {distribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-sm w-8">{item.stars} ★</span>
                  <Progress
                    value={(item.count / totalReviews) * 100}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => {
              const reviewerName = getReviewerName(review);
              const reviewerAvatar = getReviewerAvatar(review);
              return (
                <Card key={review.id} className="glass-card">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <Avatar>
                      <AvatarImage
                        src={reviewerAvatar || "/placeholder.svg"}
                        alt={reviewerName}
                      />
                      <AvatarFallback>
                        {reviewerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{reviewerName}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(
                            "ro-RO",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "text-yellow-500" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  {review.comment && (
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          {/* <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button className="glow-on-hover">Lasă o evaluare</Button>
            <Button variant="outline">Politică recenzii</Button>
          </div> */}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <p className="text-muted-foreground">
            Acest profil nu are încă recenzii.
          </p>
          <Button className="glow-on-hover">
            Fii primul care lasă o evaluare
          </Button>
        </div>
      )}
    </div>
  );
}
