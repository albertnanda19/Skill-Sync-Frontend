import Link from "next/link";

import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const jobs = [
  {
    id: "product-frontend",
    title: "Product Frontend Engineer",
    company: "Nebula Studio",
    location: "Remote (SEA)",
    score: 82,
    highlights: "Strong alignment on React + UI architecture",
  },
  {
    id: "fullstack-growth",
    title: "Fullstack Engineer (Growth)",
    company: "Pulse Metrics",
    location: "Jakarta (Hybrid)",
    score: 71,
    highlights: "Good product sense; needs SQL depth",
  },
  {
    id: "designer-systems",
    title: "Product Designer (Design Systems)",
    company: "Arcade Labs",
    location: "Remote",
    score: 64,
    highlights: "Great systems thinking; research cadence gap",
  },
];

function ScoreBadge({ score }: { score: number }) {
  const className =
    score >= 80
      ? "bg-primary/10 text-primary"
      : score >= 65
        ? "bg-secondary/10 text-secondary"
        : "bg-muted text-foreground";
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>{score}%</span>;
}

export default function JobsListingPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        {/* WIREFRAME: Search & filter horizontal di atas | List vertikal (bukan card grid) | Match score selalu terlihat */}
        <div className="flex flex-col gap-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs font-medium tracking-wide text-muted-foreground">JOBS</div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Browse with clarity</h1>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>

          <div className="rounded-[24px] border bg-card p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search roles, companies, keywords..." />
              </div>
              <Button variant="outline">
                <SlidersHorizontal className="size-4" />
                Filters
              </Button>
              <Button variant="secondary">Save search</Button>
            </div>
          </div>

          <div className="rounded-[28px] border bg-card shadow-sm">
            <div className="grid gap-0">
              {jobs.map((job, idx) => (
                <div key={job.id} className="p-6">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-medium tracking-tight">{job.title}</div>
                        <ScoreBadge score={job.score} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {job.company} · {job.location}
                      </div>
                      <div className="pt-2 text-sm text-muted-foreground">{job.highlights}</div>
                    </div>
                    <div className="flex items-center gap-2 md:justify-end">
                      <Button variant="outline" asChild>
                        <Link href={`/jobs/${job.id}`}>
                          View Match Breakdown
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full">{
                      job.score >= 80 ? "High confidence" : job.score >= 65 ? "Promising" : "Needs work"
                    }</Badge>
                    <Badge variant="outline" className="rounded-full">Match score visible</Badge>
                  </div>

                  {idx < jobs.length - 1 ? <Separator className="mt-6" /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
