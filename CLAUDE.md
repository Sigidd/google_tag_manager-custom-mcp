# Google Tag Manager MCP — Context for Claude

## What this project is

A **remote MCP server** that connects Claude to the Google Tag Manager API v2. It is a Next.js 15 app deployed on Vercel, using `@vercel/mcp-adapter`.

**MCP endpoint** (use this URL when adding the connector): `https://your-deployment.vercel.app/mcp`

---

## Architecture

```
Claude → OAuth 2.1 → /api/oauth/authorize
                   → /connect  (user clicks "Sign in with Google")
                   → /api/google/auth  (redirect to Google consent screen)
                   → Google OAuth callback → /api/google/callback
                   → Bearer token issued to Claude

Claude tool call → /mcp → withMcpAuth → GTMClient (auto-refreshes token) → GTM API v2
```

### Key files

| File | Purpose |
|---|---|
| `src/app/[transport]/route.ts` | MCP endpoint (SSE + HTTP), auth gate |
| `src/lib/tools.ts` | All 75 MCP tool definitions |
| `src/lib/google-tagmanager.ts` | GTM REST API v2 client with auto token refresh |
| `src/lib/store.ts` | Supabase persistence layer |
| `src/lib/auth.ts` | Token generation, PKCE, bearer helpers |
| `src/app/connect/page.tsx` | Google sign-in page (server component) |
| `src/app/connect/ConnectButton.tsx` | Sign-in button (client component) |
| `src/app/api/google/auth/route.ts` | Redirects to Google OAuth consent screen |
| `src/app/api/google/callback/route.ts` | Google callback — stores tokens, issues auth code |
| `src/app/api/oauth/authorize/route.ts` | OAuth 2.1 authorization endpoint + silent re-auth |
| `src/app/api/oauth/token/route.ts` | Token exchange endpoint (our code → our bearer token) |
| `src/app/api/oauth/register/route.ts` | Dynamic client registration (RFC 7591) |

---

## OAuth Flow (Google OAuth 2.0 within our OAuth 2.1)

1. Claude calls `GET /api/oauth/authorize` with PKCE (S256 required)
2. **Silent re-auth**: if `mcp_user_id` cookie exists and credentials valid in Supabase → skip Google login, issue code immediately
3. **First-time**: session saved to Supabase, user redirected to `/connect`
4. User clicks "Sign in with Google" → `/api/google/auth?session_id=xxx`
5. Redirected to `https://accounts.google.com/o/oauth2/v2/auth` with GTM scopes
6. Google redirects to `/api/google/callback?code=xxx&state=session_id`
7. Code exchanged for `access_token` + `refresh_token` via `https://oauth2.googleapis.com/token`
8. User email fetched from `https://www.googleapis.com/oauth2/v2/userinfo`
9. `userId = SHA256(email).slice(0, 32)` — deterministic, no registration needed
10. Credentials stored in Supabase; our auth code issued → Claude exchanges for Bearer token via `/api/oauth/token`

---

## Google Token Refresh Strategy

Google access tokens expire after **1 hour**. The `GTMClient.getToken()` method:

1. Loads credentials from Supabase
2. Checks if `tokenExpiresAt - 5 minutes < Date.now()`
3. If yes: POSTs to `https://oauth2.googleapis.com/token` with `refresh_token` + `grant_type: "refresh_token"`
4. Updates `accessToken` + `tokenExpiresAt` in Supabase
5. Returns the fresh access token

This is transparent to all callers — every API method calls `getToken()` before making requests.

---

## GTM API Info

- **Base URL**: `https://tagmanager.googleapis.com/tagmanager/v2`
- **Auth header**: `Authorization: Bearer <access_token>`
- **Reference**: https://developers.google.com/tag-platform/tag-manager/api/v2/reference

---

## Supabase Schema

```sql
-- MCP credentials: Google OAuth tokens per userId (JSONB)
-- UserCredentials shape: { googleEmail, accessToken, refreshToken, tokenExpiresAt, connectedAt }
CREATE TABLE IF NOT EXISTS mcp_credentials (
  user_id TEXT PRIMARY KEY,
  data    JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth sessions (10 min TTL)
CREATE TABLE IF NOT EXISTS mcp_oauth_sessions (
  session_id TEXT PRIMARY KEY,
  data       JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Auth codes (5 min TTL)
CREATE TABLE IF NOT EXISTS mcp_auth_codes (
  code       TEXT PRIMARY KEY,
  data       JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Bearer token hashes (30 day TTL)
CREATE TABLE IF NOT EXISTS mcp_access_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Registered OAuth clients
CREATE TABLE IF NOT EXISTS mcp_oauth_clients (
  client_id TEXT PRIMARY KEY,
  data      JSONB NOT NULL
);

-- Grant anon access (RLS disabled)
GRANT ALL ON mcp_credentials TO anon;
GRANT ALL ON mcp_oauth_sessions TO anon;
GRANT ALL ON mcp_auth_codes TO anon;
GRANT ALL ON mcp_access_tokens TO anon;
GRANT ALL ON mcp_oauth_clients TO anon;
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | Public deployment URL, e.g. `https://gtm-mcp.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |

---

## Known Gotchas

1. **No middleware.ts** — Do NOT create a middleware.ts file. It causes routing conflicts with the MCP handler's pathname checks.

2. **Connector URL** — Must be `https://your-deployment.vercel.app/mcp` (the `/mcp` path).

3. **`force-dynamic` on well-known routes** — Both oauth-authorization-server and oauth-protected-resource routes use `dynamic = "force-dynamic"`.

4. **`serverExternalPackages`** — `next.config.ts` must include `@vercel/mcp-adapter` in `serverExternalPackages`.

5. **redirect_uri must match** — The `redirect_uri` set in Google Cloud Console must exactly match `${NEXT_PUBLIC_BASE_URL}/api/google/callback`.

6. **`prompt: "consent"` + `access_type: "offline"`** — Both required in the Google OAuth URL to ensure a `refresh_token` is returned on every sign-in.

7. **302 for the final redirect** — The callback uses `302` to redirect back to Claude's redirect_uri after issuing the auth code.

8. **303 for error redirects** — Error cases in the callback use `303` to redirect back to `/connect`.

9. **`mcp_user_id` cookie** — httpOnly, secure, sameSite: lax, 1 year maxAge. Set in `/api/google/callback`.

10. **favicon.ico** — Must be an actual file in `public/`, not a Next.js route redirect.

---

## Tool Categories (75 tools total)

| Category | Count | Tools |
|---|---|---|
| Accounts | 3 | list, get, update |
| Containers | 5 | list, get, create, update, delete |
| Workspaces | 9 | list, get, create, update, delete, status, create_version, quick_preview, sync |
| Tags | 6 | list, get, create, update, delete, revert |
| Triggers | 6 | list, get, create, update, delete, revert |
| Variables | 6 | list, get, create, update, delete, revert |
| Built-in Variables | 3 | list, enable, disable |
| Environments | 6 | list, get, create, update, delete, reauthorize |
| Versions | 9 | list_headers, get_live, get_latest, get, publish, set_latest, undelete, update, delete |
| Folders | 8 | list, get, create, update, delete, revert, list_entities, move_entities |
| Templates | 6 | list, get, create, update, delete, revert |
| Zones | 6 | list, get, create, update, delete, revert |
| User Permissions | 5 | list, get, create, update, delete |
