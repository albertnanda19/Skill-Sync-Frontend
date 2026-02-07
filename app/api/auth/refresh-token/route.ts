import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { backendApi } from "@/lib/axios";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: "Missing refresh token" }, { status: 401 });
    }

    const { data } = await backendApi.post<{
      status: number;
      message: string;
      data: { access_token: string; refresh_token: string };
    }>(
      "/api/v1/auth/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      },
    );

    const accessToken = data?.data?.access_token;
    const newRefreshToken = data?.data?.refresh_token;

    if (!accessToken || !newRefreshToken) {
      return NextResponse.json(
        { message: "Invalid refresh response" },
        { status: 500 },
      );
    }

    const secure = process.env.NODE_ENV === "production";

    cookieStore.set("access_token", accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
    });

    cookieStore.set("refresh_token", newRefreshToken, {
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
