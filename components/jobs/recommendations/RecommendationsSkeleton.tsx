import { Skeleton } from "@/components/ui/skeleton";

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

export default function RecommendationsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
