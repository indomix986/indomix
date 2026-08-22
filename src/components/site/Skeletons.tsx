export function CategoryCardSkeleton() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft animate-pulse">
      <div className="relative aspect-square w-full overflow-hidden bg-surface">
        <div className="size-full bg-muted/40" />
        <span className="absolute end-2 top-2 h-4 w-12 rounded-full bg-background/75 backdrop-blur" />
      </div>
      <p className="flex h-10 w-full items-center justify-center px-3 py-2.5 text-center text-sm font-bold">
        <span className="h-4 w-16 rounded-md bg-muted/50" />
      </p>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft animate-pulse">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        <div className="size-full bg-muted/40" />
        <div className="absolute start-2 top-2 h-4 w-12 rounded-full bg-background/60" />
        <div className="absolute end-2 top-2 size-8 rounded-full bg-background/60" />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="h-4 w-3/4 rounded-md bg-muted/50 sm:h-5" />
        <div className="mt-1 min-h-8 space-y-1.5 sm:min-h-10">
          <div className="h-3 w-full rounded bg-muted/30" />
          <div className="h-3 w-2/3 rounded bg-muted/30" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
          <div className="h-5 w-14 rounded bg-muted/50" />
          <div className="h-7 w-14 rounded-xl bg-muted/50" />
        </div>
      </div>
    </div>
  );
}

export function OfferCardSkeleton() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-chili/40 bg-card shadow-soft animate-pulse ring-1 ring-chili/25">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        <div className="size-full bg-muted/40" />
        <div className="absolute start-2 top-2 h-4 w-12 rounded-full bg-chili/30" />
        <div className="absolute end-2 top-2 h-4 w-14 rounded-full bg-background/60" />
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="h-4 w-3/4 rounded-md bg-muted/50 sm:h-5" />
        <div className="mt-1 min-h-8 space-y-1.5 sm:min-h-10">
          <div className="h-3 w-full rounded bg-muted/30" />
          <div className="h-3 w-1/2 rounded bg-muted/30" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
          <div className="h-5 w-16 rounded bg-muted/50" />
          <div className="h-7 w-14 rounded-xl bg-muted/50" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
      <div className="grid gap-8 md:grid-cols-2 items-start">
        {/* Image skeleton */}
        <div className="aspect-[4/3] rounded-3xl bg-surface border border-border shadow-soft" />

        {/* Info skeleton */}
        <div className="space-y-6">
          <div>
            <div className="h-4 w-24 rounded bg-surface" />
            <div className="mt-3 h-8 w-3/4 rounded-xl bg-surface" />
            <div className="mt-2 h-4 w-full rounded bg-surface/70" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-7 w-20 rounded-lg bg-surface" />
            <div className="h-5 w-16 rounded bg-surface/60" />
          </div>

          {/* Spiciness skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-surface" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 rounded-xl bg-surface" />
              ))}
            </div>
          </div>

          {/* Extras skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-surface" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-11 rounded-2xl bg-surface" />
              ))}
            </div>
          </div>

          {/* Action button skeleton */}
          <div className="h-12 w-full rounded-2xl bg-surface" />
        </div>
      </div>
    </div>
  );
}
