"use client";

import { useQuery } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";

export type SkillCatalogItem = {
  id: string;
  name: string;
};

type SkillsCatalogResponse = {
  status: number;
  message: string;
  data: unknown;
};

function normalizeCatalog(payload: unknown): SkillCatalogItem[] {
  const root = payload as { data?: unknown };
  const data = typeof root === "object" && root && "data" in root ? root.data : payload;

  if (!Array.isArray(data)) return [];

  return data
    .map((item): SkillCatalogItem | null => {
      const s = item as { id?: unknown; name?: unknown };
      const id = typeof s.id === "string" ? s.id : "";
      const name = typeof s.name === "string" ? s.name : "";
      if (!id || !name) return null;
      return { id, name };
    })
    .filter((v): v is SkillCatalogItem => v !== null);
}

export function useSkillsCatalog() {
  return useQuery<SkillCatalogItem[], unknown>({
    queryKey: ["skillsCatalog"],
    queryFn: async () => {
      const { data } = await appApi.get<SkillsCatalogResponse>("/api/skills");
      return normalizeCatalog(data);
    },
    staleTime: 1000 * 60 * 10,
  });
}
