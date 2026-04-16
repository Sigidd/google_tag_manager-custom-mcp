"use client";

/**
 * Client component that reads ?session_id from the URL and renders
 * the "Sign in with Google" button (or an error / expired-session message).
 */
import { useSearchParams } from "next/navigation";

export default function ConnectButton() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const error = params.get("error");

  if (!sessionId) {
    return (
      <div style={styles.error}>
        <strong>Session expired.</strong> Please restart the connection flow
        from Claude.
      </div>
    );
  }

  const googleAuthUrl = `/api/google/auth?session_id=${encodeURIComponent(
    sessionId
  )}`;

  return (
    <div>
      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <a href={googleAuthUrl} style={styles.button}>
        {/* Google "G" logo */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </a>

      <p style={styles.privacy}>
        You will be redirected to Google to authorise access. Your credentials
        are stored securely and never shared.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.65rem 1.25rem",
    background: "#fff",
    color: "#3c4043",
    border: "1px solid #dadce0",
    borderRadius: 8,
    fontSize: "0.95rem",
    fontWeight: 500,
    fontFamily: "system-ui, sans-serif",
    textDecoration: "none",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    transition: "box-shadow 0.15s",
    width: "100%",
    justifyContent: "center",
  },
  error: {
    background: "#fff3f3",
    border: "1px solid #fca5a5",
    borderRadius: 8,
    padding: "0.75rem 1rem",
    marginBottom: "1rem",
    fontSize: "0.875rem",
    color: "#b91c1c",
  },
  privacy: {
    marginTop: "0.75rem",
    fontSize: "0.78rem",
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 1.4,
  },
};
