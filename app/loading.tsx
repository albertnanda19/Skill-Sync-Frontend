import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* WIREFRAME: Loading state */}
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96" />
            <div className="grid gap-4 pt-6">
              <Skeleton className="h-40 rounded-[22px]" />
              <Skeleton className="h-40 rounded-[22px]" />
              <Skeleton className="h-40 rounded-[22px]" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-56 rounded-[28px]" />
            <Skeleton className="h-40 rounded-[28px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
