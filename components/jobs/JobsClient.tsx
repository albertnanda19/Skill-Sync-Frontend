"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { useJobs, type JobsFilters } from "@/hooks/useJobs";
import { useJobsWebSocket } from "@/hooks/useJobsWebSocket";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

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

function renderInlineMarkdown(value: string, keyPrefix: string) {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let part = 0;

  while (i < value.length) {
    const nextBold = value.indexOf("**", i);
    const nextItalic = value.indexOf("*", i);

    const next =
      nextBold !== -1 && (nextItalic === -1 || nextBold < nextItalic)
        ? { type: "bold" as const, idx: nextBold, len: 2 }
        : nextItalic !== -1
          ? { type: "italic" as const, idx: nextItalic, len: 1 }
          : null;

    if (!next) {
      nodes.push(value.slice(i));
      break;
    }

    if (next.idx > i) {
      nodes.push(value.slice(i, next.idx));
    }

    const start = next.idx + next.len;
    const end = value.indexOf(next.type === "bold" ? "**" : "*", start);
    if (end === -1) {
      nodes.push(value.slice(next.idx));
      break;
    }

    const inner = value.slice(start, end);
    const k = `${keyPrefix}-md-${part}`;
    part += 1;

    if (next.type === "bold") {
      nodes.push(<strong key={k}>{inner}</strong>);
      i = end + 2;
    } else {
      nodes.push(<em key={k}>{inner}</em>);
      i = end + 1;
    }
  }

  return nodes;
}

function renderDescription(value: string, keyPrefix: string) {
  const normalized = value
    .replace(/\s*-{6,}\s*/g, "\n\n---\n\n")
    .replace(/\r\n/g, "\n");

  const blocks = normalized
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, idx) => {
    if (block === "---") {
      return <hr key={`${keyPrefix}-hr-${idx}`} className="my-3" />;
    }

    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return (
      <p key={`${keyPrefix}-p-${idx}`} className={idx === 0 ? "" : "mt-2"}>
        {lines.map((line, lineIdx) => (
          <React.Fragment key={`${keyPrefix}-l-${idx}-${lineIdx}`}>
            {lineIdx > 0 ? <br /> : null}
            {renderInlineMarkdown(line, `${keyPrefix}-${idx}-${lineIdx}`)}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

export default function JobsClient({
  initialFilters,
  initialLimit = 20,
  initialOffset = 0,
}: {
  initialFilters?: JobsFilters;
  initialLimit?: number;
  initialOffset?: number;
}) {
  const [filters, setFilters] = React.useState<JobsFilters>(
    () => initialFilters ?? {},
  );
  const [hasApplied, setHasApplied] = React.useState(false);
  const [applyCount, setApplyCount] = React.useState(0);
  const [appliedKeyword, setAppliedKeyword] = React.useState("");
  const [draft, setDraft] = React.useState<{
    title: string;
    company_name: string;
    location: string;
    skills: string;
  }>(() => ({
    title: initialFilters?.title ?? "",
    company_name: initialFilters?.company_name ?? "",
    location: initialFilters?.location ?? "",
    skills: initialFilters?.skills ?? "",
  }));

  const [limit, setLimit] = React.useState(() => initialLimit);
  const [offset, setOffset] = React.useState(() => initialOffset);

  const wsKeyword = React.useMemo(() => {
    const normalized = appliedKeyword.trim();
    return normalized.length >= 2 ? normalized : "";
  }, [appliedKeyword]);

  const {
    status: wsStatus,
    isRefreshing,
    hasError: wsHasError,
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

  const items = data?.items ?? [];

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
    setHasApplied(true);
    setApplyCount((c) => c + 1);
    setAppliedKeyword(next.title.trim());
    setFilters({
      title: next.title.trim() || undefined,
      company_name: next.company_name.trim() || undefined,
      location: next.location.trim() || undefined,
      skills: toCommaSeparatedSkills(next.skills) || undefined,
    });
    setOffset(0);
  }

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

          <div className="md:col-span-12 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Button type="submit" variant="default">
                Apply filters
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const cleared = {
                    title: "",
                    company_name: "",
                    location: "",
                    skills: "",
                  };
                  setDraft(cleared);
                  setHasApplied(false);
                  setAppliedKeyword("");
                  setFilters({});
                  setOffset(0);
                }}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  refetch();
                }}
              >
                Refresh
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {hasApplied ? (
                <div className="flex flex-col gap-1">
                  {wsKeyword ? (
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
                      Tambahkan keyword minimal 2 karakter untuk live update
                    </div>
                  )}

                  {wsKeyword ? (
                    <div className="text-xs text-muted-foreground">
                      Sedang mencari loker lainnya — daftar akan bertambah
                      secara real-time
                    </div>
                  ) : null}

                  {isRefreshing ? (
                    <div className="text-xs text-muted-foreground">
                      Ada job baru — mengupdate...
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">Per page</div>
                <div className="flex items-center gap-2">
                  {[10, 20, 50].map((n) => (
                    <Button
                      key={n}
                      type="button"
                      variant={limit === n ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setLimit(n);
                        setOffset(0);
                      }}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

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
          <div className="p-10 text-center text-sm text-muted-foreground">
            No jobs found
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
                }`}
                onClick={(e) => {
                  if (!job.source_url) e.preventDefault();
                }}
              >
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium tracking-tight">
                        {job.title}
                      </div>
                      {typeof job.matching_score === "number" ? (
                        <ScoreBadge score={job.matching_score} />
                      ) : null}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {job.company_name || "Unknown company"}
                      {job.location || ""
                        ? ` · ${job.location}`
                        : " · Remote / Unspecified"}
                    </div>

                    {job.description ? (
                      <div className="pt-2 text-sm text-muted-foreground">
                        {(() => {
                          const parsed = parseDescription(job.description);
                          if (parsed.kind === "list") {
                            return (
                              <ul className="list-disc space-y-1 pl-5">
                                {parsed.items.map((item, i) => (
                                  <li key={`${job.id}-desc-${i}`}>
                                    {renderInlineMarkdown(
                                      item,
                                      `${job.id}-desc-${i}`,
                                    )}
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

                  <div className="flex items-center gap-2 md:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      disabled
                      title="Match breakdown page not implemented"
                    >
                      View Match Breakdown
                    </Button>
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
