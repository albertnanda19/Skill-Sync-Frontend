"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { toTitleCase } from "@/lib/utils";

type Props = {
  email: string;
  fullName: string | null;
};

const UserProfileHeader = ({ email, fullName }: Props) => {
  const displayNameRaw = fullName && fullName.trim() ? fullName : email;
  const displayName =
    fullName && fullName.trim() ? displayNameRaw : toTitleCase(displayNameRaw);

  const initials = React.useMemo(() => {
    const base = (fullName && fullName.trim() ? fullName : email).trim();
    const parts = base
      .replace(/[@._-]+/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    const letters = parts.map((p) => p.charAt(0).toUpperCase()).join("");
    return letters || "U";
  }, [email, fullName]);

  return (
    <div className="rounded-[28px] border border-border bg-background/60 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="relative grid size-12 place-items-center rounded-2xl border border-border bg-background/70 text-sm font-semibold tracking-tight">
              {initials}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                Profile
              </Badge>
              <div className="text-xs text-muted-foreground">{email}</div>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {displayName}
            </h1>
            <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Your matching profile is built from your skills and preferences.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserProfileHeader);
