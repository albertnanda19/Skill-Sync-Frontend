"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";

type ApiEnvelope<T> = {
  status: number;
  message: string;
  data: T;
};

export type UserProfileFlat = {
  id: string;
  email: string;
  full_name: string | null;
  experience_level: string | null;
  preference_location: string | null;
  preferred_roles: string[];
  created_at: string;
};

export type UpdateUserMeInput = {
  full_name?: string;
  experience_level?: string;
  preference_location?: string;
  preferred_roles?: string[];
};

function normalizeString(value: string | undefined) {
  if (typeof value !== "string") return undefined;
  const t = value.trim();
  return t ? t : undefined;
}

function normalizeRoles(value: string[] | undefined) {
  if (!Array.isArray(value)) return undefined;
  const roles = value
    .map((r) => (typeof r === "string" ? r.trim() : ""))
    .filter(Boolean);
  return roles.length ? roles : undefined;
}

function buildPayload(input: UpdateUserMeInput) {
  const payload: Record<string, unknown> = {};

  const full_name = normalizeString(input.full_name);
  const experience_level = normalizeString(input.experience_level);
  const preference_location = normalizeString(input.preference_location);
  const preferred_roles = normalizeRoles(input.preferred_roles);

  if (full_name) payload.full_name = full_name;
  if (experience_level) payload.experience_level = experience_level;
  if (preference_location) payload.preference_location = preference_location;
  if (preferred_roles) payload.preferred_roles = preferred_roles;

  return payload;
}

export function useUpdateUserMe() {
  const queryClient = useQueryClient();

  return useMutation<ApiEnvelope<UserProfileFlat>, unknown, UpdateUserMeInput>({
    mutationFn: async (input) => {
      const body = buildPayload(input);

      if (Object.keys(body).length === 0) {
        throw new Error("Invalid request payload");
      }

      const { data } = await appApi.put<ApiEnvelope<UserProfileFlat>>(
        "/api/users/me",
        body,
      );
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userMe"] });
    },
  });
}
