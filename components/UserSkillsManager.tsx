"use client";

import Link from "next/link";
import * as React from "react";
import {
  Check,
  ChevronsUpDown,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useCreateSkill } from "@/hooks/useCreateSkill";
import { useCreateSkillCatalog } from "@/hooks/useCreateSkillCatalog";
import { useDeleteSkill } from "@/hooks/useDeleteSkill";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const createCatalogSkill = useCreateSkillCatalog();
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();

  const [draftSkillId, setDraftSkillId] = React.useState<string>("");
  const [draftSkillName, setDraftSkillName] = React.useState<string>("");
  const [draftSkillOpen, setDraftSkillOpen] = React.useState(false);
  const [draftSkillSearch, setDraftSkillSearch] = React.useState("");
  const [draftProficiency, setDraftProficiency] = React.useState<number>(3);
  const [draftYears, setDraftYears] = React.useState<number>(0);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editSkillId, setEditSkillId] = React.useState<string>("");
  const [editName, setEditName] = React.useState("");
  const [editSkillOpen, setEditSkillOpen] = React.useState(false);
  const [editSkillSearch, setEditSkillSearch] = React.useState("");
  const [editProficiency, setEditProficiency] = React.useState<number>(3);
  const [editYears, setEditYears] = React.useState<number>(0);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const skills = skillsQuery.data ?? [];
  const catalog = catalogQuery.data ?? [];

  const draftMatches = React.useMemo(() => {
    const q = draftSkillSearch.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((s) => s.name.toLowerCase().includes(q));
  }, [catalog, draftSkillSearch]);

  const editMatches = React.useMemo(() => {
    const q = editSkillSearch.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((s) => s.name.toLowerCase().includes(q));
  }, [catalog, editSkillSearch]);

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
    setEditSkillSearch("");
    setEditSkillOpen(false);
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
      catalog.find((s) => s.id === skillId)?.name ?? draftSkillName;

    try {
      await createSkill.mutateAsync({
        skillId,
        ...(selectedSkillName ? { name: selectedSkillName } : {}),
        proficiencyLevel,
        yearsExperience,
      });
      toast.success("Skill added");
      setDraftSkillId("");
      setDraftSkillName("");
      setDraftSkillSearch("");
      setDraftSkillOpen(false);
      setDraftProficiency(3);
      setDraftYears(0);
    } catch {
      toast.error("Failed to add skill");
    }
  }

  async function submitUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!editingId) return;

    const proficiencyLevel = clampProficiency(editProficiency);
    const yearsExperience = clampYears(editYears);

    try {
      await updateSkill.mutateAsync({
        id: editingId,
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
    skillsQuery.isFetching ||
    createSkill.isPending ||
    updateSkill.isPending ||
    deleteSkill.isPending;

  return (
    <div className="grid gap-10">
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-background/60 p-6 shadow-sm">
        <div className="pointer-events-none absolute -left-24 -bottom-24 size-72 rounded-full bg-secondary/50 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
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
            <Link href="/jobs">Back to jobs</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <Card className="relative overflow-hidden rounded-[28px] border border-border bg-background/60 p-6 shadow-sm md:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
            <form
              onSubmit={submitCreate}
              className="relative grid gap-3 md:grid-cols-[1fr_auto] md:items-end"
            >
              <div className="grid gap-2">
                <Label>Skill</Label>
                <Popover open={draftSkillOpen} onOpenChange={setDraftSkillOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={draftSkillOpen}
                      className="w-full justify-between"
                      disabled={isBusy || catalogQuery.isLoading}
                    >
                      <span className="truncate">
                        {draftSkillId
                          ? catalog.find((s) => s.id === draftSkillId)?.name ||
                            draftSkillName
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
                              createCatalogSkill.isPending ||
                              !draftSkillSearch.trim()
                            }
                            onClick={async () => {
                              const term = draftSkillSearch.trim();
                              if (!term) return;
                              try {
                                const res =
                                  await createCatalogSkill.mutateAsync({
                                    name: term,
                                  });
                                const created = res?.data;
                                if (!created?.id) {
                                  toast.error("Failed to create skill");
                                  return;
                                }
                                toast.success("Skill created");
                                setDraftSkillId(created.id);
                                setDraftSkillName(created.name);
                                setDraftSkillSearch("");
                                setDraftSkillOpen(false);
                              } catch {
                                toast.error("Failed to create skill");
                              }
                            }}
                          >
                            {createCatalogSkill.isPending ? (
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
            <Card className="rounded-[28px] border border-border bg-background/60 p-6 shadow-sm">
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
            <Card className="rounded-[28px] border border-border bg-background/60 p-6 shadow-sm">
              <div className="text-sm text-muted-foreground">
                No skills yet. Add your first one above.
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {skills.map((s) => {
                const isEditing = editingId === s.id;
                const isOptimistic = s.id.startsWith("optimistic-");

                return (
                  <Card
                    key={s.id}
                    className="relative overflow-hidden rounded-[28px] border border-border bg-background/60 p-6 shadow-sm"
                  >
                    <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
                    <div className="relative">
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

                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => startEdit(s)}
                                disabled={isBusy}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                  setDeleteTarget({ id: s.id, name: s.name });
                                  setDeleteDialogOpen(true);
                                }}
                                disabled={isBusy || isOptimistic}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
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
                              <Popover
                                open={editSkillOpen}
                                onOpenChange={setEditSkillOpen}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={editSkillOpen}
                                    className="w-full justify-between"
                                    disabled={isBusy || catalogQuery.isLoading}
                                  >
                                    <span className="truncate">
                                      {editSkillId
                                        ? catalog.find(
                                            (s2) => s2.id === editSkillId,
                                          )?.name || editName
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
                                      value={editSkillSearch}
                                      onValueChange={setEditSkillSearch}
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          className="h-auto w-full justify-start px-2 py-2"
                                          disabled={
                                            createCatalogSkill.isPending ||
                                            !editSkillSearch.trim()
                                          }
                                          onClick={async () => {
                                            const term = editSkillSearch.trim();
                                            if (!term) return;
                                            try {
                                              const res =
                                                await createCatalogSkill.mutateAsync(
                                                  { name: term },
                                                );
                                              const created = res?.data;
                                              if (!created?.id) {
                                                toast.error(
                                                  "Failed to create skill",
                                                );
                                                return;
                                              }
                                              toast.success("Skill created");
                                              setEditSkillId(created.id);
                                              setEditName(created.name);
                                              setEditSkillSearch("");
                                              setEditSkillOpen(false);
                                            } catch {
                                              toast.error(
                                                "Failed to create skill",
                                              );
                                            }
                                          }}
                                        >
                                          {createCatalogSkill.isPending ? (
                                            <Spinner className="size-4" />
                                          ) : (
                                            <Plus className="size-4" />
                                          )}
                                          Add "{editSkillSearch.trim()}"
                                        </Button>
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {editMatches.map((opt) => (
                                          <CommandItem
                                            key={opt.id}
                                            value={opt.name}
                                            onSelect={() => {
                                              setEditSkillId(opt.id);
                                              setEditName(opt.name);
                                              setEditSkillOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={
                                                editSkillId === opt.id
                                                  ? "size-4 opacity-100"
                                                  : "size-4 opacity-0"
                                              }
                                            />
                                            {opt.name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
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
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <Card className="relative overflow-hidden rounded-[28px] border border-border bg-background/60 p-6 shadow-sm">
            <div className="pointer-events-none absolute -left-20 -bottom-20 size-56 rounded-full bg-secondary/50 blur-3xl" />
            <div className="relative">
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
                Aim for 8–12 skills. Keep levels honest; overstatement makes
                match explanations feel off.
              </div>

              <div className="mt-5 grid gap-2">
                <Button
                  variant="outline"
                  onClick={() => skillsQuery.refetch()}
                  disabled={isBusy}
                >
                  {skillsQuery.isFetching ? (
                    <Spinner className="size-4" />
                  ) : null}
                  Refresh
                </Button>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (deleteSkill.isPending) return;
          setDeleteDialogOpen(open);
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete skill?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will remove “${deleteTarget.name}” from your profile.`
                : "This will remove the skill from your profile."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSkill.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!deleteTarget || deleteSkill.isPending}
              onClick={async (e) => {
                e.preventDefault();
                if (!deleteTarget) return;

                try {
                  if (editingId === deleteTarget.id) cancelEdit();
                  await deleteSkill.mutateAsync({ id: deleteTarget.id });
                  toast.success("Skill deleted");
                  setDeleteDialogOpen(false);
                  setDeleteTarget(null);
                } catch {
                  toast.error("Failed to delete skill");
                }
              }}
            >
              {deleteSkill.isPending ? <Spinner className="size-4" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
