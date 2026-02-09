"use client";

import * as React from "react";
import { RotateCcw, Search, SlidersHorizontal, RefreshCw } from "lucide-react";

import { jobsQueryKey, useJobs, type JobsFilters } from "@/hooks/useJobs";
import { useJobsWebSocket } from "@/hooks/useJobsWebSocket";
import { useQueryClient } from "@tanstack/react-query";
import { useJobSources } from "@/hooks/useJobSources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchStatusIndicator, {
  type SearchStatus,
} from "@/components/jobs/SearchStatusIndicator";
import NewJobsBanner from "@/components/jobs/NewJobsBanner";
import JobSourceBadge from "@/components/jobs/JobSourceBadge";

function ScoreBadge({ score }: { score: number }) {
  const className =
    score >= 80
      ? "bg-primary/10 text-primary"
      : score >= 65
        ? "bg-secondary/10 text-secondary"
        : "bg-muted text-foreground";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {Math.round(score)}%
    </span>
  );
}

function toCommaSeparatedSkills(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(",");
}

function formatPostedDate(value: string | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function parseDescription(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { kind: "text" as const, text: "" };

  if (!trimmed.startsWith("* ")) {
    return { kind: "text" as const, text: trimmed };
  }

  const items = trimmed
    .split(/\s*\*\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/[,;\s]+$/g, ""))
    .filter(Boolean);

  if (items.length <= 1) {
    return { kind: "text" as const, text: trimmed };
  }

  return { kind: "list" as const, items };
}

