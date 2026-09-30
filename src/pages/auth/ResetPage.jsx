import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { api } from "../../lib/api.js";
import { AuthShell, PasswordField } from "../../layouts/AuthShell.jsx";
import { input, k, solid, textLink } from "../../theme.js";

export default function ResetPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api.reset({ email, code, password });
      nav("/company/start", { replace: true });
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
  }

  return (
    <AuthShell title="Reset password" sub="Use the code from email." audience={null}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Work email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} /></Field>
        <Field label="Reset code"><input value={code} onChange={(e) => setCode(e.target.value)} style={input} placeholder="482911" /></Field>
        <Field label="New password"><PasswordField id="reset-pass" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? "Saving…" : "Update password"}</button>
        <Link to="/company/start" style={textLink}>Back to sign in</Link>
      </form>
    </AuthShell>
  );
}
