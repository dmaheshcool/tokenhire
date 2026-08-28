import { ArrowLeft } from "lucide-react";
import { bdy, dsp, typ, input, k, iconBtn, chromeStrip, chromeBox } from "../theme.js";
import { CITIES } from "../lib/helpers.js";
import { Wordmark } from "./brand.jsx";

export function Field({ label, children }) { return <label style={{ display: "flex", flexDirection: "column", gap: 5 }}><span style={{ fontSize: 12, color: k.mid, fontWeight: 600 }}>{label}</span>{children}</label>; }
export function CitySelect({ value, onChange, allowAll, placeholder = "Select a city" }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...input, appearance: "auto" }}>
      {allowAll && <option value="">All cities</option>}
      {!allowAll && !value && <option value="">{placeholder}</option>}
      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}
export function SectionLabel({ children }) { return <div style={{ fontFamily: typ, fontSize: 10.5, letterSpacing: 1.2, color: k.mid, marginBottom: 9, fontWeight: 700 }}>{children.toString().toUpperCase()}</div>; }
export function Blank({ text }) { return <div style={{ color: k.faint, fontSize: 13.5, padding: "30px 16px", textAlign: "center", lineHeight: 1.5 }}>{text}</div>; }
export function RouteFallback() {
  return (
    <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", fontFamily: bdy, color: k.faint, fontSize: 13.5 }}>
      Loading…
    </div>
  );
}
export function Head({ title, action }) { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={{ fontFamily: dsp, fontSize: 15, fontWeight: 700 }}>{title}</span>{action}</div>; }
// Shared by the candidate and recruiter shells. It lives here rather than in the
// recruiter console so a candidate's phone doesn't download that whole bundle.
export function TopBar({ back, title, accent, tabs, tab, setTab }) {
  return (
    <div className="chrome-wrap" style={{ ...chromeStrip, padding: "10px 16px 12px" }}>
      <div className="chrome-inner" style={{ maxWidth: 720, margin: "0 auto", ...chromeBox, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={back} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}><ArrowLeft size={15} /> Back</button>
          <span style={{ width: 1, height: 16, background: k.line }} />
          <Wordmark size={15} />
          <Pill tone={accent === k.teal ? "teal" : "coral"}>{title}</Pill>
        </div>
        {tabs && (
          <div className="tabscroll" style={{ padding: "0 10px", display: "flex", gap: 2, background: k.cream2, borderTop: `1px solid ${k.line}` }}>
            {tabs.map(([id, label]) => {
              const on = tab === id;
              return <button key={id} onClick={() => setTab(id)} style={{ padding: "12px 14px", minHeight: 44, border: "none", background: "none", cursor: "pointer", fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? accent : k.mid, borderBottom: `2px solid ${on ? accent : "transparent"}`, fontFamily: bdy, whiteSpace: "nowrap" }}>{label}</button>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
export function StatusPill({ status }) {
  if (status === "live") return <Pill tone="teal">LIVE NOW</Pill>;
  if (status === "upcoming") return <Pill tone="gold">UPCOMING</Pill>;
  return <Pill tone="grey">CLOSED</Pill>;
}
export function Pill({ children, tone }) {
  const m = { grey: [k.cream2, k.mid], teal: [k.tealDim, k.teal], coral: [k.coralDim, k.coral], red: [k.redDim, k.red], gold: [k.goldDim, k.gold] }[tone] || [k.cream2, k.mid];
  return <span style={{ background: m[0], color: m[1], fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 3, fontFamily: typ, letterSpacing: .3, whiteSpace: "nowrap" }}>{children}</span>;
}
export function Btn({ children, onClick, q }) {
  return <button onClick={onClick} style={{ padding: "6px 11px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: bdy, border: q ? `1px solid ${k.line}` : "none", background: q ? "#fff" : k.coral, color: q ? k.ink2 : "#fff", whiteSpace: "nowrap" }}>{children}</button>;
}
export function ActionSelect({ label, options, onPick }) {
  return (
    <select
      value=""
      onChange={(e) => { const v = e.target.value; if (v) onPick(v); }}
      style={{ padding: "6px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: bdy, border: `1px solid ${k.line}`, background: "#fff", color: k.ink2, maxWidth: 160 }}
    >
      <option value="" disabled>{label}</option>
      {(options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
