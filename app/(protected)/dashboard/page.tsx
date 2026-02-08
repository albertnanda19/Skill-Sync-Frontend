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

const jobs = [
  {
    id: "product-frontend",
    title: "Product Frontend Engineer",
    company: "Nebula Studio",
    location: "Remote (SEA)",
    score: 82,
    strengths: ["React", "TypeScript", "UI architecture"],
    gaps: ["Testing", "Performance profiling"],
  },
  {
    id: "fullstack-growth",
    title: "Fullstack Engineer (Growth)",
    company: "Pulse Metrics",
    location: "Jakarta (Hybrid)",
    score: 71,
    strengths: ["Product thinking", "API design"],
    gaps: ["SQL depth", "Experiment tooling"],
  },
  {
    id: "designer-systems",
    title: "Product Designer (Design Systems)",
    company: "Arcade Labs",
    location: "Remote",
    score: 64,
    strengths: ["UX writing", "Component tokens"],
    gaps: ["Research cadence", "Accessibility audits"],
  },
];

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

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* WIREFRAME: Header tipis (bukan navbar besar) */}
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
        {/* WIREFRAME: Section kiri: job list (vertical) | Section kanan: match summary (sticky) | Tidak full grid */}
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
              </div>
              <Button variant="ghost" asChild>
                <Link href="/skills-gap">Refine Skills</Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-[22px] border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium tracking-tight">
                        {job.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {job.company} · {job.location}
                      </div>
                    </div>
                    <ScoreTag score={job.score} />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-muted/40 p-4">
                      <div className="text-xs font-medium text-muted-foreground">
                        Strong signals
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {job.strengths.map((s) => (
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
                        {job.gaps.map((g) => (
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
                      <Link href={`/jobs/${job.id}`}>
                        View Details
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href="/skills-gap">Improve match</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
                      Frontend craft
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Component architecture, TS fluency, UI polish
                    </div>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                      Most common gap
                    </div>
                    <div className="mt-2 text-sm font-medium">
                      Operational depth
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Testing discipline, performance, data basics
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-3">
                    <Button asChild>
                      <Link href="/skills-gap">
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
