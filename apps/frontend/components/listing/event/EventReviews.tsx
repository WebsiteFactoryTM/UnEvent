import { FaStar } from "react-icons/fa6"
import type { Review, Profile } from "@/payload-types"

interface EventReviewsProps {
  rating?: number | null
  reviewCount?: number | null
  reviews: Review[]
}

export default function EventReviews({ rating, reviewCount, reviews }: EventReviewsProps) {
  if (!reviews || reviews.length === 0) return null

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recenzii</h2>
        {rating && reviewCount && (
          <div className="flex items-center gap-2">
            <FaStar className="h-5 w-5 text-yellow-500" />
            <span className="text-xl font-bold">{rating}</span>
            <span className="text-muted-foreground">({reviewCount} recenzii)</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {reviews.map((review) => {
          const user = typeof review.user === "object" ? (review.user as Profile) : null

          return (
            <div key={review.id} className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-semibold">{user?.name?.[0] || "?"}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{user?.name || "Utilizator"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <FaStar className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{review.rating}</span>
                </div>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
