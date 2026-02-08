import UserSkillsManager from "@/components/UserSkillsManager";

export default function UserSkillsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 size-112 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 size-120 rounded-full bg-secondary/50 blur-3xl" />
      </div>
      <main className="relative mx-auto w-full max-w-6xl px-6 pb-28 pt-12">
        <UserSkillsManager />
      </main>
    </div>
  );
}
