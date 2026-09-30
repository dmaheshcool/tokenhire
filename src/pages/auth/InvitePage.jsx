import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { useStore } from "../../context/Store.jsx";
import { api } from "../../lib/api.js";
import { AuthShell, PasswordField } from "../../layouts/AuthShell.jsx";
import { input, k, solid, textLink } from "../../theme.js";

export default function InvitePage() {
  const { activeOrgId, applySession } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (activeOrgId) return <Navigate to="/app/today" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await api.acceptInvite({ email, password });
      applySession(r);
      nav("/app/today", { replace: true });
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
  }

  return (
    <AuthShell title="Accept invite" sub="Your admin added this email under Team. Sign in to that company space." audience={null}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Invited email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} /></Field>
        <Field label="Password"><PasswordField id="invite-pass" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? "Joining…" : "Join company"}</button>
        <Link to="/company/start" style={textLink}>I already have a login</Link>
      </form>
    </AuthShell>
  );
}
