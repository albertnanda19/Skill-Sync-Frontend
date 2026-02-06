import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { backendApi } from "@/lib/axios";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email: string; password: string };

    const { data } = await backendApi.post<{
      status: number;
      message: string;
      data: { access_token: string; refresh_token: string };
    }>("/api/v1/auth/login", body);

    const accessToken = data?.data?.access_token;
    const refreshToken = data?.data?.refresh_token;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { message: "Invalid login response" },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    const secure = true;

    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
    });

    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
    });

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
