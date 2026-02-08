import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { backendApi } from "@/lib/axios";

type BackendResponse<T> = {
  status: number;
  message: string;
  data: T;
};

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function POST(req: Request) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ message: "Missing access token" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    const { data } = await backendApi.post<BackendResponse<unknown>>(
      "/api/v1/users/me/onboarding",
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const status =
      (typeof error === "object" &&
        error &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status) ||
      500;

    const message =
      (typeof error === "object" &&
        error &&
        "response" in error &&
        (error as { response?: { data?: { message?: unknown } } }).response?.data
          ?.message) ||
      "Server error";

    return NextResponse.json(
      {
        message: typeof message === "string" ? message : "Server error",
      },
      { status: typeof status === "number" ? status : 500 },
    );
  }
}
