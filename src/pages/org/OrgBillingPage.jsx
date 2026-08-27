import { Link } from "react-router-dom";
import { useStore } from "../../context/Store.jsx";
import { driveSlotsLeft, planLimits, planOf } from "../../lib/helpers.js";
import { box, dsp, k, outlineSm, solidSm } from "../../theme.js";

export default function OrgBillingPage() {
  const { orgs, activeOrgId, drives } = useStore();
  const org = orgs.find((o) => o.id === activeOrgId);
  if (!org) return null;
  const spec = planOf(org);
  const lim = planLimits(org);
  const slots = driveSlotsLeft(org, drives);
  return (
    <div>
      <h1 style={{ fontFamily: dsp, fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Plan & billing</h1>
      <p style={{ fontSize: 14, color: k.mid, margin: "0 0 18px" }}>Limits are enforced in the product. This demo does not charge a card.</p>
      <div style={{ ...box, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: 0.6, textTransform: "uppercase" }}>Current plan</div>
        <div style={{ fontFamily: dsp, fontSize: 28, fontWeight: 800, margin: "8px 0 4px" }}>{spec.name}</div>
        <div style={{ fontSize: 15, color: k.ink2 }}>{spec.price}{spec.unit} · {spec.validity}</div>
        <ul style={{ margin: "16px 0 0", paddingLeft: 18, fontSize: 13.5, color: k.ink2, lineHeight: 1.7 }}>
          {spec.feats.map((f) => <li key={f}>{f}</li>)}
        </ul>
        <div style={{ marginTop: 16, fontSize: 13, color: k.mid }}>
          {lim.drives < 999 ? `${slots} drive slot${slots === 1 ? "" : "s"} left${spec.multiDay ? " this month" : ""}.` : "Unlimited drive slots on this plan."}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
          <Link to="/pricing" style={{ ...solidSm, textDecoration: "none" }}>See pricing</Link>
          <Link to="/contact" style={{ ...outlineSm, textDecoration: "none" }}>Talk to us</Link>
        </div>
      </div>
    </div>
  );
}
