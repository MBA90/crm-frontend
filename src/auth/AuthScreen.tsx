import React from "react";

interface AuthScreenProps {
  message: string;
  error?: string | null;
  onRetry?: () => void;
}

/** Full-screen status panel shown during auth transitions (loading / errors). */
export class AuthScreen extends React.Component<AuthScreenProps> {
  render(): React.ReactNode {
    const { message, error, onRetry } = this.props;
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--bg)",
          padding: 24,
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 420,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-lg)",
            padding: "32px 28px",
          }}
        >
          <div style={{ fontFamily: "var(--font-display, inherit)", fontWeight: 700, fontSize: 20 }}>
            Sanad
          </div>
          <div style={{ marginTop: 12, color: error ? "var(--danger, #E5484D)" : "var(--muted)", fontSize: 14 }}>
            {error ?? message}
          </div>
          {onRetry && (
            <button
              className="btn btn--primary"
              style={{ marginTop: 20 }}
              onClick={onRetry}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }
}