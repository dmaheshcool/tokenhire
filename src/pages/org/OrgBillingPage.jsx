import { Link } from "react-router-dom";
import { useStore } from "../../context/Store.jsx";
import { driveSlotsLeft, planCycle, planLimits, planOf, planPrice, PUBLIC_PLANS, renewsOn } from "../../lib/helpers.js";
import { box, dsp, k, outlineSm, solidSm, typ } from "../../theme.js";
import { formatIST } from "../../lib/time.js";

function fmtRenew(iso) {
  if (!iso) return "—";
  return formatIST(iso, { date: true, year: true }) || iso;
}

export default function OrgBillingPage() {
  const { orgs, setOrgs, activeOrgId, drives } = useStore();
  const org = orgs.find((o) => o.id === activeOrgId);
  if (!org) return null;
  const spec = planOf(org);
  const cycle = org.billingCycle || planCycle(spec);
  const lim = planLimits(org);
  const slots = driveSlotsLeft(org, drives);
  const cost = planPrice(spec);
  const renew = org.renewsOn || renewsOn(cycle);

  function apply(next) {
    const nextPlan = next.plan || spec.id;
    const nextSpec = PUBLIC_PLANS.find((p) => p.id === nextPlan) || spec;
    const nextCycle = planCycle(nextSpec);
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
        {spec.monthInr || spec.talk ? (
          <div style={{ fontSize: 13.5, color: k.mid, marginTop: 6 }}>
            {cycle === "drive" ? "One hiring drive · no subscription"
              : cycle === "6month" ? `Every 6 months · renews ${fmtRenew(renew)}`
              : cycle === "year" ? `Yearly · renews ${fmtRenew(renew)}`
              : spec.talk ? spec.validity
              : `Monthly · renews ${fmtRenew(renew)}`}
          </div>
        ) : (
          <div style={{ fontSize: 13.5, color: k.mid, marginTop: 6 }}>{spec.validity}</div>
        )}

        <ul style={{ margin: "16px 0 0", paddingLeft: 18, fontSize: 13.5, color: k.ink2, lineHeight: 1.7 }}>
          {spec.feats.map((f) => <li key={f}>{f}</li>)}
        </ul>
        <div style={{ marginTop: 16, fontSize: 13, color: k.mid }}>
          {lim.drives < 999 ? `${slots} hiring drive${slots === 1 ? "" : "s"} left${spec.multiDay ? " this month" : ""}.` : "Hiring drives are included on this plan."}
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: k.ink, margin: "8px 0 10px" }}>Change plan</div>
      <div style={{ display: "grid", gap: 10 }}>
        {PUBLIC_PLANS.map((p) => {
          const on = spec.id === p.id;
          const price = planPrice(p);
          return (
            <div key={p.id} style={{ ...box, padding: "16px 18px", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", borderColor: on ? k.ink : k.line }}>
              <div>
                <div style={{ fontFamily: dsp, fontSize: 17, fontWeight: 700 }}>{p.name}{on ? <span style={{ fontSize: 11, fontFamily: typ, color: k.coral, marginLeft: 8, fontWeight: 700 }}>CURRENT</span> : null}</div>
                <div style={{ fontSize: 13, color: k.mid, marginTop: 3 }}>{p.validity}</div>
                <div style={{ fontSize: 13.5, color: k.ink2, marginTop: 4 }}>{price.label}{price.unit ? ` ${price.unit}` : ""}{price.billed ? ` · ${price.billed}` : ""}</div>
              </div>
              {on ? (
                <span style={{ fontSize: 12.5, color: k.faint, fontWeight: 600 }}>On this plan</span>
              ) : p.talk ? (
                <Link to="/for-companies#pilot" style={{ ...outlineSm, textDecoration: "none" }}>Talk to us</Link>
              ) : (
                <button type="button" onClick={() => apply({ plan: p.id })} style={p.best ? solidSm : outlineSm}>
                  {p.cta || "Subscribe"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
        <Link to="/for-companies#pricing" style={{ ...outlineSm, textDecoration: "none" }}>See pricing</Link>
        <Link to="/for-companies#pilot" style={{ ...outlineSm, textDecoration: "none" }}>Talk to us</Link>
      </div>
    </div>
  );
}
