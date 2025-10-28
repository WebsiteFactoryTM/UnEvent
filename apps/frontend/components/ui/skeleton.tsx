import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        "relative overflow-hidden",
        "before:absolute before:inset-0",
        "before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-linear-to-r",
        "before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

function SkeletonText({
  className,
  lines = 1,
}: {
  className?: string
  lines?: number
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-4/5" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

function SkeletonCircle({ className }: { className?: string }) {
  return <Skeleton className={cn("rounded-full", className)} />
}

function SkeletonImage({ className }: { className?: string }) {
  return <Skeleton className={cn("w-full aspect-video", className)} />
}

export { Skeleton, SkeletonText, SkeletonCircle, SkeletonImage }

