"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";

export type CreateSkillCatalogInput = {
  name: string;
};

export type CreateSkillCatalogResponse = {
  status: number;
  message: string;
  data: {
    id: string;
    name: string;
  };
};

export function useCreateSkillCatalog() {
  const queryClient = useQueryClient();

  return useMutation<CreateSkillCatalogResponse, unknown, CreateSkillCatalogInput>({
    mutationFn: async (payload) => {
      const { data } = await appApi.post<CreateSkillCatalogResponse>(
        "/api/skills",
        payload,
      );
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["skillsCatalog"] });
    },
  });
}
