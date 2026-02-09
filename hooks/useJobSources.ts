"use client";

import { useQuery } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";

export type JobSourceItem = {
  id: string;
  name: string;
  base_url?: string;
};

export type JobSourceOption = {
  key: string;
  name: string;
  ids: string[];
  base_url?: string;
};

type JobSourcesApiResponse = {
  status: number;
  message: string;
  data: unknown;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeJobSource(raw: unknown): JobSourceItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const id = normalizeText(r.id ?? r.source_id ?? r.sourceId);
  const name = normalizeText(r.name ?? r.source_name ?? r.sourceName);
  const baseUrl = normalizeText(r.base_url ?? r.baseUrl ?? r.url);

  if (!UUID_RE.test(id) || !name) return null;

  return {
    id,
    name,
    ...(baseUrl ? { base_url: baseUrl } : {}),
  };
}

function normalizeJobSourcesResponse(payload: unknown): JobSourceItem[] {
  if (!payload || typeof payload !== "object") return [];

  const root = payload as { data?: unknown };
  const data = typeof root.data !== "undefined" ? root.data : payload;

  if (Array.isArray(data)) {
    return data.map(normalizeJobSource).filter((v): v is JobSourceItem => v !== null);
  }

  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const listCandidate = Array.isArray(d.data)
      ? d.data
      : Array.isArray(d.items)
        ? d.items
        : Array.isArray(d.sources)
          ? d.sources
          : null;

    if (Array.isArray(listCandidate)) {
      return listCandidate
        .map(normalizeJobSource)
        .filter((v): v is JobSourceItem => v !== null);
    }
  }

  return [];
}

function normalizeKey(name: string) {
  return name.trim().toLowerCase();
}

function pickDisplayName(names: string[]) {
  const clean = names.map((n) => n.trim()).filter(Boolean);
  if (clean.length === 0) return "";

  const withUpper = clean.find((n) => /[A-Z]/.test(n));
  if (withUpper) return withUpper;

  const first = clean[0];
  return first
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function groupJobSources(items: JobSourceItem[]): JobSourceOption[] {
  const map = new Map<
    string,
    { names: string[]; ids: string[]; base_url?: string }
  >();

  for (const item of items) {
    const key = normalizeKey(item.name);
    if (!key) continue;

    const existing = map.get(key);
    if (existing) {
      existing.names.push(item.name);
      if (!existing.ids.includes(item.id)) existing.ids.push(item.id);
      if (!existing.base_url && item.base_url) existing.base_url = item.base_url;
      continue;
    }

    map.set(key, {
      names: [item.name],
      ids: [item.id],
      ...(item.base_url ? { base_url: item.base_url } : {}),
    });
  }

  return Array.from(map.entries())
    .map(([key, value]) => ({
      key,
      name: pickDisplayName(value.names) || key,
      ids: value.ids,
      ...(value.base_url ? { base_url: value.base_url } : {}),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchJobSources(): Promise<JobSourceOption[]> {
  const { data } = await appApi.get<JobSourcesApiResponse>("/api/job-sources");
  const items = normalizeJobSourcesResponse(data);
  return groupJobSources(items);
}

export function useJobSources() {
  return useQuery<JobSourceOption[], unknown>({
    queryKey: ["job-sources"],
    queryFn: fetchJobSources,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}
