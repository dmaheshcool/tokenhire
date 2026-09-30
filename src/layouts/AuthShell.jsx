import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Wordmark } from "../components/brand.jsx";
import { AudienceStrip } from "../components/SiteChrome.jsx";
import { HIDE_PRICING } from "../lib/flags.js";
import { t } from "../i18n/strings.js";
import { bdy, box, iconBtn, input, k, textLink } from "../theme.js";

export function AuthShell({ title, sub, children, backTo = "/", audience = "company", below }) {
  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <Link to={backTo} style={{ ...iconBtn, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 22, textDecoration: "none" }}>
          <ArrowLeft size={14} /> {t("buttons.back")}
        </Link>
        <div style={{ marginBottom: 8 }}><Wordmark size={20} /></div>
        {title && <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 600, letterSpacing: -0.7, margin: "0 0 6px" }}>{title}</h1>}
        {sub && <p style={{ color: k.mid, fontSize: 14, margin: "0 0 22px", lineHeight: 1.5 }}>{sub}</p>}
        <div style={{ ...box, padding: 24 }}>{children}</div>
        {below}
        {audience ? <AudienceStrip kind={audience} /> : null}
      </div>
    </div>
  );
}

export function PasswordField({ id, value, onChange, autoComplete = "new-password" }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        style={{ ...input, paddingRight: 52 }}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? t("auth.hidePassword") : t("auth.showPassword")}
        aria-pressed={show}
        style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 44, height: 44, minHeight: 44, padding: 0 }}
      >
        {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}

export function DemoHint() {
  const [params] = useSearchParams();
  if (import.meta.env.PROD || params.get("demo") !== "1") return null;
  return (
    <div style={{ fontSize: 12, color: k.faint, lineHeight: 1.55, marginTop: 12 }}>
      {t("auth.demoPassword")} <b style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t("auth.demoSecret")}</b>
      <br />
      {HIDE_PRICING ? t("auth.demoEmailsLite") : t("auth.demoEmails")}
    </div>
  );
}

export function AuthCandidateLinks() {
  return (
    <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8, fontSize: 15 }}>
      <p style={{ margin: 0 }}>{t("auth.lookingWalkIn")} <Link to="/walk-ins" style={textLink}>{t("auth.browseWalkIns")}</Link></p>
      <p style={{ margin: 0 }}>{t("auth.atVenue")} <Link to="/check-in" style={textLink}>{t("auth.scanCheckIn")}</Link></p>
    </div>
  );
}
