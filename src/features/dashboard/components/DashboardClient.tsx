"use client";

import * as React from "react";
import Link from "next/link";

import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DashboardLoadingAI from "@/components/dashboard/DashboardLoadingAI";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { useDashboard } from "../hooks/useDashboard";

function ScoreTag({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "bg-primary/10 text-primary"
      : score >= 65
        ? "bg-secondary/10 text-secondary"
        : "bg-muted text-foreground";
  return (
    <div className={`rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {score}% match
    </div>
  );
}

export default function DashboardClient() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    refetch,
    dataUpdatedAt,
  } = useDashboard();

  const showDelayedLoading = useDelayedLoading(
    (isLoading || isFetching) && !isError && !isSuccess,
    300,
  );

  const showAILoading =
    (isLoading || isFetching) && showDelayedLoading && !isError;

  const lastUpdatedLabel = React.useMemo(() => {
    if (!dataUpdatedAt) return "";
    return "Updated just now";
  }, [dataUpdatedAt]);

  if (showAILoading) {
    return <DashboardLoadingAI onRetry={() => refetch()} />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-10">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                Dashboard
              </div>
              <div className="text-xs text-muted-foreground">
                Your matches, explained
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
          <div className="rounded-[22px] border bg-card p-6 shadow-sm">
            <div className="text-sm font-medium tracking-tight">
              Failed to load dashboard.
            </div>
            <div className="mt-4">
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const shortlist = Array.isArray(data?.shortlist) ? data.shortlist : [];
  const limitedShortlist = shortlist.slice(0, 10);

  const strongestClusterName = data?.snapshot?.strongest_cluster?.name ?? "";
  const strongestClusterDescription =
    data?.snapshot?.strongest_cluster?.description ?? "";
  const mostCommonGapName = data?.snapshot?.most_common_gap?.name ?? "";
  const mostCommonGapDescription =
    data?.snapshot?.most_common_gap?.description ?? "";

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-10">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              Dashboard
            </div>
            <div className="text-xs text-muted-foreground">
              Your matches, explained
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-xs font-medium tracking-wide text-muted-foreground">
                  TODAY'S SHORTLIST
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  Matches you can act on
                </h1>
                {lastUpdatedLabel ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {lastUpdatedLabel}
                  </div>
                ) : null}
              </div>
              <Button variant="ghost" asChild>
                <Link href="/skills-gap">Refine Skills</Link>
              </Button>
            </div>

            {isFetching ? (
              <DashboardLoadingAI variant="inline" onRetry={() => refetch()} />
            ) : null}

            {limitedShortlist.length === 0 ? (
              <div className="rounded-[22px] border bg-card p-6 shadow-sm">
                <div className="text-sm text-muted-foreground">
                  No matches yet. Add more skills to improve recommendations.
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {limitedShortlist.map((job) => (
                  <div
                    key={job.job_id}
                    className="rounded-[22px] border bg-card p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium tracking-tight">
                          {job.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {job.company_name} · {job.location}
                        </div>
                      </div>
                      <ScoreTag score={job.match_score} />
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-muted/40 p-4">
                        <div className="text-xs font-medium text-muted-foreground">
                          Strong signals
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(Array.isArray(job.strong_signals)
                            ? job.strong_signals
                            : []
                          ).map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="rounded-full"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-4">
                        <div className="text-xs font-medium text-muted-foreground">
                          Likely gaps
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(Array.isArray(job.likely_gaps)
                            ? job.likely_gaps
                            : []
                          ).map((g) => (
                            <Badge
                              key={g}
                              className="rounded-full"
                              variant="outline"
                            >
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <Button variant="link" asChild className="px-0">
                        <a href={job.job_url} target="_blank" rel="noreferrer">
                          View Details
                          <ArrowRight className="size-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link href="/skills-gap">Improve match</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="relative">
            <div className="sticky top-8 rounded-[28px] border bg-card p-6 shadow-sm">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg tracking-tight">
                        Your match snapshot
                      </CardTitle>
                      <CardDescription className="text-sm leading-6">
                        A quick read on why you’re scoring the way you are.
                      </CardDescription>
                    </div>
                    <Badge className="rounded-full" variant="secondary">
                      baseline
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-5 px-0">
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                      Strongest cluster
                    </div>
                    <div className="mt-2 text-sm font-medium">
                      {strongestClusterName}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {strongestClusterDescription}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                      Most common gap
                    </div>
                    <div className="mt-2 text-sm font-medium">
                      {mostCommonGapName}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {mostCommonGapDescription}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3">
                    <Button asChild>
                      <Link href="/users/skills">
                        Refine Skills
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/users/skills">Manage Skills</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
