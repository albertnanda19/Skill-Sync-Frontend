"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function RecommendationsEmptyState() {
  return (
    <div className="rounded-[28px] border bg-card px-6 py-14 shadow-sm">
      <Empty className="border-0 p-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No recommendations yet</EmptyTitle>
          <EmptyDescription>
            Complete your skill profile to get personalized job recommendations.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/users/skills">Update Skills</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
