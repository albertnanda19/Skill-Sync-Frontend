"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";

export default function NewJobsBanner({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <div
      className="w-full rounded-full border bg-primary/5 px-4 py-2 text-xs text-foreground shadow-sm transition-all duration-200 animate-in fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <Badge className="rounded-full bg-linear-to-r from-indigo-600 to-violet-600 text-white">
          {count} new jobs added
        </Badge>
        <span className="text-muted-foreground">Updated just now</span>
      </div>
    </div>
  );
}
