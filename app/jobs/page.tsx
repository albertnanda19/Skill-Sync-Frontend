import Link from "next/link";

import { Button } from "@/components/ui/button";
import JobsSectionNav from "@/components/jobs/JobsSectionNav";
import JobsClient from "@/components/jobs/JobsClient";

export default function JobsListingPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        {/* WIREFRAME: Search & filter horizontal di atas | List vertikal (bukan card grid) | Match score selalu terlihat */}
        <div className="flex flex-col gap-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs font-medium tracking-wide text-muted-foreground">
                JOBS
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Browse with clarity
              </h1>
            </div>
            <div className="flex flex-col items-end gap-3">
              <JobsSectionNav
                items={[
                  { label: "Browse", href: "/jobs" },
                  {
                    label: "Recommendations",
                    href: "/jobs/recommendations",
                  },
                ]}
              />
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </div>

          <JobsClient />
        </div>
      </main>
    </div>
  );
}
