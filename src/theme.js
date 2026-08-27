export const k = {
  cream: "#FFFFFF", cream2: "#F5F8FF", ink: "#0B1020", ink2: "#4A5268", mid: "#737C93", faint: "#A3ABBE",
  line: "#E4E9F5", coral: "#2C6BF5", coralDim: "#E8EFFE", teal: "#3D4658", tealDim: "#EEF2FA",
  gold: "#9A6B00", goldDim: "#FBF3E2", red: "#B3261E", redDim: "#FBEAE8",
  band: "#D9E5FF", bandSoft: "#EDF3FF",
};
export const R = { pill: 999, card: 20, inner: 14 };
export const dsp = "'Outfit', system-ui, sans-serif";
export const bdy = "'Outfit', system-ui, sans-serif";
export const typ = "'Roboto Mono', monospace";

export const box = { background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.inner };
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
export const chromeBox = { background: "#fff", border: `1px solid ${k.line}`, borderRadius: 16, boxShadow: "0 10px 28px -18px rgba(11,16,32,.28)" };
