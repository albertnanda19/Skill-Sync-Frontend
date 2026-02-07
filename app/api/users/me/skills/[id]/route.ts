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

export async function PUT(
  req: Request,
  context: { params: { id: string } },
) {
  try {
    const { id } = context.params;
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ message: "Missing access token" }, { status: 401 });
    }

    const body = (await req.json()) as Record<string, unknown>;

    const { data } = await backendApi.put<BackendResponse<unknown>>(
      `/api/v1/users/me/skills/${encodeURIComponent(id)}`,
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

export async function DELETE(
  req: Request,
  context: { params: { id: string } },
) {
  try {
    const url = new URL(req.url);
    const rawId = url.pathname.split("/").pop() ?? "";
    const { id } = context.params;
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ message: "Missing access token" }, { status: 401 });
    }

    if (!rawId) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const { data } = await backendApi.delete<BackendResponse<null>>(
      `/api/v1/users/me/skills/${rawId}`,
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
