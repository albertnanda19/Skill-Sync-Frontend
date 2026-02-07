"use client";

import { useQuery } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";

export type JobsFilters = {
  title?: string;
  company_name?: string;
  location?: string;
  skills?: string;
};

export type JobItem = {
  id: string;
  title: string;
  company_name: string;
  location: string;
  source_url?: string;
  description?: string;
  skills: string[];
  matching_score?: number;
  posted_date?: string;
};

export type JobsListResult = {
  items: JobItem[];
  total?: number;
};

export type JobsApiResponse = {
  status: number;
  message: string;
  data: unknown;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeSkills(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeJob(raw: unknown): JobItem | null {
  if (!raw || typeof raw !== "object") return null;

  const r = raw as Record<string, unknown>;

  const id = normalizeText(r.job_id ?? r.id ?? r._id);
  const title = normalizeText(r.title ?? r.job_title);
  const companyName = normalizeText(r.company_name ?? r.company ?? r.companyName);
  const location = normalizeText(r.location);
  const sourceUrl = normalizeText(r.source_url ?? r.sourceUrl ?? r.url);
  const description = normalizeText(r.description);
  const skills = normalizeSkills(r.skills ?? r.required_skills ?? r.requiredSkills);
  const postedDate = normalizeText(r.posted_date ?? r.postedDate);

  const scoreRaw = r.matching_score ?? r.matchingScore ?? r.score;
  const matchingScore =
    typeof scoreRaw === "number" ? scoreRaw : Number.isFinite(Number(scoreRaw)) ? Number(scoreRaw) : undefined;

  if (!id || !title) return null;

  return {
    id,
    title,
    company_name: companyName,
    location,
    ...(sourceUrl ? { source_url: sourceUrl } : {}),
    ...(description ? { description } : {}),
    skills,
    ...(typeof matchingScore === "number" ? { matching_score: matchingScore } : {}),
    ...(postedDate ? { posted_date: postedDate } : {}),
  };
}

function normalizeJobsResponse(payload: unknown): JobsListResult {
  if (!payload || typeof payload !== "object") return { items: [] };

  const root = payload as { data?: unknown };
  const data = typeof root.data !== "undefined" ? root.data : payload;

  if (Array.isArray(data)) {
    const items = data.map(normalizeJob).filter((v): v is JobItem => v !== null);
    return { items };
  }

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;

    const listCandidate =
      Array.isArray(d.items)
        ? d.items
        : Array.isArray(d.jobs)
          ? d.jobs
          : Array.isArray(d.data)
            ? d.data
            : null;

    const items = Array.isArray(listCandidate)
      ? listCandidate.map(normalizeJob).filter((v): v is JobItem => v !== null)
      : [];

    const totalRaw = d.total ?? d.count ?? d.total_count;
    const total =
      typeof totalRaw === "number" ? totalRaw : Number.isFinite(Number(totalRaw)) ? Number(totalRaw) : undefined;

    return { items, ...(typeof total === "number" ? { total } : {}) };
  }

  return { items: [] };
}

function clampLimit(limit: number | undefined) {
  const raw = typeof limit === "number" ? limit : 20;
  if (!Number.isFinite(raw)) return 20;
  const rounded = Math.trunc(raw);
  if (rounded < 1) return 1;
  if (rounded > 50) return 50;
  return rounded;
}

function clampOffset(offset: number | undefined) {
  const raw = typeof offset === "number" ? offset : 0;
  if (!Number.isFinite(raw)) return 0;
  const rounded = Math.trunc(raw);
  if (rounded < 0) return 0;
  return rounded;
}

export function useJobs({
  filters,
  limit,
  offset,
}: {
  filters: JobsFilters;
  limit: number;
  offset: number;
}) {
  const safeLimit = clampLimit(limit);
  const safeOffset = clampOffset(offset);

  return useQuery<JobsListResult, unknown>({
    queryKey: [
      "jobs",
      {
        title: filters.title,
        company_name: filters.company_name,
        location: filters.location,
        skills: filters.skills,
        limit: safeLimit,
        offset: safeOffset,
      },
    ],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        limit: safeLimit,
        offset: safeOffset,
      };

      if (filters.title) params.title = filters.title;
      if (filters.company_name) params.company_name = filters.company_name;
      if (filters.location) params.location = filters.location;
      if (filters.skills) params.skills = filters.skills;

      const { data } = await appApi.get<JobsApiResponse>("/api/jobs", { params });
      return normalizeJobsResponse(data);
    },
    staleTime: 30_000,
  });
}
