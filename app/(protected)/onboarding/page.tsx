"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useCreateSkillCatalog } from "@/hooks/useCreateSkillCatalog";
import { useSkillsCatalog } from "@/hooks/useSkillsCatalog";
import { useSubmitOnboarding } from "@/hooks/useSubmitOnboarding";

const steps = ["Experience", "Roles", "Skills"] as const;

type StepKey = (typeof steps)[number];

function StepPill({
  active,
  done,
  children,
}: {
  active?: boolean;
  done?: boolean;
  children: React.ReactNode;
}) {
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
          (active
            ? "bg-primary text-primary-foreground"
            : done
              ? "bg-foreground text-background"
              : "bg-border text-muted-foreground")
        }
      >
        {done ? <Check className="size-3" /> : null}
      </span>
      <span>{children}</span>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);

  const submitOnboarding = useSubmitOnboarding();
  const skillsCatalogQuery = useSkillsCatalog();
  const createSkillCatalog = useCreateSkillCatalog();

  const [experienceLevel, setExperienceLevel] = React.useState<
    "junior" | "mid" | "senior"
  >("mid");
  const [preferredRoles, setPreferredRoles] = React.useState<Set<string>>(
    () => new Set(["Frontend Engineer"]),
  );
  const [customRole, setCustomRole] = React.useState("");

  const [draftSkillId, setDraftSkillId] = React.useState<string>("");
  const [draftSkillName, setDraftSkillName] = React.useState<string>("");
  const [draftSkillOpen, setDraftSkillOpen] = React.useState(false);
  const [draftSkillSearch, setDraftSkillSearch] = React.useState("");
  const [draftProficiency, setDraftProficiency] = React.useState<number>(3);
  const [draftYears, setDraftYears] = React.useState<number>(1);

  const [skills, setSkills] = React.useState<
    Array<{
      skill_id: string;
      name: string;
      proficiency_level: number;
      years_experience: number;
    }>
  >([]);

  const step: StepKey = steps[index]!;
  const progressValue = ((index + 1) / steps.length) * 100;

  const isBusy = submitOnboarding.isPending;

  const catalog = skillsCatalogQuery.data ?? [];

  const draftMatches = React.useMemo(() => {
    const q = draftSkillSearch.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((s) => s.name.toLowerCase().includes(q));
  }, [catalog, draftSkillSearch]);

  const submitStep = React.useCallback(async () => {
    if (step === "Experience") {
      const mapped =
        experienceLevel === "junior"
          ? "Junior"
          : experienceLevel === "senior"
            ? "Senior"
            : "Mid";
      await submitOnboarding.mutateAsync({ experience_level: mapped });
      return;
    }

    if (step === "Roles") {
      if (preferredRoles.size === 0) return;
      await submitOnboarding.mutateAsync({
        preferred_roles: Array.from(preferredRoles),
      });
      return;
    }

    if (skills.length === 0) return;

    await submitOnboarding.mutateAsync({
      skills: skills.map((s) => ({
        skill_id: s.skill_id,
        proficiency_level: s.proficiency_level,
        years_experience: s.years_experience,
      })),
    });
  }, [
    createSkillCatalog,
    experienceLevel,
    preferredRoles,
    skillsCatalogQuery,
    skills,
    step,
    submitOnboarding,
  ]);

  const addCustomRole = React.useCallback(() => {
    const nextRole = customRole.trim();
    if (!nextRole) return;

    setPreferredRoles((prev) => {
      if (prev.size >= 3) return prev;

      const exists = Array.from(prev).some(
        (r) => r.toLowerCase() === nextRole.toLowerCase(),
      );
      if (exists) return prev;

      const next = new Set(prev);
      next.add(nextRole);
      return next;
    });

    setCustomRole("");
  }, [customRole]);

  const onNext = React.useCallback(async () => {
    if (isBusy) return;
    try {
      await submitStep();
      setIndex((v) => Math.min(steps.length - 1, v + 1));
    } catch {
      // keep user on current step
    }
  }, [isBusy, submitStep]);

  const onFinish = React.useCallback(async () => {
    if (isBusy) return;
    try {
      await submitStep();
    } catch {
      return;
    }
    router.push("/jobs");
  }, [isBusy, router, submitStep]);

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
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Set up your matching signal
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Keep it lightweight. You can refine everything later—what
                matters is starting with an honest baseline.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <StepPill active={index === 0} done={index > 0}>
                1. Experience level
              </StepPill>
              <StepPill active={index === 1} done={index > 1}>
                2. Preferred roles
              </StepPill>
              <StepPill active={index === 2}>3. Skills & proficiency</StepPill>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-[28px] border bg-card p-8 shadow-sm">
              {step === "Experience" ? (
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl tracking-tight">
                      Your experience level
                    </CardTitle>
                    <CardDescription className="text-sm leading-6">
                      This affects what roles we prioritize and how we interpret
                      missing skills.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <RadioGroup
                      value={experienceLevel}
                      onValueChange={(v) =>
                        setExperienceLevel(
                          v === "junior" || v === "mid" || v === "senior"
                            ? v
                            : "mid",
                        )
                      }
                      className="grid gap-3"
                    >
                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-background p-4">
                        <RadioGroupItem value="junior" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium">Junior</div>
                          <div className="text-sm text-muted-foreground">
                            0–2 years, learning core workflows
                          </div>
                        </div>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-background p-4">
                        <RadioGroupItem value="mid" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium">Mid-level</div>
                          <div className="text-sm text-muted-foreground">
                            2–5 years, shipping with ownership
                          </div>
                        </div>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-background p-4">
                        <RadioGroupItem value="senior" className="mt-1" />
                        <div>
                          <div className="text-sm font-medium">Senior</div>
                          <div className="text-sm text-muted-foreground">
                            5+ years, systems thinking and mentoring
                          </div>
                        </div>
                      </label>
                    </RadioGroup>
                  </CardContent>
                </Card>
              ) : null}

              {step === "Roles" ? (
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl tracking-tight">
                      Preferred roles
                    </CardTitle>
                    <CardDescription className="text-sm leading-6">
                      Pick 1–3 roles. Your dashboard will optimize the feed
                      around these.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 px-0">
                    <label className="flex items-start justify-between gap-4 rounded-2xl border bg-background p-4">
                      <div>
                        <div className="text-sm font-medium">
                          Frontend Engineer
                        </div>
                        <div className="text-sm text-muted-foreground">
                          UI architecture + performance
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="mt-1 size-4 accent-[hsl(var(--primary))]"
                        checked={preferredRoles.has("Frontend Engineer")}
                        disabled={
                          !preferredRoles.has("Frontend Engineer") &&
                          preferredRoles.size >= 3
                        }
                        onChange={(e) => {
                          setPreferredRoles((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) {
                              if (next.size >= 3) return prev;
                              next.add("Frontend Engineer");
                            } else next.delete("Frontend Engineer");
                            return next;
                          });
                        }}
                      />
                    </label>
                    <label className="flex items-start justify-between gap-4 rounded-2xl border bg-background p-4">
                      <div>
                        <div className="text-sm font-medium">
                          Fullstack Engineer
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Product delivery end-to-end
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="mt-1 size-4 accent-[hsl(var(--primary))]"
                        checked={preferredRoles.has("Fullstack Engineer")}
                        disabled={
                          !preferredRoles.has("Fullstack Engineer") &&
                          preferredRoles.size >= 3
                        }
                        onChange={(e) => {
                          setPreferredRoles((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) {
                              if (next.size >= 3) return prev;
                              next.add("Fullstack Engineer");
                            } else next.delete("Fullstack Engineer");
                            return next;
                          });
                        }}
                      />
                    </label>
                    <label className="flex items-start justify-between gap-4 rounded-2xl border bg-background p-4">
                      <div>
                        <div className="text-sm font-medium">
                          Product Designer
                        </div>
                        <div className="text-sm text-muted-foreground">
                          UX flows, systems, prototypes
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="mt-1 size-4 accent-[hsl(var(--primary))]"
                        checked={preferredRoles.has("Product Designer")}
                        disabled={
                          !preferredRoles.has("Product Designer") &&
                          preferredRoles.size >= 3
                        }
                        onChange={(e) => {
                          setPreferredRoles((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) {
                              if (next.size >= 3) return prev;
                              next.add("Product Designer");
                            } else next.delete("Product Designer");
                            return next;
                          });
                        }}
                      />
                    </label>

                    <div className="mt-2 grid gap-2 rounded-2xl border bg-background p-4">
                      <Label htmlFor="custom-role">Add a role</Label>
                      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
                        <Input
                          id="custom-role"
                          placeholder="e.g. Backend Engineer"
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomRole();
                            }
                          }}
                          disabled={isBusy || preferredRoles.size >= 3}
                        />
                        <Button
                          type="button"
                          onClick={addCustomRole}
                          disabled={
                            isBusy ||
                            preferredRoles.size >= 3 ||
                            !customRole.trim()
                          }
                        >
                          Add
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Choose up to 3 roles.
                      </div>
                    </div>

                    {preferredRoles.size > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.from(preferredRoles).map((role) => (
                          <Badge
                            key={role}
                            variant="secondary"
                            className="rounded-full"
                          >
                            {role}
                            <button
                              type="button"
                              className="ml-2 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                              onClick={() =>
                                setPreferredRoles((prev) => {
                                  const next = new Set(prev);
                                  next.delete(role);
                                  return next;
                                })
                              }
                              disabled={isBusy}
                              aria-label={`Remove ${role}`}
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}

              {step === "Skills" ? (
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-xl tracking-tight">
                      Your top skills
                    </CardTitle>
                    <CardDescription className="text-sm leading-6">
                      Add a few skills and a rough proficiency. You’ll fine-tune
                      later.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 px-0">
                    <div className="grid gap-3 rounded-2xl border bg-background p-4">
                      <div className="grid gap-2">
                        <Label>Skill</Label>
                        <Popover
                          open={draftSkillOpen}
                          onOpenChange={setDraftSkillOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              aria-expanded={draftSkillOpen}
                              className="w-full justify-between"
                              disabled={isBusy || skillsCatalogQuery.isLoading}
                            >
                              <span className="truncate">
                                {draftSkillId
                                  ? catalog.find((s) => s.id === draftSkillId)
                                      ?.name || draftSkillName
                                  : "Select a skill"}
                              </span>
                              <ChevronsUpDown className="size-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-(--radix-popover-trigger-width) p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Search skill…"
                                value={draftSkillSearch}
                                onValueChange={setDraftSkillSearch}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-auto w-full justify-start px-2 py-2"
                                    disabled={
                                      createSkillCatalog.isPending ||
                                      !draftSkillSearch.trim()
                                    }
                                    onClick={async () => {
                                      const term = draftSkillSearch.trim();
                                      if (!term) return;
                                      try {
                                        const res =
                                          await createSkillCatalog.mutateAsync({
                                            name: term,
                                          });
                                        const created = res?.data;
                                        if (!created?.id) return;
                                        setDraftSkillId(created.id);
                                        setDraftSkillName(created.name);
                                        setDraftSkillSearch("");
                                        setDraftSkillOpen(false);
                                      } catch {
                                        // ignore
                                      }
                                    }}
                                  >
                                    {createSkillCatalog.isPending ? (
                                      <Spinner className="size-4" />
                                    ) : (
                                      <Plus className="size-4" />
                                    )}
                                    Add "{draftSkillSearch.trim()}"
                                  </Button>
                                </CommandEmpty>
                                <CommandGroup>
                                  {draftMatches.map((s) => (
                                    <CommandItem
                                      key={s.id}
                                      value={s.name}
                                      onSelect={() => {
                                        setDraftSkillId(s.id);
                                        setDraftSkillName(s.name);
                                        setDraftSkillOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={
                                          draftSkillId === s.id
                                            ? "size-4 opacity-100"
                                            : "size-4 opacity-0"
                                        }
                                      />
                                      {s.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="grid gap-2">
                        <Label>Proficiency</Label>
                        <div className="flex items-center gap-3">
                          <Slider
                            value={[draftProficiency]}
                            min={1}
                            max={5}
                            step={1}
                            onValueChange={(v) =>
                              setDraftProficiency(
                                typeof v[0] === "number" ? v[0] : 3,
                              )
                            }
                            disabled={isBusy}
                          />
                          <div className="w-12 text-right text-sm tabular-nums text-muted-foreground">
                            {draftProficiency}/5
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="years-exp">Years experience</Label>
                        <Input
                          id="years-exp"
                          inputMode="numeric"
                          value={String(draftYears)}
                          onChange={(e) => {
                            const n = Number(e.target.value);
                            setDraftYears(
                              Number.isFinite(n)
                                ? Math.max(0, Math.min(50, Math.round(n)))
                                : 0,
                            );
                          }}
                          disabled={isBusy}
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={() => {
                          if (!draftSkillId) return;
                          const name =
                            catalog.find((s) => s.id === draftSkillId)?.name ||
                            draftSkillName;
                          if (!name) return;

                          setSkills((prev) => {
                            const next = prev.filter(
                              (s) => s.skill_id !== draftSkillId,
                            );
                            return [
                              {
                                skill_id: draftSkillId,
                                name,
                                proficiency_level: Math.min(
                                  5,
                                  Math.max(1, Math.round(draftProficiency)),
                                ),
                                years_experience: Math.min(
                                  50,
                                  Math.max(0, Math.round(draftYears)),
                                ),
                              },
                              ...next,
                            ];
                          });

                          setDraftSkillId("");
                          setDraftSkillName("");
                          setDraftSkillSearch("");
                          setDraftSkillOpen(false);
                          setDraftProficiency(3);
                          setDraftYears(1);
                        }}
                        disabled={isBusy || !draftSkillId}
                      >
                        Add skill
                      </Button>
                    </div>

                    {skills.length > 0 ? (
                      <div className="grid gap-3">
                        {skills.map((s) => (
                          <div
                            key={s.skill_id}
                            className="rounded-2xl border bg-background p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-medium">
                                  {s.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Tune proficiency and experience
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setSkills((prev) =>
                                    prev.filter(
                                      (x) => x.skill_id !== s.skill_id,
                                    ),
                                  )
                                }
                                disabled={isBusy}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div className="grid gap-2">
                                <Label>Proficiency</Label>
                                <div className="flex items-center gap-3">
                                  <Slider
                                    value={[s.proficiency_level]}
                                    min={1}
                                    max={5}
                                    step={1}
                                    onValueChange={(v) => {
                                      const next =
                                        typeof v[0] === "number"
                                          ? v[0]
                                          : s.proficiency_level;
                                      setSkills((prev) =>
                                        prev.map((x) =>
                                          x.skill_id === s.skill_id
                                            ? {
                                                ...x,
                                                proficiency_level: Math.min(
                                                  5,
                                                  Math.max(1, Math.round(next)),
                                                ),
                                              }
                                            : x,
                                        ),
                                      );
                                    }}
                                    disabled={isBusy}
                                  />
                                  <div className="w-12 text-right text-sm tabular-nums text-muted-foreground">
                                    {s.proficiency_level}/5
                                  </div>
                                </div>
                              </div>

                              <div className="grid gap-2">
                                <Label>Years</Label>
                                <Input
                                  inputMode="numeric"
                                  value={String(s.years_experience)}
                                  onChange={(e) => {
                                    const n = Number(e.target.value);
                                    const next = Number.isFinite(n)
                                      ? Math.max(0, Math.min(50, Math.round(n)))
                                      : 0;
                                    setSkills((prev) =>
                                      prev.map((x) =>
                                        x.skill_id === s.skill_id
                                          ? { ...x, years_experience: next }
                                          : x,
                                      ),
                                    );
                                  }}
                                  disabled={isBusy}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed bg-background p-4 text-sm text-muted-foreground">
                        Tip: add 3–6 skills. Keep it focused—signal quality
                        matters.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="relative">
              <div className="sticky top-8 rounded-[28px] border bg-card p-6 shadow-sm">
                <div className="space-y-2">
                  <div className="text-xs font-medium tracking-wide text-muted-foreground">
                    WHAT HAPPENS NEXT
                  </div>
                  <div className="text-sm leading-6 text-muted-foreground">
                    You’ll land on the dashboard with a curated list of jobs and
                    a match summary that explains the why.
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
                    <Button onClick={onNext} disabled={isBusy}>
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  ) : (
                    <Button onClick={onFinish} disabled={isBusy}>
                      Finish Setup
                      <ArrowRight className="size-4" />
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
              <Link href="/">
                {" "}
                <ChevronLeft className="size-4" /> Back to landing
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/jobs">Skip for now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
