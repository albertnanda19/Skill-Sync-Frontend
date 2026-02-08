"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";

import { useUserMe } from "@/hooks/useUserMe";
import { useUpdateUserMe } from "@/hooks/useUpdateUserMe";

import { toTitleCase } from "@/lib/utils";

const formSchema = z.object({
  fullName: z.string().optional(),
  preferredRoles: z.string().optional(),
  experienceLevel: z.string().optional(),
  preferenceLocation: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function parseRoles(value: string | undefined) {
  if (!value) return undefined;
  const roles = value
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  return roles.length ? roles : undefined;
}

function formatOrDash(value: string | undefined) {
  const t = typeof value === "string" ? value.trim() : "";
  return t ? toTitleCase(t) : "—";
}

const PreferencesPreview = React.memo(
  ({
    fullName,
    preferredRoles,
    experienceLevel,
    preferenceLocation,
  }: {
    fullName: string | undefined;
    preferredRoles: string | undefined;
    experienceLevel: string | undefined;
    preferenceLocation: string | undefined;
  }) => {
    const roles = parseRoles(preferredRoles) ?? [];

    return (
      <Card className="relative overflow-hidden rounded-[28px] border-border bg-background/60 p-6 shadow-sm">
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium tracking-wide text-muted-foreground">
                PREVIEW
              </div>
              <div className="mt-1 text-lg font-semibold tracking-tight">
                {formatOrDash(fullName)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                This is how your profile signal will read.
              </div>
            </div>
            <Badge
              variant="outline"
              className="rounded-full bg-background/70 text-foreground"
            >
              Live
            </Badge>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl bg-muted/30 p-4">
              <div className="text-xs font-medium tracking-wide text-muted-foreground">
                ROLES
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {roles.length ? (
                  roles.map((r) => (
                    <Badge
                      key={r}
                      variant="outline"
                      className="rounded-full bg-background/70 text-foreground"
                    >
                      {toTitleCase(r)}
                    </Badge>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">—</div>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/30 p-4">
                <div className="text-xs font-medium tracking-wide text-muted-foreground">
                  LOCATION
                </div>
                <div className="mt-2 text-sm font-semibold tracking-tight">
                  {formatOrDash(preferenceLocation)}
                </div>
              </div>
              <div className="rounded-2xl bg-muted/30 p-4">
                <div className="text-xs font-medium tracking-wide text-muted-foreground">
                  EXPERIENCE
                </div>
                <div className="mt-2 text-sm font-semibold tracking-tight">
                  {formatOrDash(experienceLevel)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  },
);

export default function PreferencesPage() {
  const router = useRouter();
  const userMeQuery = useUserMe();
  const updateUserMe = useUpdateUserMe();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      preferredRoles: "",
      experienceLevel: "",
      preferenceLocation: "",
    },
    mode: "onSubmit",
  });

  React.useEffect(() => {
    const p = userMeQuery.data;
    if (!p) return;

    form.reset({
      fullName: p.full_name ?? "",
      preferredRoles: p.preferences.preferred_roles?.join(", ") ?? "",
      experienceLevel: p.preferences.experience_level ?? "",
      preferenceLocation: p.preferences.preference_location ?? "",
    });
  }, [form, userMeQuery.data]);

  const isBusy =
    userMeQuery.isLoading || updateUserMe.isPending || userMeQuery.isFetching;

  const [fullName, preferredRoles, experienceLevel, preferenceLocation] =
    useWatch({
      control: form.control,
      name: [
        "fullName",
        "preferredRoles",
        "experienceLevel",
        "preferenceLocation",
      ],
    });

  async function onSubmit(values: FormValues) {
    try {
      await updateUserMe.mutateAsync({
        full_name: values.fullName,
        experience_level: values.experienceLevel,
        preference_location: values.preferenceLocation,
        preferred_roles: parseRoles(values.preferredRoles),
      });
      toast.success("Preferences saved");
      router.push("/users/me");
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message ? err.message : "Failed to save";
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        {/* WIREFRAME: Simple form | Focus on clarity */}
        <div className="grid gap-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="rounded-full">
                Preferences
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Set your constraints
              </h1>
              <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
                These preferences shape what jobs appear first—and how strict
                the match scoring is.
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-[28px]">
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg tracking-tight">
                  Matching preferences
                </CardTitle>
                <CardDescription className="text-sm leading-6">
                  Clear inputs produce clear explanations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    className="grid gap-6"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Albert Nanda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredRoles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred roles</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Frontend Engineer, Fullstack"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-2 md:grid-cols-2 md:items-start">
                      <FormField
                        control={form.control}
                        name="experienceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Experience level</FormLabel>
                            <Select
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
                              disabled={isBusy}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Junior">Junior</SelectItem>
                                <SelectItem value="Mid">Mid</SelectItem>
                                <SelectItem value="Senior">Senior</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferenceLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location preference</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Remote, Jakarta, Singapore"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button variant="outline" asChild disabled={isBusy}>
                        <Link href="/users/me">Cancel</Link>
                      </Button>
                      <Button type="submit" disabled={isBusy}>
                        {updateUserMe.isPending ? (
                          <Spinner className="size-4" />
                        ) : null}
                        Save Preferences
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="lg:pt-2">
              <PreferencesPreview
                fullName={fullName}
                preferredRoles={preferredRoles}
                experienceLevel={experienceLevel}
                preferenceLocation={preferenceLocation}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
