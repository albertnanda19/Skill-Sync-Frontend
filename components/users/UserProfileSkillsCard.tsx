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
import { Progress } from "@/components/ui/progress";

import type { UserMeSkill } from "@/hooks/useUserMe";

type Props = {
  core: UserMeSkill[];
};

function SkillList({ skills }: { skills: UserMeSkill[] }) {
  if (skills.length === 0) {
    return <div className="mt-2 text-sm text-muted-foreground">—</div>;
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {skills.map((s) => {
        const prof = Math.min(5, Math.max(0, s.proficiency_level));
        const value = (prof / 5) * 100;

        return (
          <div
            key={`${s.skill_name}-${s.proficiency_level}-${s.years_experience}`}
            className="rounded-2xl border border-border bg-background/60 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-tight">
                  {toTitleCase(s.skill_name)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Proficiency {prof}/5
                </div>
              </div>

              <Badge variant="secondary" className="shrink-0 tabular-nums">
                {s.years_experience} yrs
              </Badge>
            </div>

            <div className="mt-3">
              <Progress value={value} className="h-2" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const UserProfileSkillsCard = ({ core }: Props) => {
  return (
    <Card className="rounded-[28px]">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg tracking-tight">Skills</CardTitle>
            <CardDescription className="text-sm leading-6">
              Your skills—plus proficiency
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/users/skills">
              <Pencil className="size-4" />
              Edit Skills
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="rounded-2xl bg-muted/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">Core skills</div>
            <div className="text-xs tabular-nums text-muted-foreground">
              {core.length}
            </div>
          </div>
          <SkillList skills={core} />
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(UserProfileSkillsCard);
