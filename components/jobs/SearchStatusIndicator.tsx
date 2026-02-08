"use client";

import * as React from "react";

import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

export type SearchStatus = "idle" | "searching" | "updated";

function formatRelativeUpdate(lastUpdatedAt: Date | null) {
  if (!lastUpdatedAt) return "";

  const diffMs = Date.now() - lastUpdatedAt.getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return "Updated just now";

  if (diffMs < 60_000) return "Updated just now";
  const mins = Math.floor(diffMs / 60_000);
  if (mins <= 1) return "Updated 1 min ago";
  return `Updated ${mins} mins ago`;
}

export default function SearchStatusIndicator({
  status,
  newJobsCount,
  lastUpdatedAt,
}: {
  status: SearchStatus;
  newJobsCount: number;
  lastUpdatedAt: Date | null;
}) {
  if (status === "idle") return null;

  const baseClassName =
    "w-full rounded-full border bg-primary/5 px-4 py-2 text-xs text-foreground shadow-sm transition-all duration-200 animate-in fade-in";

  if (status === "searching") {
    return (
      <div className={baseClassName} role="status" aria-live="polite">
        <div className="flex items-center gap-2">
          <Spinner className="size-4 text-primary" />
          <span className="text-muted-foreground">Searching new jobs...</span>
        </div>
      </div>
    );
  }

  const relative = formatRelativeUpdate(lastUpdatedAt);

  return (
    <div className={baseClassName} role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {newJobsCount > 0 ? (
            <Badge className="rounded-full bg-linear-to-r from-indigo-600 to-violet-600 text-white">
              {newJobsCount} new jobs found
            </Badge>
          ) : null}
          <span className="text-muted-foreground">{relative || "Updated"}</span>
        </div>
      </div>
    </div>
  );
}
