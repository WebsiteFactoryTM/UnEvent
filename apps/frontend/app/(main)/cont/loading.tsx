export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Topbar skeleton */}
      <div className="h-14 border-b bg-card/60 backdrop-blur supports-backdrop-filter:bg-card/40">
        <div className="h-full px-4 lg:px-6 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-md bg-muted" />
            <div className="h-4 w-28 rounded bg-muted" />
          </div>
          <div className="hidden md:block h-8 w-80 rounded-md bg-muted" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="h-4 w-16 rounded bg-muted hidden sm:block" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar skeleton (fixed on large screens to mimic layout) */}
        <aside className="hidden lg:block fixed left-0 top-14 bottom-0 w-64 border-r bg-background">
          <div className="p-4 space-y-3 animate-pulse">
            <div className="h-9 w-full rounded-md bg-muted" />
            <div className="h-9 w-full rounded-md bg-muted" />
            <div className="h-px w-full bg-border my-2" />
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="h-8 w-5/6 rounded bg-muted" />
            <div className="h-8 w-2/3 rounded bg-muted" />
            <div className="h-px w-full bg-border my-2" />
            <div className="h-8 w-4/5 rounded bg-muted" />
            <div className="h-8 w-2/3 rounded bg-muted" />
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 p-4 lg:p-6 lg:ml-64">
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
        </main>
      </div>
    </div>
  );
}
