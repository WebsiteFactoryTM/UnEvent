import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface CarouselSkeletonProps {
  count?: number
  showAvatar?: boolean
}

export function CarouselSkeleton({ count = 3, showAvatar = false }: CarouselSkeletonProps) {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>

        {/* Carousel items skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: count }).map((_, index) => (
            <Card key={index} className="glass-card overflow-hidden h-full flex flex-col">
              {!showAvatar ? (
                // Location/Event card skeleton
                <>
                  <CardHeader className="p-0 relative">
                    <Skeleton className="h-48 w-full rounded-none" />
                  </CardHeader>

                  <CardContent className="flex-1 p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </>
              ) : (
                // Service card skeleton (with avatar)
                <>
                  <CardHeader className="space-y-4 p-6">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>

                    <div className="space-y-2">
                      <Skeleton className="h-6 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3 px-6">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-4 w-24" />
                    </div>

                    <Skeleton className="h-4 w-20" />
                  </CardContent>

                  <CardFooter className="p-6">
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}




