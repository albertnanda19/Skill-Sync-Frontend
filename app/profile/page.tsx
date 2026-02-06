import Link from "next/link";

import { Pencil, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        {/* WIREFRAME: Summary layout | Section per category | CTA inline (edit) */}
        <div className="grid gap-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="rounded-full">Profile</Badge>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your matching profile</h1>
              <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Keep this sharp and honest. SkillSync works best when your signal is clean.
              </div>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <Card className="rounded-[28px]">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg tracking-tight">Skills</CardTitle>
                      <CardDescription className="text-sm leading-6">What you can do—plus proficiency</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/profile/skills">
                        <Pencil className="size-4" />
                        Edit Skills
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <div className="text-sm font-medium">Core</div>
                    <div className="mt-2 text-sm text-muted-foreground">React, TypeScript, UI systems, product thinking</div>
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <div className="text-sm font-medium">Developing</div>
                    <div className="mt-2 text-sm text-muted-foreground">Testing, SQL fundamentals, accessibility</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px]">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg tracking-tight">Preferences</CardTitle>
                      <CardDescription className="text-sm leading-6">Roles, locations, and constraints</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/profile/preferences">
                        <Pencil className="size-4" />
                        Edit Preferences
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <div className="text-sm font-medium">Preferred roles</div>
                    <div className="mt-2 text-sm text-muted-foreground">Frontend Engineer, Fullstack (selective)</div>
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-4">
                    <div className="text-sm font-medium">Work style</div>
                    <div className="mt-2 text-sm text-muted-foreground">Remote first, SEA timezone, async-friendly</div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <aside className="space-y-4">
              <Card className="rounded-[28px] p-6 shadow-sm">
                <div className="text-xs font-medium tracking-wide text-muted-foreground">NEXT</div>
                <div className="mt-2 text-lg font-semibold tracking-tight">Re-run your matches</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  After edits, your dashboard will reflect the new signal instantly.
                </div>
                <div className="mt-6 grid gap-2">
                  <Button asChild>
                    <Link href="/dashboard">
                      Go to dashboard
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/jobs">Browse jobs</Link>
                  </Button>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
