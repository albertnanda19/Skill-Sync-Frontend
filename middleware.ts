import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const AUTH_ROUTES = new Set(["/login", "/register"]);
const REFRESH_ROUTE = "/auth/refresh";

function base64UrlToUint8Array(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function base64ToUint8Array(value: string) {
  const raw = atob(value);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function secretToCandidateKeyBytes(secret: string) {
  const candidates: Uint8Array[] = [new TextEncoder().encode(secret)];
  try {
    candidates.unshift(base64ToUint8Array(secret));
  } catch {
    // ignore
  }
  return candidates;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function parseJwtPayload(token: string): null | { exp?: number } {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payloadBytes = base64UrlToUint8Array(parts[1]);
    const payloadJson = new TextDecoder().decode(payloadBytes);
    return JSON.parse(payloadJson) as { exp?: number };
  } catch {
    return null;
  }
}

async function verifyJwtHs256(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  const data = new TextEncoder().encode(`${header}.${payload}`);
  const signatureBytes = base64UrlToUint8Array(signature);

  for (const secretBytes of secretToCandidateKeyBytes(secret)) {
    const key = await crypto.subtle.importKey(
      "raw",
      toArrayBuffer(secretBytes),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const computed = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, data),
    );
    if (timingSafeEqual(computed, signatureBytes)) return true;
  }

  return false;
}

function isProtectedPath(pathname: string) {
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next")) return false;
  if (pathname === "/favicon.ico") return false;
  if (pathname === REFRESH_ROUTE) return false;
  if (AUTH_ROUTES.has(pathname)) return false;
  if (pathname === "/") return false;

  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/skills-gap") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/pipeline") ||
    pathname.startsWith("/users")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (AUTH_ROUTES.has(pathname)) {
    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) return NextResponse.next();

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) return NextResponse.next();

    const verified = await verifyJwtHs256(accessToken, secret);
    if (!verified) return NextResponse.next();

    const payload = parseJwtPayload(accessToken);
    const exp = payload?.exp;
    if (typeof exp !== "number") return NextResponse.next();

    const nowSeconds = Math.floor(Date.now() / 1000);
    const isExpired = nowSeconds >= exp;
    if (isExpired) return NextResponse.next();

    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const verified = await verifyJwtHs256(accessToken, secret);
  if (!verified) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  const payload = parseJwtPayload(accessToken);
  const exp = payload?.exp;

  if (typeof exp === "number") {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const isExpired = nowSeconds >= exp;

    if (isExpired) {
      if (!refreshToken) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("next", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
      }

      const refreshUrl = req.nextUrl.clone();
      refreshUrl.pathname = REFRESH_ROUTE;
      refreshUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(refreshUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
