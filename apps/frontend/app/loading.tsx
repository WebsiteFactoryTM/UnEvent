import { CarouselSkeleton } from "@/components/home/carousels/CarouselSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="min-h-screen">
      {/* Hero skeleton */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Skeleton className="h-16 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
            <div className="flex justify-center gap-4 pt-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Inline skeleton */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <Skeleton className="h-24 w-full max-w-5xl mx-auto" />
        </div>
      </section>

      {/* Carousel skeletons */}
      <CarouselSkeleton count={3} showAvatar={false} />
      <CarouselSkeleton count={3} showAvatar={true} />
      <CarouselSkeleton count={3} showAvatar={false} />
      <CarouselSkeleton count={3} showAvatar={false} />

      {/* CTA Earn skeleton */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <Skeleton className="h-12 w-2/3 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-12 w-40 mx-auto mt-6" />
          </div>
        </div>
      </section>
    </main>
  )
}




