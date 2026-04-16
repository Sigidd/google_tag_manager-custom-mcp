/**
 * GET /api/google/callback?code=xxx&state=session_id
 *
 * Handles the Google OAuth 2.0 callback:
 *  1. Exchanges the authorization code for access + refresh tokens
 *  2. Fetches the user's Google email
 *  3. Stores credentials in Supabase (keyed by SHA256 of email)
 *  4. Issues our own auth code and redirects back to the MCP client
 */
import { NextRequest, NextResponse } from "next/server";
import { generateId, getBaseUrl } from "@/lib/auth";
import { store } from "@/lib/store";
import { createHash } from "crypto";

const USER_COOKIE = "mcp_user_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const sessionId = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  const base = getBaseUrl();

  if (error || !code || !sessionId) {
    const url = new URL(`${base}/connect`);
    if (sessionId) url.searchParams.set("session_id", sessionId);
    url.searchParams.set("error", error ?? "Authentication cancelled.");
    return NextResponse.redirect(url.toString(), 303);
  }

  const session = await store.getSession(sessionId);
  if (!session) {
    return NextResponse.json(
      { error: "Session expired. Please restart the connection flow." },
      { status: 400 }
    );
  }

  // ── Exchange code for Google tokens ──────────────────────────────────────
  const redirectUri = `${base}/api/google/callback`;
  let tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  try {
    const resp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!resp.ok) throw new Error(await resp.text());
    tokens = await resp.json();
  } catch (e) {
    const url = new URL(`${base}/connect`);
    url.searchParams.set("session_id", sessionId);
    url.searchParams.set(
      "error",
      `Google auth failed: ${e instanceof Error ? e.message : String(e)}`
    );
    return NextResponse.redirect(url.toString(), 303);
  }

  // ── Fetch user email from Google ──────────────────────────────────────────
  let email: string;
  try {
    const userResp = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    if (!userResp.ok) throw new Error(await userResp.text());
    const userInfo = await userResp.json() as { email: string };
    email = userInfo.email;
  } catch (e) {
    const url = new URL(`${base}/connect`);
    url.searchParams.set("session_id", sessionId);
    url.searchParams.set(
      "error",
      `Failed to fetch Google user info: ${e instanceof Error ? e.message : String(e)}`
    );
    return NextResponse.redirect(url.toString(), 303);
  }

  // ── Persist credentials ───────────────────────────────────────────────────
  const userId = createHash("sha256")
    .update(email)
    .digest("hex")
    .slice(0, 32);

  const tokenExpiresAt = Date.now() + tokens.expires_in * 1000;

  await store.setCredentials(userId, {
    googleEmail: email,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenExpiresAt,
    connectedAt: Date.now(),
  });

  // ── Issue our auth code ───────────────────────────────────────────────────
  const authCode = generateId(32);
  await store.setCode(authCode, {
    userId,
    clientId: session.clientId,
    redirectUri: session.redirectUri,
    codeChallenge: session.codeChallenge,
    codeChallengeMethod: session.codeChallengeMethod,
    scope: session.scope,
    createdAt: Date.now(),
  });

  await store.delSession(sessionId);

  // ── Redirect back to the MCP client ──────────────────────────────────────
  const redirect = new URL(session.redirectUri);
  redirect.searchParams.set("code", authCode);
  if (session.state) redirect.searchParams.set("state", session.state);

  const response = NextResponse.redirect(redirect.toString(), 302);
  response.cookies.set(USER_COOKIE, userId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
