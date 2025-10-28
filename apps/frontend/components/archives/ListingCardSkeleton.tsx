import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton, SkeletonText } from "@/components/ui/skeleton"

export function ListingCardSkeleton() {
  return (
    <Card className="glass-card overflow-hidden h-full flex flex-col">
      <CardHeader className="p-0 relative">
        {/* Image skeleton */}
        <Skeleton className="h-48 w-full rounded-none" />
      </CardHeader>

      <CardContent className="flex-1 p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Description skeleton - 3 lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Metadata row skeleton */}
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {/* Button skeleton */}
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}




