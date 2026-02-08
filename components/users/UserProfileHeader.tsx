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

  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="space-y-2">
        <Badge variant="secondary" className="rounded-full">
          Profile
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {displayName}
        </h1>
        <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Your matching profile is built from your skills and preferences.
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserProfileHeader);
