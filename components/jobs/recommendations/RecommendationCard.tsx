"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  ExternalLink,
  MapPin,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type JobRecommendation = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchReason: string[];
  mandatoryMissing: boolean;
  missingSkills: string[];
  jobUrl: string;
  source: string;
};

const SourceBadge = ({ source }: { source: string }) => {
  const normalized = source.trim().toLowerCase();
  const label = source.trim() || "unknown";

  const className =
    normalized === "linkedin"
      ? "border-sky-500/25 bg-sky-500/10 text-foreground"
      : normalized === "glassdoor"
        ? "border-emerald-500/25 bg-emerald-500/10 text-foreground"
        : "border-border bg-muted/60 text-muted-foreground";

  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-tight ${className}`}
    >
      {label}
    </Badge>
  );
};

const MandatoryMissingBadge = ({
  mandatoryMissing,
}: {
  mandatoryMissing: boolean;
}) => {
  if (!mandatoryMissing) return null;

  return (
    <Badge
      variant="outline"
      className="rounded-full border-rose-500/25 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold tracking-tight text-foreground"
    >
      <ShieldAlert className="size-3.5" />
      Mandatory missing
    </Badge>
  );
};

const TagPills = ({
  items,
  emptyLabel,
  tone,
}: {
  items: string[];
  emptyLabel: string;
  tone: "neutral" | "warning";
}) => {
  const normalized = items.map((s) => s.trim()).filter(Boolean);

  if (normalized.length === 0) {
    return <div className="text-xs text-muted-foreground">{emptyLabel}</div>;
  }

  const className =
    tone === "warning"
      ? "border-amber-500/25 bg-amber-500/10 text-foreground"
      : "border-border bg-background text-muted-foreground";

  return (
    <div className="flex flex-wrap gap-2">
      {normalized.map((v, idx) => (
        <span
          key={`${v}-${idx}`}
          className={`rounded-full border px-2 py-0.5 text-xs ${className}`}
        >
          {v}
        </span>
      ))}
    </div>
  );
};

const MatchReasonList = ({ reasons }: { reasons: string[] }) => {
  const normalized = reasons.map((s) => s.trim()).filter(Boolean);
  if (normalized.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5" />
        Why this matches you
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
        {normalized.slice(0, 6).map((reason, idx) => (
          <li key={`${reason}-${idx}`}>{reason}</li>
        ))}
      </ul>
    </div>
  );
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

const RecommendationCard = ({
  recommendation,
}: {
  recommendation: JobRecommendation;
}) => {
  const title = recommendation.title.trim() || "Untitled role";
  const company = recommendation.company.trim() || "Unknown company";
  const location = recommendation.location.trim() || "Remote / Unspecified";
  const jobUrl = recommendation.jobUrl.trim();
  const hasMissingSkills = recommendation.missingSkills.some((s) => s.trim());

  return (
    <div className="group rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 truncate text-sm font-semibold tracking-tight">
              {title}
            </div>
            <SourceBadge source={recommendation.source} />
            <MandatoryMissingBadge
              mandatoryMissing={recommendation.mandatoryMissing}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1.5">
              <Building2 className="size-3.5" />
              <span className="truncate">{company}</span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        <MatchBadge score={recommendation.matchScore} />
      </div>

      <ScoreBar score={recommendation.matchScore} />

      <MatchReasonList reasons={recommendation.matchReason} />

      {hasMissingSkills ? (
        <div className="mt-4 grid gap-4">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Missing skills
            </div>
            <TagPills
              items={recommendation.missingSkills}
              emptyLabel=""
              tone={recommendation.mandatoryMissing ? "warning" : "neutral"}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {jobUrl ? "Open in new tab" : "No job URL provided"}
        </div>
        <Button
          asChild
          size="sm"
          className="transition-all duration-200"
          disabled={!jobUrl}
        >
          <Link
            href={jobUrl || "#"}
            target={jobUrl ? "_blank" : undefined}
            rel={jobUrl ? "noreferrer" : undefined}
            onClick={(e) => {
              if (!jobUrl) e.preventDefault();
            }}
          >
            View Job
            <ExternalLink className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default React.memo(RecommendationCard);
