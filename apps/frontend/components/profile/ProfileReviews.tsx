"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FaStar } from "react-icons/fa6";
import type { ReviewMock } from "@/mocks/profile";
import type { Profile } from "@/types/payload-types copy";

interface ProfileReviewsProps {
  reviews: ReviewMock[];
  rating?: Profile["rating"];
}

export function ProfileReviews({ reviews, rating }: ProfileReviewsProps) {
  const hasReviews = reviews.length > 0;
  const avgRating = rating?.average || 0;
  const totalReviews = rating?.count || 0;

  // Calculate rating distribution (mock for now)
  const distribution = hasReviews
    ? [
        { stars: 5, count: reviews.filter((r) => r.rating === 5).length },
        { stars: 4, count: reviews.filter((r) => r.rating === 4).length },
        { stars: 3, count: reviews.filter((r) => r.rating === 3).length },
        { stars: 2, count: reviews.filter((r) => r.rating === 2).length },
        { stars: 1, count: reviews.filter((r) => r.rating === 1).length },
      ]
    : [];

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
            {reviews.map((review) => (
              <Card key={review.id} className="glass-card">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <Avatar>
                    <AvatarImage
                      src={review.authorAvatar || "/placeholder.svg"}
                      alt={review.authorName}
                    />
                    <AvatarFallback>
                      {review.authorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{review.authorName}</h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("ro-RO", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
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
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button className="glow-on-hover">Lasă o evaluare</Button>
            <Button variant="outline">Politică recenzii</Button>
          </div>
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
