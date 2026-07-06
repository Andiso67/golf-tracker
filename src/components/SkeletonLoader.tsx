export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-ft-border bg-ft-card p-3">
      <div className="mb-2 h-4 w-3/4 rounded bg-ft-label/20" />
      <div className="h-3 w-1/2 rounded bg-ft-label/10" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-ft-border bg-ft-card p-4">
          <div className="mb-2 h-3 w-16 rounded bg-ft-label/20" />
          <div className="h-6 w-10 rounded bg-ft-label/10" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
