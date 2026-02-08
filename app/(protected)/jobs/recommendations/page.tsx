import RecommendationsClient from "@/components/jobs/recommendations/RecommendationsClient";

export default function JobRecommendationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        <RecommendationsClient />
      </main>
    </div>
  );
}
