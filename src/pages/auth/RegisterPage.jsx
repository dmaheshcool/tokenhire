import { useState } from "react";
import { Link } from "react-router-dom";
import { Field } from "../../components/ui.jsx";
import { useStore } from "../../context/Store.jsx";
import { isWorkEmail } from "../../lib/helpers.js";
import { passwordIssue } from "../../lib/password.js";
import { AuthCandidateLinks, AuthShell, PasswordField } from "../../layouts/AuthShell.jsx";
import { t } from "../../i18n/strings.js";
import { input, k, solid, textLink } from "../../theme.js";

export default function RegisterPage() {
  const { signUpOrg } = useStore();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kind, setKind] = useState("captive");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");
  const [done, setDone] = useState(false);

  async function createAccount(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    if (!companyName.trim() || !email.trim() || !password.trim()) {
      setBusy(false);
      setErr(t("auth.fillAll"));
      return;
    }
    if (!isWorkEmail(email)) {
      setBusy(false);
      setErr(t("auth.workEmailErr"));
      return;
    }
    const issue = passwordIssue(password);
    if (issue === "short") { setBusy(false); setErr(t("auth.passwordShort")); return; }
    if (issue === "common") { setBusy(false); setErr(t("auth.passwordCommon")); return; }
    const r = await signUpOrg({ companyName, email, password, kind });
    setBusy(false);
    if (!r.ok) { setErr(r.error); return; }
    if (r.verifyToken) setVerifyToken(r.verifyToken);
    setDone(true);
  }

  return (
    <AuthShell title={t("auth.signupTitle")} sub={t("auth.signupSub")} audience={null} below={!done ? <AuthCandidateLinks /> : null}>
      {done ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>{t("auth.sentVerify", { email })}</p>
          {!import.meta.env.PROD && verifyToken && (
            <Link to={`/company/start?verify=${encodeURIComponent(verifyToken)}`} style={textLink}>{t("auth.openVerifyLink")}</Link>
          )}
        </div>
      ) : (
        <form onSubmit={createAccount} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <Field label={t("auth.companyName")}>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={input} placeholder={t("auth.companyNamePh")} />
          </Field>
          <Field label={t("auth.workEmail")}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder={t("auth.workEmailPh")} autoComplete="username" />
          </Field>
          <div>
            <div className="label" style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>{t("auth.hiringFor")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="check" style={{ alignItems: "flex-start" }}>
                <input type="radio" name="hireFor" checked={kind === "captive"} onChange={() => setKind("captive")} />
                <span>
                  <b>{t("auth.ownCompany")}</b>
                  <div style={{ fontSize: 12.5, color: k.mid, fontWeight: 400 }}>{t("auth.ownCompanyHelp")}</div>
                </span>
              </label>
              <label className="check" style={{ alignItems: "flex-start" }}>
                <input type="radio" name="hireFor" checked={kind === "agency"} onChange={() => setKind("agency")} />
                <span>
                  <b>{t("auth.hireClients")}</b>
                  <div style={{ fontSize: 12.5, color: k.mid, fontWeight: 400 }}>{t("auth.hireClientsHelp")}</div>
                </span>
              </label>
            </div>
          </div>
          <Field label={t("auth.password")}>
            <PasswordField id="reg-pass" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <p style={{ fontSize: 12.5, color: k.mid, margin: 0 }}>{t("auth.passwordRules")}</p>
          {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
          <button type="submit" disabled={busy} style={{ ...solid, justifyContent: "center", padding: 12 }}>{busy ? t("auth.creating") : t("auth.createAccount")}</button>
          <p style={{ fontSize: 12.5, color: k.mid, margin: 0 }}>{t("auth.verifyEmail")}</p>
          <p style={{ fontSize: 15, margin: 0 }}>{t("auth.haveAccount")} <Link to="/company/start" style={textLink}>{t("nav.employerSignIn")}</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
