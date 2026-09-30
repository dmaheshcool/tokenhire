import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { useStore } from "../../context/Store.jsx";
import { api } from "../../lib/api.js";
import { AuthShell } from "../../layouts/AuthShell.jsx";
import { t } from "../../i18n/strings.js";
import { input, k, solid, textLink } from "../../theme.js";

export default function VerifyPage() {
  const { activeOrgId, orgs, setOrgs } = useStore();
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const org = orgs.find((o) => o.id === activeOrgId);

  if (!activeOrgId) return <Navigate to="/company/start" replace />;

  function go() {
    nav(org?.hireForAsked === false ? "/company/welcome" : "/app/today", { replace: true });
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api.verify({ code });
      setOrgs((p) => p.map((o) => o.id === activeOrgId ? { ...o, verified: true } : o));
      go();
    } catch {
      setErr("That email code is not valid.");
    }
    setBusy(false);
  }

  return (
    <AuthShell title="Verify your email" sub={t("auth.sentVerify", { email: org?.email || "" })} audience={null}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label="Email code"><input value={code} onChange={(e) => setCode(e.target.value)} style={input} /></Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? "Checking…" : "Verify and continue"}</button>
        <button type="button" onClick={() => nav("/company/start")} style={textLink}>{t("auth.backToSignIn")}</button>
      </form>
    </AuthShell>
  );
}
