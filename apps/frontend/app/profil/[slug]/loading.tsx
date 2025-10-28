import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero skeleton */}
          <Card className="glass-card">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <SkeletonCircle className="h-32 w-32" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-5 w-40" />
                  <div className="flex gap-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-xl" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-6 text-center space-y-2">
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content - Listings */}
            <div className="lg:col-span-2">
              <Card className="glass-card">
                <CardContent className="p-6 space-y-6">
                  {/* Tabs skeleton */}
                  <div className="flex gap-4 border-b pb-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>

                  {/* Listings grid skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-40 w-full" />
                        <div className="p-4 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact card skeleton */}
              <Card className="glass-card">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Stats card skeleton */}
              <Card className="glass-card">
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews skeleton */}
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
  )
}




