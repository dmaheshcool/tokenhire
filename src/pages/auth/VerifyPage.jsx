import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { useStore } from "../../context/Store.jsx";
import { api } from "../../lib/api.js";
import { AuthShell } from "../../layouts/AuthShell.jsx";
import { input, k, solid, textLink } from "../../theme.js";

export default function VerifyPage() {
  const { activeOrgId, orgs, setOrgs } = useStore();
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!activeOrgId) return <Navigate to="/signup" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api.verify({ code });
      setOrgs((p) => p.map((o) => o.id === activeOrgId ? { ...o, verified: true } : o));
      nav("/app/hiring", { replace: true });
    } catch {
      if (code.trim() === "618204") {
        setOrgs((p) => p.map((o) => o.id === activeOrgId ? { ...o, verified: true } : o));
        nav("/app/hiring", { replace: true });
      } else setErr("That email code is not valid. Demo code is 618204.");
    }
    setBusy(false);
  }

  const org = orgs.find((o) => o.id === activeOrgId);

  return (
    <AuthShell title="Verify your email" sub={`We sent a 6-digit code to ${org?.email || "your work email"}. Demo code: 618204.`}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Email code"><input value={code} onChange={(e) => setCode(e.target.value)} style={input} placeholder="618204" /></Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? "Checking…" : "Verify and continue"}</button>
        <button type="button" onClick={() => nav("/app/hiring")} style={textLink}>Skip for now</button>
      </form>
    </AuthShell>
  );
}
