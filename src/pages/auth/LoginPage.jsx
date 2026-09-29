import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { useStore } from "../../context/Store.jsx";
import { AuthShell, demoHint } from "../../layouts/AuthShell.jsx";
import { input, k, solid, textLink } from "../../theme.js";

export default function LoginPage() {
  const { activeOrgId, signInWithPassword } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [who, setWho] = useState("company");
  const from = loc.state?.from || "/app/today";

  if (activeOrgId) return <Navigate to={from} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await signInWithPassword(email, password);
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    nav(from, { replace: true });
  }

  const tab = (id, label) => (
    <button type="button" onClick={() => setWho(id)} style={{
      flex: 1, border: "none", cursor: "pointer", padding: "12px 8px", fontFamily: "inherit", fontWeight: 700, fontSize: 14,
      background: who === id ? k.coral : k.cream2, color: who === id ? "#fff" : k.ink2,
      borderRadius: id === "person" ? "12px 0 0 0" : "0 12px 0 0",
    }}>{label}</button>
  );

  return (
    <AuthShell title="Sign in" sub={who === "company" ? "Company account." : "You do not need a password."}>
      <div style={{ display: "flex", margin: "-24px -24px 16px" }}>{tab("person", "Get my token")}{tab("company", "Company")}</div>
      {who === "person" ? (
        <div>
          <p style={{ fontSize: 14.5, color: k.ink2, lineHeight: 1.55, margin: "0 0 16px" }}>Find a walk-in and tap Get my token. When you arrive, scan the lobby display.</p>
          <Link to="/walk-ins" style={{ ...solid, justifyContent: "center", textDecoration: "none", width: "100%" }}>Browse walk-ins</Link>
          <Link to="/app/join" style={{ ...textLink, display: "inline-block", marginTop: 14 }}>Check in</Link>
        </div>
      ) : (
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Work email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder="hr@yourcompany.com" autoComplete="username" /></Field>
        <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} autoComplete="current-password" /></Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? "Signing in…" : "Sign in"}</button>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Link to="/forgot-password" style={textLink}>Forgot password</Link>
          <Link to="/signup" style={textLink}>Register</Link>
        </div>
        {demoHint}
      </form>
      )}
    </AuthShell>
  );
}
