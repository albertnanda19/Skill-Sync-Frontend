import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getJobSourceFromUrl } from "@/lib/jobSource";

type Props = {
  sourceUrl?: string;
  className?: string;
};

const JobSourceBadge = ({ sourceUrl, className }: Props) => {
  if (!sourceUrl) return null;

  const source = getJobSourceFromUrl(sourceUrl);

  const palette =
    source.kind === "linkedin"
      ? {
          dot: "bg-[#0A66C2]",
          badge:
            "border-sky-300/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
        }
      : source.kind === "glassdoor"
        ? {
            dot: "bg-emerald-600",
            badge:
              "border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
          }
        : source.kind === "glints"
          ? {
              dot: "bg-violet-600",
              badge:
                "border-violet-300/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
            }
          : source.kind === "indeed"
            ? {
                dot: "bg-blue-600",
                badge:
                  "border-blue-300/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
              }
            : source.kind === "jobstreet"
              ? {
                  dot: "bg-indigo-600",
                  badge:
                    "border-indigo-300/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
                }
              : source.kind === "kalibrr"
                ? {
                    dot: "bg-amber-600",
                    badge:
                      "border-amber-300/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                  }
                : source.kind === "google_jobs"
                  ? {
                      dot: "bg-red-600",
                      badge:
                        "border-red-300/40 bg-red-500/10 text-red-700 dark:text-red-300",
                    }
                  : {
                      dot: "bg-muted-foreground",
                      badge:
                        "border-border/50 bg-muted/40 text-muted-foreground",
                    };

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-2 px-2.5 py-1 text-[11px] font-medium shadow-sm",
        palette.badge,
        className,
      )}
      title={
        source.hostname
          ? `Source: ${source.hostname}`
          : `Source: ${source.label}`
      }
    >
      <span className={cn("size-1.5 rounded-full", palette.dot)} aria-hidden />
      <span className="text-current">{source.label}</span>
    </Badge>
  );
};

export default React.memo(JobSourceBadge);
