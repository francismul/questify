export function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="p-6">
        {/* Insights Banner Skeleton */}
        <div className="bg-accent/50 px-6 py-4 rounded-lg mb-6 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-accent-foreground/20 rounded" />
            <div className="h-6 w-32 bg-accent-foreground/20 rounded" />
          </div>
          <div className="h-4 w-24 bg-accent-foreground/20 rounded" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-card rounded-lg p-4 shadow-sm animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="w-8 h-8 bg-muted rounded-full" />
              </div>
              <div className="h-8 w-12 bg-muted rounded mb-1" />
              <div className="h-3 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Recent Courses */}
          <div className="bg-card rounded-lg p-6 shadow-sm animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="h-4 w-40 bg-muted rounded mb-2" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                  <div className="h-6 w-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Upcoming Assignments */}
          <div className="bg-card rounded-lg p-6 shadow-sm animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="h-4 w-36 bg-muted rounded mb-1" />
                    <div className="h-3 w-28 bg-muted rounded" />
                  </div>
                  <div className="h-6 w-12 bg-muted rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievement Highlights Skeleton */}
        <div className="bg-card rounded-lg p-6 shadow-sm mt-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted rounded" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-muted rounded-full mb-2" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
