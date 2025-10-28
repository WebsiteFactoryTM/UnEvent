import { ListingCardSkeleton } from "@/components/archives/ListingCardSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-4 flex-1">
              <Skeleton className="h-12 w-96 max-w-full" />
              <Skeleton className="h-6 w-full max-w-2xl" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Filter skeleton */}
          <div className="glass-card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Listings grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}




