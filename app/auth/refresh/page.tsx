"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";

export default function RefreshAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const rawNext = searchParams.get("next") || "/jobs";
        const next = rawNext.startsWith("/") ? rawNext : "/jobs";

        const res = await fetch("/api/auth/refresh-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }

        if (!cancelled) {
          router.replace(next);
        }
      } catch {
        const rawNext = searchParams.get("next") || "/jobs";
        const next = rawNext.startsWith("/") ? rawNext : "/jobs";
        router.replace(`/login?next=${encodeURIComponent(next)}`);
      }
    }

    refresh();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-6 py-14">
        <div className="flex items-center gap-3 rounded-[22px] border bg-card px-5 py-4 shadow-sm">
          <Spinner className="size-5" />
          <div className="text-sm text-muted-foreground">
            Refreshing session…
          </div>
        </div>
      </div>
    </div>
  );
}
