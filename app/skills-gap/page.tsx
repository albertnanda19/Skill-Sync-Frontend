import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const missing = [
  { skill: "Testing discipline", impact: "High", reason: "Appears in 6/10 roles you opened" },
  { skill: "SQL fundamentals", impact: "High", reason: "Blocks data-driven roles and growth work" },
  { skill: "Performance profiling", impact: "Medium", reason: "Improves frontend seniority signals" },
  { skill: "Accessibility audits", impact: "Medium", reason: "Common requirement for design systems" },
];

function ImpactTag({ impact }: { impact: "High" | "Medium" | "Low" }) {
  const className = impact === "High" ? "bg-primary/10 text-primary" : impact === "Medium" ? "bg-secondary/10 text-secondary" : "bg-muted text-foreground";
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>{impact} impact</span>;
}

export default function SkillsGapPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        {/* WIREFRAME: Job reference kecil di atas | Missing skills list vertikal | Impact indicator per skill */}
        <div className="grid gap-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="rounded-full">Skill gap</Badge>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Make improvement feel lightweight</h1>
              <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
                These are the skills that most often reduce your match score. Focus on the top 2 first.
              </div>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/jobs/product-frontend">View referenced job</Link>
            </Button>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[28px] border bg-card shadow-sm">
              <div className="p-6 md:p-8">
                <div className="text-xs font-medium tracking-wide text-muted-foreground">MISSING SKILLS</div>
                <div className="mt-2 text-lg font-semibold tracking-tight">What to add next</div>
              </div>

              <div className="px-6 pb-6 md:px-8 md:pb-8">
                <div className="grid gap-4">
                  {missing.map((m, idx) => (
                    <div key={m.skill} className="rounded-2xl bg-muted/40 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium tracking-tight">{m.skill}</div>
                          <div className="text-sm text-muted-foreground">{m.reason}</div>
                        </div>
                        <ImpactTag impact={m.impact} />
                      </div>
                      <div className="mt-4 h-2 w-full rounded-full bg-border">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${m.impact === "High" ? 86 : m.impact === "Medium" ? 62 : 40}%` }}
                        />
                      </div>
                      {idx < missing.length - 1 ? <Separator className="mt-5" /> : null}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <Card className="rounded-[28px] p-6 shadow-sm">
                <div className="text-xs font-medium tracking-wide text-muted-foreground">CTA</div>
                <div className="mt-2 text-lg font-semibold tracking-tight">Add these skills to your profile</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  We’ll use them immediately to recalculate match scores.
                </div>
                <div className="mt-6 grid gap-2">
                  <Button asChild>
                    <Link href="/profile/skills">
                      Add These Skills
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">Back to dashboard</Link>
                  </Button>
                </div>
              </Card>

              <Card className="rounded-[28px] p-6 shadow-sm">
                <div className="text-xs font-medium tracking-wide text-muted-foreground">NOTE</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  A single strong addition can shift your shortlist more than five weak ones.
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
