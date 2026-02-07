"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";
import type { UserSkill } from "@/hooks/useUserSkills";

export type DeleteSkillInput = {
  id: string;
};

export type DeleteSkillResponse = {
  status: number;
  message: string;
  data: null;
};

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation<DeleteSkillResponse, unknown, DeleteSkillInput, { prev?: UserSkill[] }>({
    mutationFn: async ({ id }) => {
      const { data } = await appApi.delete<DeleteSkillResponse>(
        `/api/users/me/skills/${id}`,
      );
      return data;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["userSkills"] });
      const prev = queryClient.getQueryData<UserSkill[]>(["userSkills"]);

      if (!prev) return { prev };

      queryClient.setQueryData<UserSkill[]>(
        ["userSkills"],
        prev.filter((s) => s.id !== id),
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