function stripInlineFormatting(value: string) {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function renderDescription(value: string, keyPrefix: string) {
  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/\s*-{6,}\s*/g, "\n\n---\n\n")
    .replace(/\s*###\s*/g, "\n\n### ")
    .replace(/\n{3,}/g, "\n\n");

  const blocks = normalized
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, idx) => {
    if (block === "---") {
      return <hr key={`${keyPrefix}-hr-${idx}`} className="my-3" />;
    }

    if (block.startsWith("### ")) {
      const heading = block
        .replace(/^###\s+/, "")
        .replace(/\s*#{3,}\s*$/g, "")
        .trim();

      return (
        <p key={`${keyPrefix}-h-${idx}`} className={idx === 0 ? "" : "mt-3"}>
          {stripInlineFormatting(heading)}
        </p>
      );
    }

    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const bulletItems = lines
      .map((l) => l.match(/^[-*•]\s+(.*)$/)?.[1])
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0);

    if (bulletItems.length === lines.length && bulletItems.length > 0) {
      return (
        <ul
          key={`${keyPrefix}-ul-${idx}`}
          className={
            idx === 0
              ? "list-disc space-y-1 pl-5"
              : "mt-2 list-disc space-y-1 pl-5"
          }
        >
          {bulletItems.map((item, i) => (
            <li key={`${keyPrefix}-ul-${idx}-${i}`}>
              {stripInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
    }

    const numberedItems = lines
      .map((l) => l.match(/^\d{1,3}[.)]\s+(.*)$/)?.[1])
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0);

    if (numberedItems.length === lines.length && numberedItems.length > 0) {
      return (
        <ol
          key={`${keyPrefix}-ol-${idx}`}
          className={
            idx === 0
              ? "list-decimal space-y-1 pl-5"
              : "mt-2 list-decimal space-y-1 pl-5"
          }
        >
          {numberedItems.map((item, i) => (
            <li key={`${keyPrefix}-ol-${idx}-${i}`}>
              {stripInlineFormatting(item)}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p key={`${keyPrefix}-p-${idx}`} className={idx === 0 ? "" : "mt-2"}>
        {lines.map((line, lineIdx) => (
          <React.Fragment key={`${keyPrefix}-l-${idx}-${lineIdx}`}>
            {lineIdx > 0 ? <br /> : null}
            {stripInlineFormatting(line)}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

export default function JobsClient({
  initialFilters,
  initialOffset = 0,
}: {
  initialFilters?: JobsFilters;
  initialOffset?: number;
}) {
  const queryClient = useQueryClient();
  const { data: jobSources, isPending: isSourcesPending } = useJobSources();
  const sources = jobSources ?? [];

  const [filters, setFilters] = React.useState<JobsFilters>(
    () => initialFilters ?? {},
  );
  const [hasApplied, setHasApplied] = React.useState(false);
  const [applyCount, setApplyCount] = React.useState(0);
  const [appliedKeyword, setAppliedKeyword] = React.useState("");
  const [searchStatus, setSearchStatus] = React.useState<SearchStatus>("idle");
  const [newJobsCount, setNewJobsCount] = React.useState<number>(0);
  const [lastUpdatedAt, setLastUpdatedAt] = React.useState<Date | null>(null);
  const [latestCreatedAt, setLatestCreatedAt] = React.useState<string | null>(
    null,
  );
  const [bannerCount, setBannerCount] = React.useState(0);
  const [recentJobIds, setRecentJobIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [draft, setDraft] = React.useState<{
    title: string;
    company_name: string;
    location: string;
    skills: string;
    source_key: string;
  }>(() => ({
    title: initialFilters?.title ?? "",
    company_name: initialFilters?.company_name ?? "",
    location: initialFilters?.location ?? "",
    skills: initialFilters?.skills ?? "",
    source_key: "",
  }));

  React.useEffect(() => {
    const initial = (initialFilters?.source_id ?? "").trim();
    if (!initial) return;
    if (sources.length === 0) return;

    const requested = initial
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (requested.length === 0) return;

    const match = sources.find((opt) =>
      requested.every((id) => opt.ids.includes(id)),
    );
    if (!match) return;

    setDraft((d) => (d.source_key ? d : { ...d, source_key: match.key }));
  }, [initialFilters?.source_id, sources]);

  const limit = 20;
  const [offset, setOffset] = React.useState(() => initialOffset);

  const wsKeyword = React.useMemo(() => {
    const normalized = appliedKeyword.trim();
    return normalized.length >= 2 ? normalized : "";
  }, [appliedKeyword]);

  const {
    status: wsStatus,
    isRefreshing,
    hasError: wsHasError,
    lastEvent,
  } = useJobsWebSocket(wsKeyword, applyCount);

  const wsIsLive =
    Boolean(wsKeyword) &&
    !wsHasError &&
    (wsStatus === "connected" ||
      wsStatus === "connecting" ||
      wsStatus === "reconnecting");

  const { data, isPending, isFetching, isError, error, refetch } = useJobs({
    filters,
    limit,
    offset,
  });

  const currentJobsQueryKey = React.useMemo(
    () => jobsQueryKey({ filters, limit, offset }),
    [filters, limit, offset],
  );

  const items = data?.items ?? [];

  React.useEffect(() => {
    const first = data?.items?.[0];
    const createdAt = first?.created_at;
    if (typeof createdAt === "string" && createdAt.trim()) {
      setLatestCreatedAt(createdAt);
    }
  }, [data?.items]);

  React.useEffect(() => {
    if (!bannerCount) return;
    const t = window.setTimeout(() => setBannerCount(0), 4000);
    return () => window.clearTimeout(t);
  }, [bannerCount]);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!lastEvent) return;
      if (lastEvent.type !== "jobs_updated") return;
      if (!wsKeyword) return;
      if (lastEvent.keyword.trim() !== wsKeyword.trim()) return;

      setNewJobsCount(lastEvent.new_jobs || 0);
      setSearchStatus("updated");
      setLastUpdatedAt(new Date());

      if (!latestCreatedAt) {
        queryClient.invalidateQueries({ queryKey: currentJobsQueryKey });
        return;
      }

      try {
        const { fetchJobsList } = await import("@/hooks/useJobs");
        const res = await fetchJobsList({
          filters,
          limit: 20,
          offset: 0,
          created_after: latestCreatedAt,
        });

        if (cancelled) return;

        const incoming = res.items ?? [];
        if (incoming.length === 0) return;

        const filteredIncoming = incoming.filter(
          (j) => typeof j.id === "string" && j.id.trim().length > 0,
        );

        if (filteredIncoming.length === 0) return;

        queryClient.setQueryData(currentJobsQueryKey, (old) => {
          if (!old || typeof old !== "object") return old;
          const oldData = old as { items?: unknown; total?: unknown };
          const oldItems = Array.isArray(oldData.items)
            ? (oldData.items as any[])
            : [];

          const existingIds = new Set(
            oldItems
              .map((j) => (j && typeof j === "object" ? (j as any).id : null))
              .filter(
                (id): id is string =>
                  typeof id === "string" && id.trim().length > 0,
              ),
          );

          const dedupedNew = filteredIncoming.filter(
            (j) => !existingIds.has(j.id),
          );
          const nextItems = [...dedupedNew, ...oldItems].slice(0, 100);

          if (dedupedNew.length > 0) {
            const ids = dedupedNew
              .map((j) => j.id)
              .filter(
                (id): id is string =>
                  typeof id === "string" && id.trim().length > 0,
              );
            if (ids.length > 0) {
              setRecentJobIds((prev) => {
                const next = new Set(prev);
                for (const id of ids) next.add(id);
                return next;
              });
            }
          }

          const oldTotal =
            typeof oldData.total === "number"
              ? oldData.total
              : Number.isFinite(Number(oldData.total))
                ? Number(oldData.total)
                : undefined;

          return {
            ...(old as any),
            items: nextItems,
            ...(typeof oldTotal === "number"
              ? { total: oldTotal + dedupedNew.length }
              : {}),
          };
        });

        const newestCreatedAt = filteredIncoming[0]?.created_at;
        if (typeof newestCreatedAt === "string" && newestCreatedAt.trim()) {
          setLatestCreatedAt(newestCreatedAt);
        }

        const existingIds = new Set(items.map((j) => j.id));
        const dedupedCount = filteredIncoming.filter(
          (j) => !existingIds.has(j.id),
        ).length;
        if (dedupedCount > 0) {
          setBannerCount(dedupedCount);
        }
      } catch {
        return;
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [
    currentJobsQueryKey,
    filters,
    items,
    lastEvent,
    latestCreatedAt,
    queryClient,
    wsKeyword,
  ]);

  React.useEffect(() => {
    if (recentJobIds.size === 0) return;
    const t = window.setTimeout(() => {
      setRecentJobIds(new Set());
    }, 4500);
    return () => window.clearTimeout(t);
  }, [recentJobIds]);

  React.useEffect(() => {
    setLatestCreatedAt(null);
    setBannerCount(0);
  }, [wsKeyword, filters]);

  const currentPage = Math.floor(offset / limit) + 1;
  const total = data?.total;
  const maxPage =
    typeof total === "number"
      ? Math.max(1, Math.ceil(total / limit))
      : undefined;

  const canPrev = offset > 0;
  const canNext =
    typeof maxPage === "number"
      ? currentPage < maxPage
      : items.length === limit;

  function applyFilters(next: typeof draft) {
    setSearchStatus("searching");
    setNewJobsCount(0);
    setLatestCreatedAt(null);
    setBannerCount(0);
    setHasApplied(true);
    setApplyCount((c) => c + 1);
    setAppliedKeyword(next.title.trim());

    if (!next.title.trim()) {
      setLastUpdatedAt(null);
      setSearchStatus("idle");
    }

    const selected = next.source_key
      ? sources.find((s) => s.key === next.source_key)
      : undefined;
    const sourceIdParam = selected?.ids?.length ? selected.ids.join(",") : "";

    setFilters({
      title: next.title.trim() || undefined,
      company_name: next.company_name.trim() || undefined,
      location: next.location.trim() || undefined,
      skills: toCommaSeparatedSkills(next.skills) || undefined,
      source_id: sourceIdParam || undefined,
    });
    setOffset(0);
  }

  const shouldShowLiveUi = Boolean(wsKeyword);
  const shouldShowSearchStatus = Boolean(wsKeyword);
  const showNonTitleInfo =
    hasApplied &&
    !wsKeyword &&
    Boolean(
      filters.company_name ||
      filters.location ||
      filters.skills ||
      filters.source_id,
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[24px] border bg-card p-4 shadow-sm">
        <form
          className="grid gap-3 md:grid-cols-12 md:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters(draft);
          }}
        >
          <div className="md:col-span-4">
            <div className="text-xs font-medium tracking-wide text-muted-foreground">
              Title
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
                placeholder="Frontend Engineer"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs font-medium tracking-wide text-muted-foreground">
              Company
            </div>
            <Input
              className="mt-2"
              value={draft.company_name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, company_name: e.target.value }))
              }
              placeholder="SkillSync"
            />
          </div>

          <div className="md:col-span-3">
            <div className="text-xs font-medium tracking-wide text-muted-foreground">
              Location
            </div>
            <Input
              className="mt-2"
              value={draft.location}
              onChange={(e) =>
                setDraft((d) => ({ ...d, location: e.target.value }))
              }
              placeholder="Remote / Jakarta"
            />
          </div>

          <div className="md:col-span-2">
            <div className="text-xs font-medium tracking-wide text-muted-foreground">
              Skills
            </div>
            <Input
              className="mt-2"
              value={draft.skills}
              onChange={(e) =>
                setDraft((d) => ({ ...d, skills: e.target.value }))
              }
              placeholder="react, nextjs"
            />
          </div>

          <div className="md:col-span-12">
            <div className="text-xs font-medium tracking-wide text-muted-foreground">
              Sources
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Select
                value={draft.source_key || "all"}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, source_key: v === "all" ? "" : v }))
                }
              >
                <SelectTrigger className="w-full md:w-[280px]" size="sm">
                  <SelectValue placeholder="All sources" />
                  {isSourcesPending ? (
                    <Spinner className="ml-1 size-3" />
                  ) : null}
                </SelectTrigger>
                <SelectContent align="start">
                  <SelectItem value="all">All sources</SelectItem>
                  {sources.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:col-span-12 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="default"
                className="bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-700 hover:to-violet-700"
              >
                <SlidersHorizontal className="size-4" />
                Apply
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-border/60 bg-background/60 shadow-sm hover:bg-accent"
                onClick={() => {
                  const cleared = {
                    title: "",
                    company_name: "",
                    location: "",
                    skills: "",
                    source_key: "",
                  };
                  setDraft(cleared);
                  setHasApplied(false);
                  setAppliedKeyword("");
                  setSearchStatus("idle");
                  setNewJobsCount(0);
                  setLastUpdatedAt(null);
                  setLatestCreatedAt(null);
                  setBannerCount(0);
                  setFilters({});
                  setOffset(0);
                }}
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="bg-primary/10 text-primary shadow-sm hover:bg-primary/15"
                onClick={() => {
                  setSearchStatus("searching");
                  setNewJobsCount(0);
                  refetch();
                }}
              >
                <RefreshCw className="size-4" />
                Refresh
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {hasApplied ? (
                <div className="flex flex-col gap-1">
                  {shouldShowLiveUi ? (
                    <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                      <span
                        className={`size-2 rounded-full ${
                          wsIsLive ? "bg-emerald-500" : "bg-muted-foreground"
                        }`}
                        aria-hidden
                      />
                      <span className="text-muted-foreground">
                        Live updates
                      </span>
                      <span className="font-medium text-foreground">
                        {wsIsLive ? "ON" : "OFF"}
                      </span>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Live updates are available when searching by Title (min. 2
                      characters)
                    </div>
                  )}

                  {shouldShowLiveUi ? (
                    <div className="text-xs text-muted-foreground">
                      Searching for more jobs — this list will grow in real time
                    </div>
                  ) : null}

                  {isRefreshing ? (
                    <div className="text-xs text-muted-foreground">
                      New jobs detected — updating...
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </form>
      </div>

      {showNonTitleInfo ? (
        <div className="w-full rounded-[20px] border bg-card px-4 py-3 text-xs text-muted-foreground shadow-sm">
          Live updates and the “Updated just now” indicator are only available
          when searching by <span className="text-foreground">Title</span>. For
          other filters (Company, Location, Skills, Source), results are loaded
          from existing data.
        </div>
      ) : null}

      {shouldShowSearchStatus ? (
        <SearchStatusIndicator
          status={searchStatus}
          newJobsCount={newJobsCount}
          lastUpdatedAt={lastUpdatedAt}
        />
      ) : null}

      {shouldShowSearchStatus ? <NewJobsBanner count={bannerCount} /> : null}

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Failed to load jobs</AlertTitle>
          <AlertDescription>
            {typeof (error as { message?: unknown })?.message === "string"
              ? (error as { message?: string }).message
              : "Please try again."}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-[28px] border bg-card shadow-sm">
        {isPending ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            Loading jobs...
          </div>
        ) : items.length === 0 ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Search className="size-7 animate-pulse" />
            </div>

            <div className="mt-6 space-y-3">
              <div className="text-lg font-semibold tracking-tight sm:text-xl">
                No matching jobs found
              </div>
              <div className="text-sm text-muted-foreground">
                Try adjusting your filters or searching with a different Title.
              </div>

              <div className="mx-auto flex w-fit items-center justify-center gap-2 pt-2 text-sm text-muted-foreground">
                <span className="inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:0ms]" />
                <span className="inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:150ms]" />
                <span className="inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-0">
            {items.map((job, idx) => (
              <a
                key={job.id}
                href={job.source_url || undefined}
                target={job.source_url ? "_blank" : undefined}
                rel={job.source_url ? "noreferrer" : undefined}
                className={`block p-6 ${
                  job.source_url
                    ? "cursor-pointer transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    : "cursor-default"
                } ${
                  recentJobIds.has(job.id)
                    ? "animate-in fade-in slide-in-from-top-1 bg-primary/5"
                    : ""
                }`}
                onClick={(e) => {
                  if (!job.source_url) e.preventDefault();
                }}
              >
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-medium tracking-tight">
                        {job.title}
                      </div>
                      {typeof job.matching_score === "number" ? (
                        <ScoreBadge score={job.matching_score} />
                      ) : null}
                      <JobSourceBadge sourceUrl={job.source_url} />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {job.company_name || "Unknown company"}
                      {job.location || ""
                        ? ` · ${job.location}`
                        : " · Remote / Unspecified"}
                    </div>

                    {job.description ? (
                      <div className="pt-2 text-sm text-foreground">
                        {(() => {
                          const parsed = parseDescription(job.description);
                          if (parsed.kind === "list") {
                            return (
                              <ul className="list-disc space-y-1 pl-5">
                                {parsed.items.map((item, i) => (
                                  <li key={`${job.id}-desc-${i}`}>
                                    {stripInlineFormatting(item)}
                                  </li>
                                ))}
                              </ul>
                            );
                          }

                          return renderDescription(
                            parsed.text,
                            `${job.id}-desc`,
                          );
                        })()}
                      </div>
                    ) : null}

                    {job.skills.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.skills.slice(0, 10).map((skill) => (
                          <Badge
                            key={`${job.id}-${skill}`}
                            variant="secondary"
                            className="rounded-full"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-3 text-xs text-muted-foreground">
                        No skills listed
                      </div>
                    )}

                    {job.posted_date ? (
                      <div className="pt-3 text-xs text-muted-foreground">
                        Posted {formatPostedDate(job.posted_date)}
                      </div>
                    ) : null}
                  </div>
                </div>

                {idx < items.length - 1 ? <Separator className="mt-6" /> : null}
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Page</span>
            <span className="font-medium text-foreground">{currentPage}</span>
            {typeof maxPage === "number" ? (
              <>
                <span>of</span>
                <span className="font-medium text-foreground">{maxPage}</span>
              </>
            ) : null}
            {isFetching && !isPending ? (
              <span className="ml-2 inline-flex items-center gap-2">
                <Spinner className="size-3" />
                Updating
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!canPrev}
              onClick={() => setOffset((o) => Math.max(0, o - limit))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={!canNext}
              onClick={() => setOffset((o) => o + limit)}
              className="bg-linear-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
