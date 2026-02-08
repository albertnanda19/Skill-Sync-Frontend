import JobsClient from "@/components/jobs/JobsClient";

export default function JobsListingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <main className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        {/* WIREFRAME: Search & filter horizontal di atas | List vertikal (bukan card grid) | Match score selalu terlihat */}
        <div className="flex flex-col gap-8">
          <header className="relative overflow-hidden rounded-[28px] border border-border bg-background/60 px-6 py-10 shadow-sm md:px-10">
            <div className="relative mx-auto max-w-2xl text-center">
              <div className="text-xs font-medium tracking-wide text-muted-foreground">
                JOBS
              </div>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Find roles that match your skills—fast.
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Use precise filters, scan match signals, and focus on
                opportunities that align with your current strengths and next
                growth areas.
              </p>
            </div>
          </header>

          <JobsClient />
        </div>
      </main>
    </div>
  );
}
