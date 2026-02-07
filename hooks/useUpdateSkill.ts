"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";
import type { UserSkill } from "@/hooks/useUserSkills";

export type UpdateSkillInput = {
  id: string;
  skillId?: string;
  name?: string;
  proficiencyLevel: number;
  yearsExperience?: number;
};

export type UpdateSkillResponse = {
  status: number;
  message: string;
  data: unknown;
};

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateSkillResponse,
    unknown,
    UpdateSkillInput,
    { prev?: UserSkill[] }
  >({
    mutationFn: async ({ id, ...payload }) => {
      const body: Record<string, unknown> = {
        proficiency_level: payload.proficiencyLevel,
      };

      if (typeof payload.skillId === "string" && payload.skillId) {
        body.skill_id = payload.skillId;
      }

      if (typeof payload.yearsExperience === "number") {
        body.years_experience = payload.yearsExperience;
      }

      const { data } = await appApi.put<UpdateSkillResponse>(
        `/api/users/me/skills/${encodeURIComponent(id)}`,
        body,
      );
      return data;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["userSkills"] });
      const prev = queryClient.getQueryData<UserSkill[]>(["userSkills"]);

      if (!prev) return { prev };

      queryClient.setQueryData<UserSkill[]>(
        ["userSkills"],
        prev.map((s) =>
          s.id === payload.id
            ? {
                ...s,
                ...(payload.name ? { name: payload.name } : {}),
                ...(payload.skillId ? { skillId: payload.skillId } : {}),
                proficiencyLevel: payload.proficiencyLevel,
                ...(typeof payload.yearsExperience === "number"
                  ? { yearsExperience: payload.yearsExperience }
                  : {}),
              }
            : s,
        ),
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["userSkills"], ctx.prev);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userSkills"] });
    },
  });
}
