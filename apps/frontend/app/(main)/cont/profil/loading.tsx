export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Topbar skeleton */}

      {/* Main content skeleton */}
      <div className="flex-1 p-4 lg:p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between animate-pulse">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-9 w-32 rounded-md bg-muted" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
            <div className="h-32 rounded-lg border bg-card" />
            <div className="h-32 rounded-lg border bg-card" />
            <div className="h-32 rounded-lg border bg-card" />
            <div className="h-32 rounded-lg border bg-card" />
            <div className="h-32 rounded-lg border bg-card" />
            <div className="h-32 rounded-lg border bg-card" />
          </div>

          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-24 rounded-lg border bg-card" />
            <div className="h-24 rounded-lg border bg-card" />
          </div>
        </div>
      </div>
    </div>
  );
}
