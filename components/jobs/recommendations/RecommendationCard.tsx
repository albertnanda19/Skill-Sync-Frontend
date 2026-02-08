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
  const rounded = Math.round(score);

  const tier =
    rounded >= 85
      ? "strong"
      : rounded >= 70
        ? "good"
        : rounded >= 50
          ? "moderate"
          : "low";

  const className =
    tier === "strong"
      ? "bg-linear-to-r from-indigo-600/15 to-violet-600/15 text-foreground border-indigo-600/25"
      : tier === "good"
        ? "bg-sky-500/10 text-foreground border-sky-500/20"
        : tier === "moderate"
          ? "bg-muted/70 text-foreground border-border"
          : "bg-muted text-muted-foreground border-border";

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-4 py-1.5 text-sm font-semibold tracking-tight ${className}`}
    >
      {rounded}% Match
    </Badge>
  );
}

function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const rounded = Math.round(clamped);

  const tier =
    rounded >= 85
      ? "strong"
      : rounded >= 70
        ? "good"
        : rounded >= 50
          ? "moderate"
          : "low";

  const barClassName =
    tier === "strong"
      ? "bg-linear-to-r from-indigo-600 to-violet-600"
      : tier === "good"
        ? "bg-linear-to-r from-sky-500 to-indigo-500"
        : tier === "moderate"
          ? "bg-linear-to-r from-slate-400 to-slate-500"
          : "bg-linear-to-r from-slate-300 to-slate-400";

  return (
    <div className="mt-3">
      <div className="h-2 w-full rounded-full bg-muted/70">
        <div
          className={`h-2 rounded-full transition-[width] duration-300 ${barClassName}`}
          style={{ width: `${rounded}%` }}
        />
      </div>
    </div>
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

      <ScoreBar score={recommendation.matchScore} />

      {missing.length ? (
        <div className="mt-4 space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Missing skills:
          </div>
          <div className="flex flex-wrap gap-2">
            {missing.map((skill) => (
              <span
                key={skill}
                className="rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}

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
