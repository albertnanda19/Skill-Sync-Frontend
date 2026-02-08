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
    <div className="relative overflow-hidden rounded-[28px] border bg-card px-6 py-14 shadow-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-indigo-600/10 via-violet-600/5 to-transparent" />
      <Empty className="relative border-0 p-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Sparkles className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No jobs found</EmptyTitle>
          <EmptyDescription>
            Update your skills to improve matching, or browse available roles
            and come back for refreshed recommendations.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/users/skills">Update Skills</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
