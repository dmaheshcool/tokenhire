import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { api } from "../../lib/api.js";
import { AuthShell } from "../../layouts/AuthShell.jsx";
import { t } from "../../i18n/strings.js";
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
      await api.forgot({ email });
      setMsg(t("auth.forgotSent"));
      setTimeout(() => nav(`/reset-password?email=${encodeURIComponent(email)}`), 600);
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
  }

  return (
    <AuthShell title={t("auth.forgotTitle")} sub={t("auth.forgotSub")} audience={null}>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <Field label={t("auth.workEmail")}><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} /></Field>
        {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
        {msg && <div style={{ fontSize: 12.5, color: k.teal }}>{msg}</div>}
        <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? t("auth.sendingCode") : t("auth.sendCode")}</button>
        <Link to="/company/start" style={textLink}>{t("auth.backToSignIn")}</Link>
      </form>
    </AuthShell>
  );
}
