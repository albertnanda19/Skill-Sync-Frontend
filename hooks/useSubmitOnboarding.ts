"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";

export type OnboardingSkillInput = {
  skill_id: string;
  proficiency_level: number;
  years_experience: number;
};

export type SubmitOnboardingInput = {
  experience_level?: string;
  preferred_roles?: string[];
  skills?: OnboardingSkillInput[];
};

export type SubmitOnboardingResponse = {
  status: number;
  message: string;
  data: unknown;
};

function normalizePayload(payload: SubmitOnboardingInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (typeof payload.experience_level === "string") {
    const v = payload.experience_level.trim();
    if (v) body.experience_level = v;
  }

  if (Array.isArray(payload.preferred_roles)) {
    const roles = payload.preferred_roles
      .filter((r): r is string => typeof r === "string")
      .map((r) => r.trim())
      .filter(Boolean);
    if (roles.length > 0) body.preferred_roles = roles;
  }

  if (Array.isArray(payload.skills)) {
    const skills = payload.skills
      .map((s) => {
        if (!s || typeof s !== "object") return null;
        const skillId = typeof s.skill_id === "string" ? s.skill_id : "";
        const proficiency = Number(s.proficiency_level);
        const years = Number(s.years_experience);
        if (!skillId) return null;
        if (!Number.isFinite(proficiency) || !Number.isFinite(years)) return null;
        return {
          skill_id: skillId,
          proficiency_level: Math.min(5, Math.max(1, Math.round(proficiency))),
          years_experience: Math.min(50, Math.max(0, Math.round(years))),
        };
      })
      .filter((v): v is OnboardingSkillInput => v !== null);

    if (skills.length > 0) body.skills = skills;
  }

  return body;
}

export function useSubmitOnboarding() {
  const queryClient = useQueryClient();

  return useMutation<SubmitOnboardingResponse, unknown, SubmitOnboardingInput>({
    mutationFn: async (payload) => {
      const body = normalizePayload(payload);

      if (Object.keys(body).length === 0) {
        throw new Error("Onboarding payload is empty");
      }

      const { data } = await appApi.post<SubmitOnboardingResponse>(
        "/api/users/me/onboarding",
        body,
      );
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userMe"] });
    },
  });
}
