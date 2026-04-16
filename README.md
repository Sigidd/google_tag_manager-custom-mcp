# Google Tag Manager MCP

A remote MCP server that connects Claude to the Google Tag Manager API v2, allowing you to manage GTM accounts, containers, workspaces, tags, triggers, variables, versions, and more via natural language.

## Prerequisites

- Google Cloud project with the Tag Manager API enabled
- OAuth 2.0 credentials (Web application type)
- Supabase project (for token storage)
- Vercel account (for deployment)

## Setup

1. **Create Google Cloud OAuth credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
   - Create an OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URI: `https://your-deployment.vercel.app/api/google/callback`
   - Copy the Client ID and Client Secret

2. **Enable the Tag Manager API**
   - In Google Cloud Console → APIs & Services → Library
   - Search for "Tag Manager API" and enable it

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema below in the SQL editor

4. **Deploy to Vercel**
   - Fork/clone this repo
   - Connect to Vercel and deploy
   - Add all environment variables (see table below)

5. **Add to Claude**
   - In Claude → Settings → Integrations → Add MCP Server
   - Enter URL: `https://your-deployment.vercel.app/mcp`
   - Click "Sign in with Google" when prompted

## Google Cloud Scopes

The following OAuth scopes are requested:

| Scope | Purpose |
|---|---|
| `openid`, `email`, `profile` | Identify the user |
| `tagmanager.readonly` | Read GTM data |
| `tagmanager.edit.containers` | Create/edit tags, triggers, variables |
| `tagmanager.edit.containerversions` | Create and manage versions |
| `tagmanager.manage.accounts` | Manage account settings |
| `tagmanager.manage.users` | Manage user permissions |
| `tagmanager.publish` | Publish container versions |

## Supabase Schema

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS mcp_credentials (
  user_id TEXT PRIMARY KEY,
  data    JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_oauth_sessions (
  session_id TEXT PRIMARY KEY,
  data       JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS mcp_auth_codes (
  code       TEXT PRIMARY KEY,
  data       JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS mcp_access_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS mcp_oauth_clients (
  client_id TEXT PRIMARY KEY,
  data      JSONB NOT NULL
);

GRANT ALL ON mcp_credentials TO anon;
GRANT ALL ON mcp_oauth_sessions TO anon;
GRANT ALL ON mcp_auth_codes TO anon;
GRANT ALL ON mcp_access_tokens TO anon;
GRANT ALL ON mcp_oauth_clients TO anon;
```

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Your deployment URL (no trailing slash) | `https://gtm-mcp.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789-xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJ...` |

## Connector URL

```
https://your-deployment.vercel.app/mcp
```
