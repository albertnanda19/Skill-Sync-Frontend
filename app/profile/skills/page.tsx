"use client";

import Link from "next/link";
import * as React from "react";

import { ArrowRight, Plus, Save, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type Skill = { name: string; level: number };

export default function ManageSkillsPage() {
  const [skills, setSkills] = React.useState<Skill[]>([
    { name: "React", level: 80 },
    { name: "TypeScript", level: 72 },
    { name: "Testing", level: 45 },
    { name: "SQL", level: 48 },
  ]);
  const [draft, setDraft] = React.useState("");

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-6xl px-6 pb-28 pt-12">
        {/* WIREFRAME: Skill list editable | Inline proficiency control | Save bar sticky di bawah */}
        <div className="grid gap-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="rounded-full">Manage skills</Badge>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Edit with restraint</h1>
              <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Your goal isn’t to list everything—it’s to represent what you’d actually use on the job.
              </div>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/profile">Back to profile</Link>
            </Button>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-4">
              <Card className="rounded-[28px] p-6 shadow-sm md:p-8">
                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="grid gap-2">
                    <Label htmlFor="new-skill">Add a skill</Label>
                    <Input
                      id="new-skill"
                      placeholder="e.g. Accessibility"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const v = draft.trim();
                      if (!v) return;
                      setSkills((s) => [{ name: v, level: 50 }, ...s]);
                      setDraft("");
                    }}
                  >
                    <Plus className="size-4" />
                    Add
                  </Button>
                </div>
              </Card>

              <div className="grid gap-4">
                {skills.map((s, idx) => (
                  <Card key={s.name} className="rounded-[28px] p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium tracking-tight">{s.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Proficiency: {s.level}%</div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSkills((list) => list.filter((_, i) => i !== idx))}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>

                    <div className="mt-5">
                      <Slider
                        value={[s.level]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          setSkills((list) =>
                            list.map((item, i) => (i === idx ? { ...item, level: value[0] ?? item.level } : item))
                          )
                        }
                      />
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>learning</span>
                        <span>confident</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <aside className="space-y-4">
              <Card className="rounded-[28px] p-6 shadow-sm">
                <div className="text-xs font-medium tracking-wide text-muted-foreground">GUIDE</div>
                <div className="mt-2 text-lg font-semibold tracking-tight">Signal quality checklist</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  Aim for 8–12 skills. Keep levels honest—overstating makes match explanations feel wrong.
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="text-sm text-muted-foreground">Unsaved changes</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                <Save className="size-4" />
                Save Changes
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
