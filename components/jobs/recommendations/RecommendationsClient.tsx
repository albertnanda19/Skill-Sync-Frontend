"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

import RecommendationCard, {
  type JobRecommendation,
} from "./RecommendationCard";
import RecommendationsEmptyState from "./RecommendationsEmptyState";
import AIAnalysisLoading from "./AIAnalysisLoading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appApi } from "@/lib/axios";

type BackendRecommendation = {
  job_id: string;
  title?: string;
  company_name?: string;
  location?: string;
  job_url?: string;
  source?: string;
  match_score?: number;
  match_reason?: string[];
  mandatory_missing?: boolean;
  missing_skills?: string[];
};

type BackendRecommendationsPayload =
  | BackendRecommendation[]
  | {
      generated_at?: string;
      recommendation_source?: string;
      jobs?: BackendRecommendation[];
    };

type BackendResponse<T> = {
  status: number;
  message: string;
  data: T;
};

type NormalizedRecommendations = {
  generatedAt?: string;
  recommendationSource?: string;
  jobs: BackendRecommendation[];
};

function normalizeRecommendationsPayload(
  payload: BackendRecommendationsPayload | undefined,
): NormalizedRecommendations {
  if (Array.isArray(payload)) {
    return { jobs: payload };
  }

  if (payload && typeof payload === "object") {
    const p = payload as {
      generated_at?: unknown;
      recommendation_source?: unknown;
      jobs?: unknown;
    };

    const jobs = Array.isArray(p.jobs)
      ? (p.jobs as BackendRecommendation[])
      : [];
    return {
      generatedAt:
        typeof p.generated_at === "string" ? p.generated_at : undefined,
      recommendationSource:
        typeof p.recommendation_source === "string"
          ? p.recommendation_source
          : undefined,
      jobs,
    };
  }

  return { jobs: [] };
}

async function fetchRecommendations(): Promise<NormalizedRecommendations> {
  const { data } = await appApi.get<
    BackendResponse<BackendRecommendationsPayload>
  >("/api/jobs/recommendations");
  return normalizeRecommendationsPayload(data?.data);
}

export default function RecommendationsClient() {
  const router = useRouter();

  const query = useQuery({
    queryKey: ["job-recommendations"],
    queryFn: fetchRecommendations,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const recommendations = React.useMemo<JobRecommendation[]>(() => {
    const data = query.data?.jobs ?? [];

    const mapped = data.map((item) => ({
      id: item.job_id,
      title: item.title ?? "",
      company: item.company_name ?? "",
      location: item.location ?? "",
      matchScore: typeof item.match_score === "number" ? item.match_score : 0,
      missingSkills: Array.isArray(item.missing_skills)
        ? item.missing_skills
        : [],
      jobUrl: item.job_url ?? "",
    }));

    return mapped.sort((a, b) => b.matchScore - a.matchScore);
  }, [query.data]);

  const meta = query.data;

  React.useEffect(() => {
    const status =
      (typeof query.error === "object" &&
        query.error &&
        "response" in query.error &&
        (query.error as { response?: { status?: number } }).response?.status) ||
      null;

    if (status === 401) {
      router.replace("/auth/refresh?next=/jobs/recommendations");
    }
  }, [query.error, router]);

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
                Your recommendations update as your skills evolve.
              </div>
              <div className="text-sm leading-6 text-muted-foreground">
                We rank jobs by how closely they match your current skill
                profile, so keeping your skills up to date improves the quality
                of results.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Recommendations ranked by your skill match
            {recommendations.length ? (
              <span className="ml-2">
                · Showing {recommendations.length} personalized jobs
              </span>
            ) : null}
            {meta?.recommendationSource ? (
              <span className="ml-2 hidden sm:inline">
                · Source: {meta.recommendationSource}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {query.isLoading ? (
        <AIAnalysisLoading />
      ) : query.isError ? (
        <div className="rounded-[28px] border bg-card px-6 py-12 shadow-sm">
          <div className="space-y-4">
            <div className="text-sm font-medium">
              Failed to load recommendations
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => query.refetch()}>Retry</Button>
            </div>
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <RecommendationsEmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
