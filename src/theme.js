export const k = {
  cream: "#FFFFFF", cream2: "#F6F5F1", ink: "#0B1020", ink2: "#394056", mid: "#626A80", faint: "#8C93A6",
  line: "#E7E7EA", coral: "#2F5BFF", coralDim: "#EDF1FF", teal: "#1F2537", tealDim: "#F2F3F6",
  gold: "#8A5A00", goldDim: "#FEF3DC", red: "#C62F35", redDim: "#FDECEC",
  green: "#16A34A", greenDim: "#E8F7EE", lime: "#C6F432", warn: "#F59E0B",
  band: "#0B1020", bandSoft: "#F6F5F1",
};
export const R = { pill: 999, card: 16, inner: 12 };
const STACK = "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
export const dsp = "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
export const bdy = STACK;
export const typ = "'JetBrains Mono', ui-monospace, monospace";

export const box = { background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.inner, boxShadow: "0 1px 0 rgba(17,19,24,.03)" };
export const input = { padding: "11px 14px", borderRadius: 10, border: `1px solid ${k.line}`, background: "#fff", color: k.ink, fontSize: 13.5, outline: "none", fontFamily: bdy, width: "100%" };
export const cell = { padding: "12px 16px", verticalAlign: "top" };
export const link = { display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: k.teal, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: bdy };
export const solid = { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: R.pill, border: "none", background: k.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: bdy, whiteSpace: "nowrap" };
export const solidTeal = { ...solid, background: k.teal };
export const solidSm = { ...solid, padding: "9px 18px", fontSize: 13.5 };
export const outlineSm = { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: R.pill, border: `1.5px solid ${k.coral}`, background: "#fff", color: k.coral, fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: bdy, whiteSpace: "nowrap" };
export const textLink = { background: "none", border: "none", color: k.mid, fontWeight: 500, fontSize: 12.5, cursor: "pointer", fontFamily: bdy, padding: 0, textDecoration: "underline", textUnderlineOffset: 3 };
export const outline = { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: R.pill, border: `1.5px solid ${k.line}`, background: "#fff", color: k.ink, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: bdy, whiteSpace: "nowrap" };
export const ghostSm = { display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 15px", borderRadius: R.pill, border: `1px solid ${k.line}`, background: "#fff", color: k.ink2, fontWeight: 600, fontSize: 12.5, cursor: "pointer", fontFamily: bdy };
export const iconBtn = { background: "none", border: "none", cursor: "pointer", color: k.mid, padding: 0, fontFamily: bdy };
export const navBtn = { background: "none", border: "none", cursor: "pointer", fontFamily: bdy, fontSize: 15, fontWeight: 500, padding: 0, transition: "color .15s" };
export const chromeStrip = { background: k.cream, borderBottom: `1px solid ${k.line}` };
export const chromeBox = { background: "transparent", border: "none", boxShadow: "none" };
