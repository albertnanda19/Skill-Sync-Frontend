"use client";

import Link from "next/link";
import * as React from "react";

import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const steps = ["Experience", "Roles", "Skills"] as const;

type StepKey = (typeof steps)[number];

function StepPill({ active, done, children }: { active?: boolean; done?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={
        "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-colors " +
        (active
          ? "bg-primary/10 text-primary"
          : done
            ? "bg-muted text-foreground"
            : "bg-muted/40 text-muted-foreground")
      }
    >
      <span
        className={
          "grid size-4 place-items-center rounded-full text-[10px] " +
          (active ? "bg-primary text-primary-foreground" : done ? "bg-foreground text-background" : "bg-border text-muted-foreground")
        }
      >
        {done ? <Check className="size-3" /> : null}
      </span>
      <span>{children}</span>
    </div>
  );
}

export default function OnboardingPage() {
  const [index, setIndex] = React.useState(0);

  const step: StepKey = steps[index]!;
  const progressValue = ((index + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* WIREFRAME: Step-based layout | Progress indicator horizontal | Konten step di tengah | CTA di kanan bawah */}
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="rounded-full">
                Onboarding
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Set up your matching signal</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Keep it lightweight. You can refine everything later—what matters is starting with an honest baseline.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Skip for now</Link>
            </Button>
          </div>

          <div className="grid gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <StepPill active={index === 0} done={index > 0}>
                1. Experience level
              </StepPill>
              <StepPill active={index === 1} done={index > 1}>
                2. Preferred roles
              </StepPill>
              <StepPill active={index === 2}>
                3. Skills & proficiency
              </StepPill>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-[28px] border bg-card p-8 shadow-sm">
              {step === "Experience" ? (
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl tracking-tight">Your experience level</CardTitle>
                    <CardDescription className="text-sm leading-6">
                      This affects what roles we prioritize and how we interpret missing skills.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <RadioGroup defaultValue="mid" className="grid gap-3">
                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-background p-4">
                        <RadioGroupItem value="junior" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium">Junior</div>
                          <div className="text-sm text-muted-foreground">0–2 years, learning core workflows</div>
                        </div>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-background p-4">
                        <RadioGroupItem value="mid" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium">Mid-level</div>
                          <div className="text-sm text-muted-foreground">2–5 years, shipping with ownership</div>
                        </div>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-background p-4">
                        <RadioGroupItem value="senior" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium">Senior</div>
                          <div className="text-sm text-muted-foreground">5+ years, systems thinking and mentoring</div>
                        </div>
                      </label>
                    </RadioGroup>
                  </CardContent>
                </Card>
              ) : null}

              {step === "Roles" ? (
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl tracking-tight">Preferred roles</CardTitle>
                    <CardDescription className="text-sm leading-6">
                      Pick 1–3 roles. Your dashboard will optimize the feed around these.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 px-0">
                    <label className="flex items-start justify-between gap-4 rounded-2xl border bg-background p-4">
                      <div>
                        <div className="text-sm font-medium">Frontend Engineer</div>
                        <div className="text-sm text-muted-foreground">UI architecture + performance</div>
                      </div>
                      <input type="checkbox" className="mt-1 size-4 accent-[hsl(var(--primary))]" defaultChecked />
                    </label>
                    <label className="flex items-start justify-between gap-4 rounded-2xl border bg-background p-4">
                      <div>
                        <div className="text-sm font-medium">Fullstack Engineer</div>
                        <div className="text-sm text-muted-foreground">Product delivery end-to-end</div>
                      </div>
                      <input type="checkbox" className="mt-1 size-4 accent-[hsl(var(--primary))]" />
                    </label>
                    <label className="flex items-start justify-between gap-4 rounded-2xl border bg-background p-4">
                      <div>
                        <div className="text-sm font-medium">Product Designer</div>
                        <div className="text-sm text-muted-foreground">UX flows, systems, prototypes</div>
                      </div>
                      <input type="checkbox" className="mt-1 size-4 accent-[hsl(var(--primary))]" />
                    </label>
                  </CardContent>
                </Card>
              ) : null}

              {step === "Skills" ? (
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl tracking-tight">Your top skills</CardTitle>
                    <CardDescription className="text-sm leading-6">
                      Add a few skills and a rough proficiency. You’ll fine-tune later.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 px-0">
                    <div className="grid gap-2">
                      <Label htmlFor="skills">Skills</Label>
                      <Input id="skills" placeholder="e.g. React, TypeScript, UI Design, SQL" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confidence">What do you feel strongest at?</Label>
                      <Input id="confidence" placeholder="e.g. component architecture" />
                    </div>
                    <div className="rounded-2xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
                      Tip: list 6–10 skills max. More isn’t better—signal quality matters.
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="relative">
              <div className="sticky top-8 rounded-[28px] border bg-card p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="text-xs font-medium tracking-wide text-muted-foreground">WHAT HAPPENS NEXT</div>
                  <div className="text-sm leading-6 text-muted-foreground">
                    You’ll land on the dashboard with a curated list of jobs and a match summary that explains the why.
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIndex((v) => Math.max(0, v - 1))}
                    disabled={index === 0}
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </Button>
                  {index < steps.length - 1 ? (
                    <Button onClick={() => setIndex((v) => Math.min(steps.length - 1, v + 1))}>
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/dashboard">
                        Finish Setup
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Step {index + 1} of {steps.length}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-secondary" />
                    tuned for clarity
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" asChild>
              <Link href="/"> <ChevronLeft className="size-4" /> Back to landing</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Skip for now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
