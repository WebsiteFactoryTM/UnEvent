import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs skeleton */}
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Hero section skeleton */}
          <div className="space-y-4 mb-8">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-36" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Media skeleton */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <Skeleton className="h-96 w-full rounded-lg" />
                  <div className="grid grid-cols-8 gap-2 mt-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Description skeleton */}
              <Card className="glass-card">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-7 w-48" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>

              {/* Facilities skeleton */}
              <Card className="glass-card">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-7 w-40" />
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map skeleton */}
              <Card className="glass-card">
                <CardContent className="p-6">
                  <Skeleton className="h-96 w-full rounded-lg" />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Host card skeleton */}
              <Card className="glass-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <SkeletonCircle className="h-16 w-16" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>

              {/* Info card skeleton */}
              <Card className="glass-card">
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews skeleton */}
          <div className="mt-12">
            <Card className="glass-card">
              <CardContent className="p-6 space-y-6">
                <Skeleton className="h-8 w-48" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4 pb-6 border-b border-border last:border-0">
                    <SkeletonCircle className="h-12 w-12" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}




