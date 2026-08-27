import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { api } from "../../lib/api.js";
import { AuthShell } from "../../layouts/AuthShell.jsx";
import { input, k, solid, textLink } from "../../theme.js";

export default function ForgotPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await api.forgot({ email });
      setMsg(`Reset code sent. Demo code: ${r.demoCode}`);
      setTimeout(() => nav(`/reset-password?email=${encodeURIComponent(email)}`), 600);
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
  }

  return (
    <AuthShell title="Forgot password" sub="We’ll send a reset code to your work email. In this demo the code is shown on screen.">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Work email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} /></Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        {msg && <div style={{ fontSize: 12.5, color: k.teal }}>{msg}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? "Sending…" : "Send reset code"}</button>
        <Link to="/login" style={textLink}>Back to sign in</Link>
      </form>
    </AuthShell>
  );
}
