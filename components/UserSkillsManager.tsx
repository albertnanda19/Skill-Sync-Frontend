"use client";

import Link from "next/link";
import * as React from "react";
import { Pencil, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

import { useCreateSkill } from "@/hooks/useCreateSkill";
import { useSkillsCatalog } from "@/hooks/useSkillsCatalog";
import { useUpdateSkill } from "@/hooks/useUpdateSkill";
import { useUserSkills, type UserSkill } from "@/hooks/useUserSkills";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";

function clampProficiency(value: number) {
  if (Number.isNaN(value)) return 1;
  return Math.min(5, Math.max(1, Math.round(value)));
}

function clampYears(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(50, Math.max(0, Math.round(value)));
}

export default function UserSkillsManager() {
  const skillsQuery = useUserSkills();
  const catalogQuery = useSkillsCatalog();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();

  const [draftSkillId, setDraftSkillId] = React.useState<string>("");
  const [draftProficiency, setDraftProficiency] = React.useState<number>(3);
  const [draftYears, setDraftYears] = React.useState<number>(0);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editSkillId, setEditSkillId] = React.useState<string>("");
  const [editName, setEditName] = React.useState("");
  const [editProficiency, setEditProficiency] = React.useState<number>(3);
  const [editYears, setEditYears] = React.useState<number>(0);

  const skills = skillsQuery.data ?? [];

  function startEdit(skill: UserSkill) {
    setEditingId(skill.id);
    setEditSkillId(skill.skillId ?? "");
    setEditName(skill.name);
    setEditProficiency(clampProficiency(skill.proficiencyLevel));
    setEditYears(
      typeof skill.yearsExperience === "number" ? skill.yearsExperience : 0,
    );
  }

  function cancelEdit() {
    setEditingId(null);
    setEditSkillId("");
    setEditName("");
    setEditProficiency(3);
    setEditYears(0);
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();

    const skillId = draftSkillId;
    const proficiencyLevel = clampProficiency(draftProficiency);
    const yearsExperience = clampYears(draftYears);

    if (!skillId) {
      toast.error("Select a skill");
      return;
    }

    const selectedSkillName =
      catalogQuery.data?.find((s) => s.id === skillId)?.name ?? "";

    try {
      await createSkill.mutateAsync({
        skillId,
        ...(selectedSkillName ? { name: selectedSkillName } : {}),
        proficiencyLevel,
        yearsExperience,
      });
      toast.success("Skill added");
      setDraftSkillId("");
      setDraftProficiency(3);
      setDraftYears(0);
    } catch {
      toast.error("Failed to add skill");
    }
  }

  async function submitUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!editingId) return;

    const name = editName.trim();
    const proficiencyLevel = clampProficiency(editProficiency);
    const yearsExperience = clampYears(editYears);

    if (!editSkillId) {
      toast.error("Select a skill");
      return;
    }

    try {
      await updateSkill.mutateAsync({
        id: editingId,
        skillId: editSkillId,
        ...(name ? { name } : {}),
        proficiencyLevel,
        yearsExperience,
      });
      toast.success("Skill updated");
      cancelEdit();
    } catch {
      toast.error("Failed to update skill");
    }
  }

  const isBusy =
    skillsQuery.isFetching || createSkill.isPending || updateSkill.isPending;

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="secondary" className="rounded-full">
            User skills
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Your skill profile
          </h1>
          <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Keep it focused: add only skills you want the system to optimize
            for.
          </div>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <Card className="rounded-[28px] p-6 shadow-sm md:p-8">
            <form
              onSubmit={submitCreate}
              className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end"
            >
              <div className="grid gap-2">
                <Label>Skill</Label>
                <Select
                  value={draftSkillId}
                  onValueChange={setDraftSkillId}
                  disabled={isBusy || catalogQuery.isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {(catalogQuery.data ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Level</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[draftProficiency]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(v) => setDraftProficiency(v[0] ?? 3)}
                    disabled={isBusy}
                  />
                  <div className="w-12 text-right text-sm tabular-nums text-muted-foreground">
                    {draftProficiency}/5
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="years-exp">Years</Label>
                <Input
                  id="years-exp"
                  inputMode="numeric"
                  type="number"
                  min={0}
                  max={50}
                  value={draftYears}
                  onChange={(e) => setDraftYears(Number(e.target.value))}
                  disabled={isBusy}
                />
              </div>

              <Button type="submit" variant="outline" disabled={isBusy}>
                {createSkill.isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
                Add
              </Button>
            </form>
          </Card>

          {skillsQuery.isLoading ? (
            <Card className="rounded-[28px] p-6 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner className="size-5" />
                Loading skills…
              </div>
            </Card>
          ) : skillsQuery.isError ? (
            <Alert variant="destructive" className="rounded-[22px]">
              <AlertTitle>Failed to load skills</AlertTitle>
              <AlertDescription>
                Please try again.
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => skillsQuery.refetch()}
                    disabled={isBusy}
                  >
                    {skillsQuery.isFetching ? (
                      <Spinner className="size-4" />
                    ) : null}
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : skills.length === 0 ? (
            <Card className="rounded-[28px] p-6 shadow-sm">
              <div className="text-sm text-muted-foreground">
                No skills yet. Add your first one above.
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {skills.map((s) => {
                const isEditing = editingId === s.id;

                return (
                  <Card key={s.id} className="rounded-[28px] p-6 shadow-sm">
                    {!isEditing ? (
                      <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium tracking-tight">
                              {s.name}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Proficiency:{" "}
                              {clampProficiency(s.proficiencyLevel)}/5
                              {typeof s.yearsExperience === "number"
                                ? ` · ${s.yearsExperience} yrs exp`
                                : ""}
                            </div>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(s)}
                            disabled={isBusy}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </div>

                        <div>
                          <Slider
                            value={[clampProficiency(s.proficiencyLevel)]}
                            min={1}
                            max={5}
                            step={1}
                            disabled
                          />
                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <span>1</span>
                            <span>5</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={submitUpdate} className="space-y-5">
                        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                          <div className="grid gap-2">
                            <Label>Skill</Label>
                            <Select
                              value={editSkillId}
                              onValueChange={(v) => {
                                setEditSkillId(v);
                                const nextName =
                                  catalogQuery.data?.find((x) => x.id === v)
                                    ?.name ?? "";
                                if (nextName) setEditName(nextName);
                              }}
                              disabled={isBusy || catalogQuery.isLoading}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a skill" />
                              </SelectTrigger>
                              <SelectContent>
                                {(catalogQuery.data ?? []).map((opt) => (
                                  <SelectItem key={opt.id} value={opt.id}>
                                    {opt.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={cancelEdit}
                              disabled={isBusy}
                            >
                              <X className="size-4" />
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isBusy}>
                              {updateSkill.isPending ? (
                                <Spinner className="size-4" />
                              ) : (
                                <Save className="size-4" />
                              )}
                              Save
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Level</Label>
                          <div className="flex items-center gap-3">
                            <Slider
                              value={[editProficiency]}
                              min={1}
                              max={5}
                              step={1}
                              onValueChange={(v) =>
                                setEditProficiency(v[0] ?? 3)
                              }
                              disabled={isBusy}
                            />
                            <div className="w-12 text-right text-sm tabular-nums text-muted-foreground">
                              {editProficiency}/5
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>1</span>
                            <span>5</span>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`years-${s.id}`}>Years</Label>
                          <Input
                            id={`years-${s.id}`}
                            inputMode="numeric"
                            type="number"
                            min={0}
                            max={50}
                            value={editYears}
                            onChange={(e) =>
                              setEditYears(Number(e.target.value))
                            }
                            disabled={isBusy}
                          />
                        </div>
                      </form>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <Card className="rounded-[28px] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-medium tracking-wide text-muted-foreground">
                STATUS
              </div>
              {skillsQuery.isFetching ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Spinner className="size-3" />
                  syncing
                </div>
              ) : null}
            </div>

            <div className="mt-2 text-lg font-semibold tracking-tight">
              Keep signals crisp
            </div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              Aim for 8–12 skills. Keep levels honest; overstatement makes match
              explanations feel off.
            </div>

            <div className="mt-5 grid gap-2">
              <Button
                variant="outline"
                onClick={() => skillsQuery.refetch()}
                disabled={isBusy}
              >
                {skillsQuery.isFetching ? <Spinner className="size-4" /> : null}
                Refresh
              </Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
