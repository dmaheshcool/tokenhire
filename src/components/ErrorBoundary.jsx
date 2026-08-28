import React from "react";

// A crash during a live drive must not leave a blank white screen on a candidate's
// phone or the hall TV — show something recoverable and keep the token link visible.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("TokenHire crashed:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const detail = import.meta.env.DEV ? String(this.state.error?.stack || this.state.error) : "";
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "'Inter', -apple-system, system-ui, sans-serif", background: "#F5F8FF", color: "#0B1020" }}>
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <div style={{ fontSize: 21, fontWeight: 700, marginBottom: 8 }}>Something went wrong</div>
          <p style={{ fontSize: 14, color: "#737C93", lineHeight: 1.55, margin: "0 0 18px" }}>
            Your place in the queue is safe. Reload this page, or show your token to the desk.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "11px 22px", borderRadius: 999, border: "none", background: "#2C6BF5", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
          >
            Reload
          </button>
          {detail && (
            <pre style={{ marginTop: 20, textAlign: "left", fontSize: 11, lineHeight: 1.5, color: "#B3261E", background: "#fff", border: "1px solid #E4E9F5", borderRadius: 10, padding: 12, overflow: "auto", maxHeight: 320 }}>
              {detail}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
