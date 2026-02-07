"use client";

import { useQuery } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";

export type UserSkill = {
  id: string;
  skillId?: string;
  name: string;
  proficiencyLevel: number;
  yearsExperience?: number;
};

export type UserSkillsResponse = {
  status: number;
  message: string;
  data: unknown;
};

function normalizeSkills(payload: unknown): UserSkill[] {
  if (!payload) return [];

  const root = payload as { data?: unknown };
  const data = typeof root === "object" && root && "data" in root ? root.data : payload;

  const list = Array.isArray(data)
    ? data
    : typeof data === "object" && data && "skills" in data && Array.isArray((data as { skills?: unknown }).skills)
      ? ((data as { skills?: unknown }).skills as unknown[])
      : [];
  return list
    .map((item): UserSkill | null => {
      const s = item as {
        id?: unknown;
        _id?: unknown;
        skill_id?: unknown;
        name?: unknown;
        skill_name?: unknown;
        level?: unknown;
        proficiency_level?: unknown;
        proficiencyLevel?: unknown;
        years_experience?: unknown;
        yearsExperience?: unknown;
      };
      const id =
        (typeof s.id === "string" && s.id) ||
        (typeof s._id === "string" && s._id) ||
        "";

      const skillId = typeof s.skill_id === "string" ? s.skill_id : undefined;
      const name =
        typeof s.skill_name === "string"
          ? s.skill_name
          : typeof s.name === "string"
            ? s.name
            : "";

      const rawProficiency =
        typeof s.proficiency_level === "number"
          ? s.proficiency_level
          : typeof s.proficiencyLevel === "number"
            ? s.proficiencyLevel
            : typeof s.level === "number"
              ? s.level
              : Number(s.proficiency_level ?? s.proficiencyLevel ?? s.level ?? 0);

      const rawYears =
        typeof s.years_experience === "number"
          ? s.years_experience
          : typeof s.yearsExperience === "number"
            ? s.yearsExperience
            : Number(s.years_experience ?? s.yearsExperience ?? 0);

      const proficiencyLevel = Number.isFinite(rawProficiency)
        ? rawProficiency
        : 0;
      const yearsExperience = Number.isFinite(rawYears) ? rawYears : undefined;

      if (!id || !name) return null;

      return {
        id,
        ...(skillId ? { skillId } : {}),
        name,
        proficiencyLevel,
        ...(typeof yearsExperience === "number" ? { yearsExperience } : {}),
      };
    })
    .filter((v): v is UserSkill => v !== null);
}

export function useUserSkills() {
  return useQuery<UserSkill[], unknown>({
    queryKey: ["userSkills"],
    queryFn: async () => {
      const { data } = await appApi.get<UserSkillsResponse>("/api/users/me/skills");
      return normalizeSkills(data);
    },
  });
}
