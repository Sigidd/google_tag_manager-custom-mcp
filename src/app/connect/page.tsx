/**
 * /connect — Google sign-in page for the GTM MCP server.
 *
 * Reached after the MCP client initiates the OAuth 2.1 flow.
 * The user clicks "Sign in with Google" which redirects to Google's
 * consent screen.
 */
import { Suspense } from "react";
import ConnectButton from "./ConnectButton";

export default function ConnectPage() {
  return (
    <main style={styles.main}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.png"
            alt="Google Tag Manager"
            width={56}
            height={56}
            style={{ borderRadius: 12 }}
          />
        </div>

        <h1 style={styles.title}>Google Tag Manager MCP</h1>
        <p style={styles.subtitle}>
          Connect your Google account to manage Google Tag Manager via Claude.
          You will be redirected to Google to grant access.
        </p>

        <Suspense fallback={null}>
          <ConnectButton />
        </Suspense>

        <div style={styles.hint}>
          <p style={{ margin: "0 0 0.4rem", fontWeight: 600, color: "#555" }}>
            What access is requested?
          </p>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.6 }}>
            <li>Read your GTM accounts, containers, and workspaces</li>
            <li>Create and edit tags, triggers, and variables</li>
            <li>Publish container versions</li>
            <li>Manage user permissions</li>
          </ul>
          <p
            style={{
              margin: "0.75rem 0 0",
              fontSize: "0.8rem",
              color: "#888",
            }}
          >
            Your Google refresh token is stored securely and used only to call
            the GTM API on your behalf.
          </p>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f4f8",
    fontFamily: "system-ui, sans-serif",
    padding: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2.5rem",
    maxWidth: "440px",
    width: "100%",
    boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
  },
  logoWrap: {
    marginBottom: "1.25rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: "0 0 0.5rem",
    color: "#111",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#555",
    marginBottom: "1.75rem",
    lineHeight: 1.55,
  },
  hint: {
    marginTop: "1.75rem",
    fontSize: "0.82rem",
    color: "#777",
    lineHeight: 1.5,
    background: "#f8f9fc",
    borderRadius: 8,
    padding: "1rem 1.1rem",
    border: "1px solid #e5e7ef",
  },
};
