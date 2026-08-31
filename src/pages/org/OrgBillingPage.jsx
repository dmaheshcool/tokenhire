import { Link } from "react-router-dom";
import { useStore } from "../../context/Store.jsx";
import { driveSlotsLeft, planLimits, planOf, planPrice, PUBLIC_PLANS, renewsOn } from "../../lib/helpers.js";
import { box, bdy, dsp, k, outlineSm, solidSm, typ } from "../../theme.js";

function fmtRenew(iso) {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function OrgBillingPage() {
  const { orgs, setOrgs, activeOrgId, drives } = useStore();
  const org = orgs.find((o) => o.id === activeOrgId);
  if (!org) return null;
  const spec = planOf(org);
  const cycle = org.billingCycle === "year" ? "year" : "month";
  const lim = planLimits(org);
  const slots = driveSlotsLeft(org, drives);
  const cost = planPrice(spec, cycle);
  const renew = org.renewsOn || renewsOn(cycle);

  function apply(next) {
    const nextCycle = next.billingCycle || cycle;
    const nextPlan = next.plan || spec.id;
    setOrgs((p) => p.map((o) => (o.id === org.id ? {
      ...o,
      plan: nextPlan,
      billingCycle: nextCycle,
      renewsOn: renewsOn(nextCycle),
    } : o)));
  }

  return (
    <div>
      <h1 style={{ fontFamily: dsp, fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Plan & billing</h1>
      <p style={{ fontSize: 14, color: k.mid, margin: "0 0 18px" }}>Subscription is live in this demo. No card is charged.</p>

      <div style={{ ...box, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: 0.6, textTransform: "uppercase" }}>Current subscription</div>
        <div style={{ fontFamily: dsp, fontSize: 28, fontWeight: 800, margin: "8px 0 4px" }}>{spec.name}</div>
        <div style={{ fontSize: 15, color: k.ink2 }}>
          {cost.label}{cost.unit ? ` ${cost.unit}` : ""}
          {cost.billed ? ` · ${cost.billed}` : ""}
        </div>
        {spec.monthInr ? (
          <div style={{ fontSize: 13.5, color: k.mid, marginTop: 6 }}>
            {cycle === "year" ? "Yearly" : "Monthly"} · renews {fmtRenew(renew)}
          </div>
        ) : (
          <div style={{ fontSize: 13.5, color: k.mid, marginTop: 6 }}>{spec.validity}</div>
        )}

        {spec.monthInr ? (
          <div style={{ display: "inline-flex", padding: 4, borderRadius: 999, background: k.cream2, gap: 4, marginTop: 16 }}>
            {[["month", "Monthly"], ["year", "Yearly · 2 months free"]].map(([id, lab]) => (
              <button key={id} type="button" onClick={() => apply({ billingCycle: id })} style={{
                border: "none", borderRadius: 999, padding: "8px 14px", cursor: "pointer", fontFamily: bdy, fontSize: 13, fontWeight: 600,
                background: cycle === id ? "#fff" : "transparent", color: cycle === id ? k.ink : k.mid,
                boxShadow: cycle === id ? "0 0 0 1px " + k.line : "none",
              }}>{lab}</button>
            ))}
          </div>
        ) : null}

        <ul style={{ margin: "16px 0 0", paddingLeft: 18, fontSize: 13.5, color: k.ink2, lineHeight: 1.7 }}>
          {spec.feats.map((f) => <li key={f}>{f}</li>)}
        </ul>
        <div style={{ marginTop: 16, fontSize: 13, color: k.mid }}>
          {lim.drives < 999 ? `${slots} walk-in${slots === 1 ? "" : "s"} left${spec.multiDay ? " this month" : ""}.` : "Walk-ins are included on this plan."}
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: k.ink, margin: "8px 0 10px" }}>Change plan</div>
      <div style={{ display: "grid", gap: 10 }}>
        {PUBLIC_PLANS.map((p) => {
          const on = spec.id === p.id;
          const price = planPrice(p, cycle);
          return (
            <div key={p.id} style={{ ...box, padding: "16px 18px", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", borderColor: on ? k.ink : k.line }}>
              <div>
                <div style={{ fontFamily: dsp, fontSize: 17, fontWeight: 700 }}>{p.name}{on ? <span style={{ fontSize: 11, fontFamily: typ, color: k.coral, marginLeft: 8, fontWeight: 700 }}>CURRENT</span> : null}</div>
                <div style={{ fontSize: 13, color: k.mid, marginTop: 3 }}>{p.validity}</div>
                <div style={{ fontSize: 13.5, color: k.ink2, marginTop: 4 }}>{price.label}{price.unit ? ` ${price.unit}` : ""}{price.billed ? ` · ${price.billed}` : ""}</div>
              </div>
              {on ? (
                <span style={{ fontSize: 12.5, color: k.faint, fontWeight: 600 }}>On this plan</span>
              ) : (
                <button type="button" onClick={() => apply({ plan: p.id })} style={p.best ? solidSm : outlineSm}>
                  {p.monthInr ? "Subscribe" : "Switch"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
        <Link to="/pricing" style={{ ...outlineSm, textDecoration: "none" }}>See public pricing</Link>
        <Link to="/contact" style={{ ...outlineSm, textDecoration: "none" }}>Need more halls or SSO? Talk to us</Link>
      </div>
    </div>
  );
}
