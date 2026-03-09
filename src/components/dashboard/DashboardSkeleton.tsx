export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2.5">
          <div className="skeleton h-2.5 w-28 rounded" />
          <div className="skeleton h-8 w-60 rounded-xl" />
          <div className="skeleton h-3.5 w-48 rounded" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="skeleton h-2.5 w-24 rounded" />
              <div className="skeleton h-9 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="skeleton h-5 w-5 rounded-lg" />
          <div className="skeleton h-5 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="skeleton h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
                <div className="skeleton h-8 w-8 rounded-xl shrink-0" />
              </div>
              <div className="skeleton h-5 w-20 rounded-full" />
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
              <div className="skeleton h-px w-full" />
              <div className="flex justify-between">
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjectsPageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2.5">
          <div className="skeleton h-2.5 w-24 rounded" />
          <div className="skeleton h-7 w-32 rounded-xl" />
          <div className="skeleton h-3 w-28 rounded" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>

      {/* Search + filters */}
      <div className="flex gap-2.5 flex-col sm:flex-row">
        <div className="skeleton h-11 flex-1 rounded-xl" />
        <div className="skeleton h-11 w-56 rounded-xl" />
        <div className="skeleton h-11 w-28 rounded-xl" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="skeleton h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 pt-0.5">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
              <div className="skeleton h-8 w-8 rounded-xl shrink-0" />
            </div>
            <div className="skeleton h-5 w-20 rounded-full" />
            <div className="grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
            <div className="skeleton h-px w-full" />
            <div className="flex justify-between">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
