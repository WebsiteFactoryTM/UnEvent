import Image from "next/image"
import { FaStar } from "react-icons/fa6"
import { Button } from "@/components/ui/button"
import type { Service, Review, Profile, Media } from "@/payload-types"

interface ServiceReviewsProps {
  service: Service
  reviews: Review[]
}

export default function ServiceReviews({ service, reviews }: ServiceReviewsProps) {
  const approvedReviews = reviews.filter((r) => r.status === "approved")

  return (
    <div className="glass-card p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recenzii</h2>
        <Button variant="outline">Lasă o evaluare</Button>
      </div>

      {/* Rating Summary */}
      {service.rating && service.reviewCount && (
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="text-center">
            <div className="text-4xl font-bold">{service.rating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(service.rating!) ? "text-yellow-500" : "text-gray-600"}`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{service.reviewCount} recenzii</div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {approvedReviews.length > 0 ? (
        <div className="space-y-6">
          {approvedReviews.map((review) => {
            const user = typeof review.user === "object" ? (review.user as Profile) : null
            const avatar = user?.avatar && typeof user.avatar === "object" ? (user.avatar as Media) : null

            return (
              <div key={review.id} className="space-y-3">
                <div className="flex items-start gap-4">
                  {avatar && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image src={avatar.url || ""} alt={avatar.alt} fill className="object-cover" sizes="48px" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{user?.displayName || user?.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? "text-yellow-500" : "text-gray-600"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("ro-RO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Nu există recenzii încă.</p>
          <p className="text-sm mt-2">Fii primul care lasă o evaluare!</p>
        </div>
      )}
    </div>
  )
}
