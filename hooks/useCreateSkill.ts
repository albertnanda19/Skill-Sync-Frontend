"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";
import type { UserSkill } from "@/hooks/useUserSkills";

export type CreateSkillInput = {
  skillId: string;
  name?: string;
  proficiencyLevel: number;
  yearsExperience?: number;
};

export type CreateSkillResponse = {
  status: number;
  message: string;
  data: unknown;
};

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation<CreateSkillResponse, unknown, CreateSkillInput, { prev?: UserSkill[] }>({
    mutationFn: async (payload) => {
      const body: Record<string, unknown> = {
        skill_id: payload.skillId,
        proficiency_level: payload.proficiencyLevel,
      };

      if (typeof payload.yearsExperience === "number") {
        body.years_experience = payload.yearsExperience;
      }

      const { data } = await appApi.post<CreateSkillResponse>(
        "/api/users/me/skills",
        body,
      );
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userSkills"] });
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["userSkills"] });

      const prev = queryClient.getQueryData<UserSkill[]>(["userSkills"]);
      if (!prev) return { prev };

      const optimistic: UserSkill = {
        id: `optimistic-${Date.now()}`,
        ...(payload.name ? { name: payload.name } : { name: "" }),
        skillId: payload.skillId,
        proficiencyLevel: payload.proficiencyLevel,
        ...(typeof payload.yearsExperience === "number"
          ? { yearsExperience: payload.yearsExperience }
          : {}),
      };

      queryClient.setQueryData<UserSkill[]>(["userSkills"], [optimistic, ...prev]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["userSkills"], ctx.prev);
    },
  });
}
