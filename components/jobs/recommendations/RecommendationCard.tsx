"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type JobRecommendation = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  missingSkills: string[];
  jobUrl: string;
};

function MatchBadge({ score }: { score: number }) {
  const className =
    score >= 80
      ? "bg-linear-to-r from-emerald-500/15 to-sky-500/15 text-foreground border-emerald-500/25"
      : "bg-muted text-foreground border-border";

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}
    >
      {Math.round(score)}% Match
    </Badge>
  );
}

export default function RecommendationCard({
  recommendation,
}: {
  recommendation: JobRecommendation;
}) {
  const missing = recommendation.missingSkills.filter(Boolean);

  return (
    <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="truncate text-sm font-semibold tracking-tight">
            {recommendation.title}
          </div>
          <div className="text-xs text-muted-foreground">
            {recommendation.company} · {recommendation.location}
          </div>
        </div>

        <MatchBadge score={recommendation.matchScore} />
      </div>

      {missing.length ? (
        <div className="mt-4 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Missing: <span className="text-foreground">{missing.join(", ")}</span>
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Missing: <span className="text-foreground">None</span>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">Open in new tab</div>
        <Button asChild size="sm" className="transition-all duration-200">
          <Link href={recommendation.jobUrl} target="_blank" rel="noreferrer">
            View Job
            <ExternalLink className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
