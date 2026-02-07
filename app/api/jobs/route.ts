import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

function parseLimit(value: string | null) {
  const raw = value ? Number(value) : 20;
  if (!Number.isFinite(raw)) return 20;
  const rounded = Math.trunc(raw);
  if (rounded < 1) return 1;
  if (rounded > 50) return 50;
  return rounded;
}

function parseOffset(value: string | null) {
  const raw = value ? Number(value) : 0;
  if (!Number.isFinite(raw)) return 0;
  const rounded = Math.trunc(raw);
  if (rounded < 0) return 0;
  return rounded;
}

function normalizeString(value: string | null) {
  const v = typeof value === "string" ? value.trim() : "";
  return v ? v : undefined;
}

function normalizeSkills(value: string | null) {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return undefined;
  const parts = v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts.join(",") : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const title = normalizeString(url.searchParams.get("title"));
    const companyName = normalizeString(url.searchParams.get("company_name"));
    const location = normalizeString(url.searchParams.get("location"));
    const skills = normalizeSkills(url.searchParams.get("skills"));
    const limit = parseLimit(url.searchParams.get("limit"));
    const offset = parseOffset(url.searchParams.get("offset"));

    const params: Record<string, string | number> = {
      limit,
      offset,
      ...(title ? { title } : {}),
      ...(companyName ? { company_name: companyName } : {}),
      ...(location ? { location } : {}),
      ...(skills ? { skills } : {}),
    };

    const isPublic = process.env.PUBLIC_JOBS === "true";

    if (isPublic) {
      const { data } = await backendApi.get<BackendResponse<unknown>>(
        "/api/v1/jobs",
        { params },
      );
      return NextResponse.json(data, { status: 200 });
    }

    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ message: "Missing access token" }, { status: 401 });
    }

    const { data } = await backendApi.get<BackendResponse<unknown>>(
      "/api/v1/jobs",
      {
        params,
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
