import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-8">
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

          <div className="space-y-8">
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-3 gap-6">
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
