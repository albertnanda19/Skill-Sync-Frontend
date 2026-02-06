import Link from "next/link";

import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

const jobById: Record<
  string,
  {
    title: string;
    company: string;
    location: string;
    score: number;
    about: string;
    skills: { name: string; you: number; required: number }[];
  }
> = {
  "product-frontend": {
    title: "Product Frontend Engineer",
    company: "Nebula Studio",
    location: "Remote (SEA)",
    score: 82,
    about:
      "You will ship user-facing features with a focus on performance, design systems, and product clarity. You’ll partner with design and backend to craft a cohesive experience.",
    skills: [
      { name: "React", you: 85, required: 80 },
      { name: "TypeScript", you: 78, required: 75 },
      { name: "Testing", you: 45, required: 70 },
      { name: "Performance", you: 52, required: 65 },
    ],
  },
  "fullstack-growth": {
    title: "Fullstack Engineer (Growth)",
    company: "Pulse Metrics",
    location: "Jakarta (Hybrid)",
    score: 71,
    about:
      "You’ll iterate on acquisition flows, work with analytics instrumentation, and build pragmatic backends to support experimentation.",
    skills: [
      { name: "API Design", you: 72, required: 70 },
      { name: "SQL", you: 48, required: 75 },
      { name: "Experimentation", you: 50, required: 68 },
      { name: "React", you: 70, required: 65 },
    ],
  },
  "designer-systems": {
    title: "Product Designer (Design Systems)",
    company: "Arcade Labs",
    location: "Remote",
    score: 64,
    about:
      "You’ll maintain a living design system, run accessibility and consistency audits, and partner with engineering on component APIs.",
    skills: [
      { name: "Design Systems", you: 74, required: 80 },
      { name: "Accessibility", you: 46, required: 70 },
      { name: "Research", you: 52, required: 68 },
      { name: "Prototyping", you: 70, required: 65 },
    ],
  },
};

function ScoreRing({ score }: { score: number }) {
  const angle = Math.min(100, Math.max(0, score)) * 3.6;
  return (
    <div className="grid place-items-center rounded-[24px] border bg-card p-6 shadow-sm">
      <div
        className="relative grid size-28 place-items-center rounded-full"
        style={{
          background: `conic-gradient(hsl(var(--primary)) ${angle}deg, hsl(var(--border)) 0deg)`,
        }}
      >
        <div className="grid size-[106px] place-items-center rounded-full bg-background">
          <div className="text-2xl font-semibold tracking-tight">{score}%</div>
          <div className="text-xs text-muted-foreground">match</div>
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-muted-foreground">
        Your fit score is built from skills overlap + proficiency confidence.
      </div>
    </div>
  );
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const job = jobById[id] ?? jobById["product-frontend"];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        {/* WIREFRAME: Job info di atas | Match score besar di samping | Skill breakdown split layout | Description collapsible */}
        <div className="grid gap-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  Job detail
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  id: {id}
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {job.title}
              </h1>
              <div className="text-sm text-muted-foreground">
                {job.company} · {job.location}
              </div>
            </div>
            <ScoreRing score={job.score} />
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[28px] border bg-card p-6 shadow-sm md:p-8">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <div className="text-xs font-medium tracking-wide text-muted-foreground">
                    SKILL BREAKDOWN
                  </div>
                  <div className="mt-2 text-lg font-semibold tracking-tight">
                    What’s helping vs what’s holding you back
                  </div>
                </div>
                <Button variant="ghost" asChild>
                  <Link href="/skills-gap">Improve My Match</Link>
                </Button>
              </div>

              <div className="mt-6 grid gap-4">
                {job.skills.map((s) => {
                  const delta = s.you - s.required;
                  const good = delta >= 0;
                  return (
                    <div key={s.name} className="rounded-2xl bg-muted/40 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium tracking-tight">
                            {s.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            You: {s.you}% · Target: {s.required}%
                          </div>
                        </div>
                        <Badge
                          className="rounded-full"
                          variant={good ? "secondary" : "outline"}
                        >
                          {good ? `+${delta}%` : `${delta}%`}
                        </Badge>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-border">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${Math.min(100, s.you)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-8" />

              <Collapsible defaultOpen>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Job description</div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <span className="sr-only">Toggle</span>
                      <ChevronUp className="size-4 data-[state=closed]:hidden" />
                      <ChevronDown className="size-4 data-[state=open]:hidden" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="mt-3 text-sm leading-7 text-muted-foreground">
                    {job.about}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </section>

            <aside className="space-y-4">
              <div className="rounded-[28px] border bg-card p-6 shadow-sm">
                <div className="text-xs font-medium tracking-wide text-muted-foreground">
                  NEXT ACTION
                </div>
                <div className="mt-2 text-lg font-semibold tracking-tight">
                  Turn gaps into a plan
                </div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  We’ll translate missing skills into high-impact improvements.
                </div>
                <div className="mt-6 grid gap-2">
                  <Button asChild>
                    <Link href="/skills-gap">
                      Improve My Match
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/jobs">Back to listing</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-[28px] border bg-card p-6 shadow-sm">
                <div className="text-xs font-medium tracking-wide text-muted-foreground">
                  WHY THIS MATCH
                </div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  You match strongly on core delivery skills, but your score
                  drops where the role expects operational depth.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
