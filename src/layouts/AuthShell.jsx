import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Wordmark } from "../components/brand.jsx";
import { HIDE_PRICING } from "../lib/flags.js";
import { bdy, box, iconBtn, k } from "../theme.js";

export function AuthShell({ title, sub, children, backTo = "/" }) {
  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <Link to={backTo} style={{ ...iconBtn, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 22, textDecoration: "none" }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <div style={{ marginBottom: 8 }}><Wordmark size={20} /></div>
        {title && <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 600, letterSpacing: -0.7, margin: "0 0 6px" }}>{title}</h1>}
        {sub && <p style={{ color: k.mid, fontSize: 14, margin: "0 0 22px", lineHeight: 1.5 }}>{sub}</p>}
        <div style={{ ...box, padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

export const demoHint = (
  <div style={{ fontSize: 12, color: k.faint, lineHeight: 1.55, marginTop: 12 }}>
    Demo password <b style={{ fontFamily: "'Roboto Mono', monospace" }}>demo1234</b>
    <br />
    {HIDE_PRICING
      ? <>demo@vistaar.com · desk@vistaar.com</>
      : <>monthly@tokenhire.demo · demo@vistaar.com · desk@vistaar.com</>}
  </div>
);
