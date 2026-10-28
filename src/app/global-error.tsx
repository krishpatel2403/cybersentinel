"use client";

import { AlertOctagon } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05080f",
          color: "#e2e8f0",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "1rem",
        }}
      >
        <main
          style={{
            maxWidth: "28rem",
            width: "100%",
            border: "1px solid rgba(251,113,133,0.25)",
            borderRadius: "1rem",
            background: "rgba(13,23,39,0.95)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <AlertOctagon size={28} color="#fda4af" aria-hidden="true" />
          <h1 style={{ fontSize: "1.25rem", margin: "1rem 0 0.5rem" }}>Application unavailable</h1>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#94a3b8", margin: 0 }}>
            A critical error prevented the app shell from rendering. The error was logged without
            sensitive request data.
          </p>
          {error.digest ? (
            <p style={{ fontSize: "0.625rem", color: "#64748b", marginTop: "0.75rem" }}>
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              border: "none",
              borderRadius: "0.5rem",
              background: "#22d3ee",
              color: "#020617",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              padding: "0.625rem 1.25rem",
            }}
          >
            Reload the app
          </button>
        </main>
      </body>
    </html>
  );
}
