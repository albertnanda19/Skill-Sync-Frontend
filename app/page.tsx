import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-10">
        <div className="flex items-center gap-3">
          <div className="relative grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">
              SkillSync
            </div>
            <div className="text-xs text-muted-foreground">
              Match jobs by skills
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="#how-it-works">See How It Works</Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        {/* WIREFRAME: Hero kiri (headline + CTA) | Visual/diagram kanan (abstract) */}
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Skill-based matching
              </Badge>
              <span className="text-xs text-muted-foreground">
                transparent reasons, actionable next steps
              </span>
            </div>
            <h1 className="max-w-xl text-pretty text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
              Find roles that fit your skills—
              <span className="text-primary"> and understand why.</span>
            </h1>
            <p className="max-w-xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
              SkillSync highlights your match score, explains the gaps, and
              nudges you to the most impactful improvements.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-6 pt-2">
              <div className="space-y-1">
                <div className="text-sm font-medium">Match score</div>
                <div className="text-xs text-muted-foreground">
                  measurable fit, not vibes
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Breakdown</div>
                <div className="text-xs text-muted-foreground">
                  skills that help or hurt
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Next steps</div>
                <div className="text-xs text-muted-foreground">
                  add skills with high impact
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[32px] bg-linear-to-b from-primary/10 via-secondary/8 to-transparent blur-2xl" />
            <div className="rounded-[28px] border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-1">
                  <div className="text-sm font-medium tracking-tight">
                    Sample role fit
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Visual summary (abstract)
                  </div>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  78% match
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-muted/40 p-4">
                  <div>
                    <div className="text-sm font-medium">Strength skills</div>
                    <div className="text-xs text-muted-foreground">
                      React, TypeScript, UI thinking
                    </div>
                  </div>
                  <div className="h-2 w-16 rounded-full bg-primary/15">
                    <div className="h-2 w-12 rounded-full bg-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl bg-muted/40 p-4">
                  <div>
                    <div className="text-sm font-medium">Gap skills</div>
                    <div className="text-xs text-muted-foreground">
                      System design, SQL depth
                    </div>
                  </div>
                  <div className="h-2 w-16 rounded-full bg-secondary/15">
                    <div className="h-2 w-6 rounded-full bg-secondary" />
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed p-4">
                  <div className="text-xs text-muted-foreground">
                    Next: add 2 skills
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      SQL
                    </span>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">
                      System Design
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WIREFRAME: Section “How it works” horizontal */}
        <section id="how-it-works" className="mt-16 pt-16">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="space-y-3">
              <div className="text-xs font-medium tracking-wide text-muted-foreground">
                HOW IT WORKS
              </div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                A matching flow that stays honest.
              </h2>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                The goal isn’t to impress you with charts—it’s to help you
                decide faster.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="text-sm font-medium">1) Capture profile</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  level, roles, and skills with proficiency.
                </div>
              </div>
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="text-sm font-medium">2) Score & explain</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  see match reasons—strengths and missing skills.
                </div>
              </div>
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="text-sm font-medium">3) Improve</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  prioritize skills with the highest impact.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WIREFRAME: CTA final di bawah */}
        <section className="mt-16">
          <div className="rounded-[28px] border bg-card p-8 shadow-sm md:p-10">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-2">
                <div className="text-xs font-medium tracking-wide text-muted-foreground">
                  READY TO START
                </div>
                <div className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Build a skill profile you can act on.
                </div>
                <div className="max-w-lg text-sm leading-6 text-muted-foreground">
                  Create an account, finish onboarding, and jump straight into
                  match insights.
                </div>
              </div>
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
