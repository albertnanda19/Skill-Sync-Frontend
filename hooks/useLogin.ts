"use client";

import { useMutation } from "@tanstack/react-query";

import { appApi } from "@/lib/axios";

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  status: number;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
};

export function useLogin() {
  return useMutation<LoginResponse, unknown, LoginInput>({
    mutationFn: async (payload) => {
      const { data } = await appApi.post<LoginResponse>("/api/auth/login", payload);
      return data;
    },
  });
}
