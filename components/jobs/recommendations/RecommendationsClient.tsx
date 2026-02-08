"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import RecommendationCard, {
  type JobRecommendation,
} from "@/components/jobs/recommendations/RecommendationCard";
import RecommendationsEmptyState from "@/components/jobs/recommendations/RecommendationsEmptyState";
import RecommendationsSkeleton from "@/components/jobs/recommendations/RecommendationsSkeleton";
import JobsSectionNav from "@/components/jobs/JobsSectionNav";
import { Badge } from "@/components/ui/badge";

type ViewState = "loading" | "data" | "empty";

const mockRecommendations: JobRecommendation[] = [
  {
    id: "1",
    title: "Backend Developer",
    company: "Tech Corp",
    location: "Jakarta",
    matchScore: 87,
    missingSkills: ["Docker", "Kubernetes"],
    jobUrl: "#",
  },
  {
    id: "2",
    title: "Fullstack Engineer",
    company: "Nimbus Labs",
    location: "Remote (SEA)",
    matchScore: 78,
    missingSkills: ["PostgreSQL"],
    jobUrl: "#",
  },
  {
    id: "3",
    title: "Platform Engineer",
    company: "Arc Systems",
    location: "Jakarta (Hybrid)",
    matchScore: 83,
    missingSkills: [],
    jobUrl: "#",
  },
];

export default function RecommendationsClient() {
  const [state, setState] = React.useState<ViewState>("loading");
  const [items, setItems] = React.useState<JobRecommendation[]>([]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(mockRecommendations);
      setState("data");
    }, 1000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  Personalized Matching
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Based on your skills and experience
                </div>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Recommended Jobs for You
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="h-1 w-28 rounded-full bg-linear-to-r from-indigo-600/70 to-violet-600/70" />
          </div>
        </div>

        <div className="rounded-[24px] border bg-card p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-1">
              <div className="text-sm font-medium tracking-tight">
                Your recommendations will get sharper over time.
              </div>
              <div className="text-sm leading-6 text-muted-foreground">
                Soon this page will be powered by skill matching, role preference,
                and real-time job signals. For now, you’re seeing mock data.
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <div className="text-xs font-medium tracking-wide text-muted-foreground">
                VIEW
              </div>
              <JobsSectionNav
                items={[
                  { label: "Browse", href: "/jobs" },
                  { label: "Recommendations", href: "/jobs/recommendations" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Curated for you — adjust skills to improve match quality.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
              onClick={() => {
                setState("loading");
                window.setTimeout(() => {
                  setItems(mockRecommendations);
                  setState("data");
                }, 700);
              }}
            >
              Loading
            </button>
            <button
              type="button"
              className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
              onClick={() => {
                setState("loading");
                window.setTimeout(() => {
                  setItems([]);
                  setState("empty");
                }, 700);
              }}
            >
              Empty
            </button>
            <button
              type="button"
              className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
              onClick={() => {
                setState("loading");
                window.setTimeout(() => {
                  setItems(mockRecommendations);
                  setState("data");
                }, 700);
              }}
            >
              Data
            </button>
          </div>
        </div>
      </div>

      {state === "loading" ? (
        <RecommendationsSkeleton />
      ) : state === "empty" ? (
        <RecommendationsEmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
