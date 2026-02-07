import { NextResponse } from "next/server";

import { backendApi } from "@/lib/axios";

type BackendResponse<T> = {
  status: number;
  message: string;
  data: T;
};

export async function GET() {
  try {
    const { data } = await backendApi.get<
      BackendResponse<Array<{ id: string; name: string }>>
    >("/api/v1/skills");

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
