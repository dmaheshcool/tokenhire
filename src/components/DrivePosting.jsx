import { typ, k } from "../theme.js";
import { listingPlace } from "../lib/helpers.js";
import { fmtDate } from "./ui.jsx";

export function expLabel(bands) {
  if (!bands || !bands.length) return "All experience levels";
  return bands.join(" · ");
}
export function DrivePosting({ d, flush }) {
  const docs = d.docs || [];
  return (
    <div style={{ marginTop: flush ? 0 : 18, paddingTop: flush ? 0 : 18, borderTop: flush ? "none" : `1px solid ${k.line}`, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }} className="g2">
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", marginBottom: 8 }}>Job description</div>
        <p style={{ fontSize: 14, color: k.ink2, lineHeight: 1.65, margin: 0 }}>{d.jd || "The recruiter hasn't added a description yet."}</p>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", margin: "16px 0 8px" }}>Experience needed</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(d.expNeeded && d.expNeeded.length ? d.expNeeded : ["All levels"]).map((b) => <Pill key={b} tone="coral">{b}</Pill>)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", marginBottom: 8 }}>Bring these documents</div>
        {docs.length ? docs.map((doc) => (
          <div key={doc} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, color: k.ink2, marginBottom: 8 }}>
            <Check size={14} color={k.teal} style={{ flexShrink: 0, marginTop: 3 }} />{doc}
          </div>
        )) : <div style={{ fontSize: 13.5, color: k.mid }}>No document list posted — carry a resume and ID to be safe.</div>}
      </div>
    </div>
  );
}
