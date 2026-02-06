import Link from "next/link";

import { ArrowRight, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function EmptyStatePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* WIREFRAME: Empty state (no job match) */}
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-14">
        <Empty className="w-full rounded-[28px] border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No matches yet</EmptyTitle>
            <EmptyDescription>
              This usually means your skills are too broad or too thin. Tighten your profile and try again.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/profile/skills">
                  Add skills
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/jobs">Browse jobs anyway</Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
