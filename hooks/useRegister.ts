"use client";

import { useMutation } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";

export type RegisterInput = {
  email: string;
  password: string;
  full_name?: string;
};

export type RegisterResponse = {
  status: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user?: unknown;
  };
};

export function useRegister() {
  return useMutation<RegisterResponse, unknown, RegisterInput>({
    mutationFn: async (payload) => {
      const { data } = await appApi.post<RegisterResponse>(
        "/api/auth/register",
        payload,
      );
      return data;
    },
  });
}
