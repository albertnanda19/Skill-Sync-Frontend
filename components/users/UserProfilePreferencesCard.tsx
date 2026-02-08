"use client";

import Link from "next/link";
import * as React from "react";
import { Pencil } from "lucide-react";

import { toTitleCase } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  preferredRoles: string[];
  preferenceLocation: string | null;
  experienceLevel: string | null;
};

function renderValue(v: string | null) {
  return v && v.trim() ? toTitleCase(v) : "—";
}

function RoleChips({ roles }: { roles: string[] }) {
  if (roles.length === 0) {
    return <div className="text-sm text-muted-foreground">—</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((r) => (
        <Badge
          key={r}
          variant="outline"
          className="rounded-full bg-background/70 text-foreground"
        >
          {toTitleCase(r)}
        </Badge>
      ))}
    </div>
  );
}

const UserProfilePreferencesCard = ({
  preferredRoles,
  preferenceLocation,
  experienceLevel,
}: Props) => {
  const locationValue = renderValue(preferenceLocation);
  const levelValue = renderValue(experienceLevel);

  return (
    <Card className="rounded-[28px] border-border bg-background/60 shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg tracking-tight">
              Preferences
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              Roles, location, and experience
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/profile/preferences">
              <Pencil className="size-4" />
              Edit Preferences
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-2xl bg-muted/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">Preferred roles</div>
            <div className="text-xs tabular-nums text-muted-foreground">
              {preferredRoles.length}
            </div>
          </div>
          <div className="mt-3">
            <RoleChips roles={preferredRoles} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-background/70 p-5">
            <div className="relative">
              <div className="text-xs font-medium tracking-wide text-muted-foreground">
                LOCATION
              </div>
              <div className="mt-2 text-lg font-semibold tracking-tight">
                {locationValue}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Where you want to work
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-background/70 p-5">
            <div className="relative">
              <div className="text-xs font-medium tracking-wide text-muted-foreground">
                EXPERIENCE
              </div>
              <div className="mt-2 text-lg font-semibold tracking-tight">
                {levelValue}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Current seniority
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(UserProfilePreferencesCard);
