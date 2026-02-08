"use client";

import * as React from "react";

import { Card } from "@/components/ui/card";

type Props = {
  createdAt: string;
};

function formatUtcIso(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(t));
}

const UserProfileAside = ({ createdAt }: Props) => {
  return (
    <aside className="space-y-4">
      <Card className="relative overflow-hidden rounded-[28px] border-border bg-background/60 p-6 shadow-sm">
        <div className="absolute -right-14 -top-14 size-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="text-xs font-medium tracking-wide text-muted-foreground">
            ACCOUNT
          </div>
          <div className="mt-2 text-lg font-semibold tracking-tight">
            Member since
          </div>
          <div className="mt-2 text-sm leading-6 text-muted-foreground">
            {formatUtcIso(createdAt)}
          </div>
        </div>
      </Card>
    </aside>
  );
};

export default React.memo(UserProfileAside);
