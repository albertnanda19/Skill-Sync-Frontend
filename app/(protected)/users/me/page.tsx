"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { useUserMe } from "@/hooks/useUserMe";

import UserProfileAside from "@/components/users/UserProfileAside";
import UserProfileHeader from "@/components/users/UserProfileHeader";
import UserProfilePreferencesCard from "@/components/users/UserProfilePreferencesCard";
import UserProfileSkillsCard from "@/components/users/UserProfileSkillsCard";

export default function ProfilePage() {
  const userMeQuery = useUserMe();
  const profile = userMeQuery.data;

  return (
    <div className="min-h-screen bg-background">
      <main className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
        {/* WIREFRAME: Summary layout | Section per category | CTA inline (edit) */}
        <div className="grid gap-10">
          {userMeQuery.isLoading ? (
            <div className="rounded-[28px] border border-border bg-background/60 p-6 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Spinner className="size-5" />
                Loading profile…
              </div>
            </div>
          ) : userMeQuery.isError ? (
            <Alert variant="destructive" className="rounded-[22px]">
              <AlertTitle>Failed to load profile</AlertTitle>
              <AlertDescription>
                Please try again.
                <div className="mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => userMeQuery.refetch()}
                    disabled={userMeQuery.isFetching}
                  >
                    {userMeQuery.isFetching ? (
                      <Spinner className="size-4" />
                    ) : null}
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : !profile ? (
            <Alert className="rounded-[22px]">
              <AlertTitle>Profile not available</AlertTitle>
              <AlertDescription>Please refresh the page.</AlertDescription>
            </Alert>
          ) : (
            <>
              <UserProfileHeader
                email={profile.email}
                fullName={profile.full_name}
              />

              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="space-y-6">
                  <UserProfileSkillsCard
                    core={profile.skills.core}
                    developing={profile.skills.developing}
                  />

                  <UserProfilePreferencesCard
                    preferredRoles={profile.preferences.preferred_roles}
                    preferenceLocation={profile.preferences.preference_location}
                    experienceLevel={profile.preferences.experience_level}
                  />
                </section>

                <UserProfileAside createdAt={profile.created_at} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
