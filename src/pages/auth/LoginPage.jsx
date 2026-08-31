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
  const from = loc.state?.from || "/app/hiring";

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

  return (
    <AuthShell title="Sign in" sub="Recruiters and front desk.">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Work email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder="hr@yourcompany.com" autoComplete="username" /></Field>
        <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} autoComplete="current-password" /></Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? "Signing in…" : "Sign in"}</button>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Link to="/forgot-password" style={textLink}>Forgot password</Link>
          <Link to="/signup" style={textLink}>Create an account</Link>
        </div>
        <div style={{ borderTop: `1px solid ${k.line}`, marginTop: 4, paddingTop: 14, fontSize: 12.5, color: k.mid, lineHeight: 1.55 }}>
          Here for an interview? You don’t need an account —{" "}
          <Link to="/app/join" style={{ ...textLink, fontSize: 12.5 }}>check in here</Link>.
        </div>
        {demoHint}
      </form>
    </AuthShell>
  );
}
