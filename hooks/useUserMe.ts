"use client";

import { useQuery } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";

export type UserMeSkill = {
  skill_name: string;
  proficiency_level: number;
  years_experience: number;
};

export type UserMeResponse = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  skills: {
    core: UserMeSkill[];
    developing: UserMeSkill[];
  };
  preferences: {
    preferred_roles: string[];
    preference_location: string | null;
    experience_level: string | null;
  };
};

type ApiEnvelope<T> = {
  status: number;
  message: string;
  data: T;
};

function isUserMeSkill(v: unknown): v is UserMeSkill {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.skill_name === "string" &&
    typeof s.proficiency_level === "number" &&
    typeof s.years_experience === "number"
  );
}

function normalizeUserMe(payload: unknown): UserMeResponse {
  const root = payload as { data?: unknown };
  const data =
    typeof root === "object" && root && "data" in root ? root.data : payload;

  if (!data || typeof data !== "object") {
    throw new Error("Invalid profile response");
  }

  const u = data as Record<string, unknown>;

  const id = typeof u.id === "string" ? u.id : "";
  const email = typeof u.email === "string" ? u.email : "";
  const created_at = typeof u.created_at === "string" ? u.created_at : "";

  if (!id || !email || !created_at) {
    throw new Error("Invalid profile response");
  }

  const full_name =
    u.full_name === null || typeof u.full_name === "string" ? u.full_name : null;

  const rawSkills = (u.skills ?? {}) as Record<string, unknown>;
  const coreRaw = Array.isArray(rawSkills.core) ? rawSkills.core : [];
  const developingRaw = Array.isArray(rawSkills.developing)
    ? rawSkills.developing
    : [];

  const allSkills = [...coreRaw, ...developingRaw].filter(isUserMeSkill);

  const core: UserMeSkill[] = [];
  const developing: UserMeSkill[] = [];

  for (const s of allSkills) {
    const isCore = s.proficiency_level >= 4 || s.years_experience >= 3;
    (isCore ? core : developing).push(s);
  }

  const rawPreferences = (u.preferences ?? {}) as Record<string, unknown>;
  const preferred_roles = Array.isArray(rawPreferences.preferred_roles)
    ? rawPreferences.preferred_roles.filter((r): r is string => typeof r === "string")
    : [];

  const preference_location =
    rawPreferences.preference_location === null ||
    typeof rawPreferences.preference_location === "string"
      ? (rawPreferences.preference_location as string | null)
      : null;

  const experience_level =
    rawPreferences.experience_level === null ||
    typeof rawPreferences.experience_level === "string"
      ? (rawPreferences.experience_level as string | null)
      : null;

  return {
    id,
    email,
    full_name,
    created_at,
    skills: {
      core,
      developing,
    },
    preferences: {
      preferred_roles,
      preference_location,
      experience_level,
    },
  };
}

export function useUserMe() {
  return useQuery<UserMeResponse, unknown>({
    queryKey: ["userMe"],
    queryFn: async () => {
      const { data } = await appApi.get<ApiEnvelope<unknown>>("/api/users/me");
      return normalizeUserMe(data);
    },
  });
}
