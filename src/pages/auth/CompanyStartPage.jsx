import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { useStore } from "../../context/Store.jsx";
import { api } from "../../lib/api.js";
import { isWorkEmail } from "../../lib/helpers.js";
import { AuthCandidateLinks, AuthShell, DemoHint, PasswordField } from "../../layouts/AuthShell.jsx";
import { t } from "../../i18n/strings.js";
import { input, k, solid, textLink } from "../../theme.js";

function afterPath(org, from) {
  if (org?.verified === false) return "/company/start";
  if (org?.hireForAsked === false) return "/company/welcome";
  return from || "/app/today";
}

export default function CompanyStartPage() {
  const { activeOrgId, orgs, signInWithPassword, applySession } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [params] = useSearchParams();
  const from = loc.state?.from || "/app/today";
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");
  const [magicToken, setMagicToken] = useState("");

  const org = orgs.find((o) => o.id === activeOrgId);
  useEffect(() => {
    if (!activeOrgId || !org) return;
    if (org.verified === false) {
      setEmail(org.email || "");
      setStep("unverified");
      return;
    }
    nav(afterPath(org, from), { replace: true });
  }, [activeOrgId, org, from, nav]);

  useEffect(() => {
    const token = params.get("verify") || params.get("link");
    if (!token) return;
    (async () => {
      try {
        const r = params.get("verify") ? await api.verifyLink({ token }) : await api.magicConsume({ token });
        applySession(r);
        nav(afterPath(r.org, from), { replace: true });
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function changeEmail() {
    setStep("email");
    setPassword("");
    setErr("");
    setVerifyToken("");
    setMagicToken("");
  }

  async function continueEmail(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    if (!isWorkEmail(email)) {
      setBusy(false);
      setErr(t("auth.workEmailErr"));
      return;
    }
    try {
      const r = await api.lookup({ email: email.trim() });
      if (r.status === "exists") setStep("password");
      else if (r.status === "unverified") setStep("unverified");
      else { setErr(t("auth.noAccount")); }
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
  }

  async function signIn(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await signInWithPassword(email, password);
    setBusy(false);
    if (!r.ok) {
      if (r.status === "unverified") setStep("unverified");
      else setErr(r.error);
      return;
    }
    nav(afterPath(r.org, from), { replace: true });
  }

  async function resend() {
    setBusy(true);
    setErr("");
    try {
      const r = await api.verifyResend({ email: email.trim() });
      if (r.verifyToken) setVerifyToken(r.verifyToken);
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
  }

  async function sendMagic() {
    setBusy(true);
    setErr("");
    try {
      const r = await api.magicStart({ email: email.trim() });
      if (r.magicToken) setMagicToken(r.magicToken);
      setStep("magic");
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
  }

  async function openVerify() {
    if (!verifyToken) return;
    setBusy(true);
    try {
      const r = await api.verifyLink({ token: verifyToken });
      applySession(r);
      nav(afterPath(r.org, from), { replace: true });
    } catch (ex) {
      setErr(ex.message);
    }
    setBusy(false);
  }

  const title = t("auth.loginTitle");
  const sub = t("auth.loginSub");

  return (
    <AuthShell title={title} sub={sub} audience={null} below={<AuthCandidateLinks />}>
      {step !== "email" && (
        <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 16px" }}>
          {email}{" "}
          <button type="button" onClick={changeEmail} style={textLink}>{t("auth.changeEmail")}</button>
        </p>
      )}
      {step === "email" && (
        <form onSubmit={continueEmail} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label={t("auth.workEmail")}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder={t("auth.workEmailPh")} autoComplete="username" />
          </Field>
          {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
          {err === t("auth.noAccount") && (
            <Link to="/register" style={textLink}>{t("nav.startHiring")}</Link>
          )}
          <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? t("auth.continuing") : t("auth.continue")}</button>
        </form>
      )}
      {step === "password" && (
        <form onSubmit={signIn} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label={t("auth.password")}>
            <PasswordField id="co-pass" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
          {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
          <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? t("auth.signingIn") : t("auth.signIn")}</button>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
            <Link to="/forgot-password" style={{ ...textLink, fontSize: 15 }}>{t("auth.forgot")}</Link>
            <button type="button" onClick={sendMagic} style={{ ...textLink, textAlign: "left", background: "none", border: 0, padding: 0, cursor: "pointer", fontSize: 15 }}>{t("auth.magicLink")}</button>
          </div>
          <DemoHint />
        </form>
      )}
      {step === "unverified" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>{t("auth.sentVerify", { email })}</p>
          {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
          <button type="button" disabled={busy} onClick={resend} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? t("auth.sending") : t("auth.resendLink")}</button>
          {!import.meta.env.PROD && verifyToken && (
            <button type="button" onClick={openVerify} style={textLink}>{t("auth.openVerifyLink")}</button>
          )}
        </div>
      )}
      {step !== "unverified" && step !== "magic" && (
        <p style={{ fontSize: 15, margin: "16px 0 0" }}>{t("auth.newHere")} <Link to="/register" style={textLink}>{t("nav.startHiring")}</Link></p>
      )}
      {step === "magic" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>{t("auth.sentMagic", { email })}</p>
          {!import.meta.env.PROD && magicToken && (
            <button
              type="button"
              onClick={async () => {
                const r = await api.magicConsume({ token: magicToken });
                applySession(r);
                nav(afterPath(r.org, from), { replace: true });
              }}
              style={textLink}
            >
              {t("auth.openMagicLink")}
            </button>
          )}
        </div>
      )}
    </AuthShell>
  );
}
