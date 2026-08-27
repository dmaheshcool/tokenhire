import { Building2, CreditCard, HeartHandshake, Palette, Shield, Users2, ArrowLeft } from "lucide-react";
import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { OrgLogo } from "../components/brand.jsx";
import { useStore } from "../context/Store.jsx";
import { isAgencyOrg, orgWash, planLimits, planOf } from "../lib/helpers.js";
import { bdy, dsp, k } from "../theme.js";

const ITEMS = [
  { to: "/org/team", label: "Team", icon: Users2 },
  { to: "/org/sites", label: "Clients & sites", icon: HeartHandshake },
  { to: "/org/brand", label: "Brand", icon: Palette },
  { to: "/org/billing", label: "Plan & billing", icon: CreditCard },
  { to: "/org/settings", label: "Company", icon: Building2 },
  { to: "/org/security", label: "Security", icon: Shield },
];

export function OrgLayout() {
  const loc = useLocation();
  const { orgs, activeOrgId, staffRole } = useStore();
  const org = orgs.find((o) => o.id === activeOrgId);
  if (!activeOrgId || !org) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  const accent = org.color || k.coral;
  const items = ITEMS.map((it) => (
    it.to === "/org/sites"
      ? { ...it, label: isAgencyOrg(org) && planLimits(org).clients ? "Clients & sites" : "Sites" }
      : it
  ));

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: orgWash(org), fontFamily: bdy, color: k.ink }}>
      <aside style={{ width: 232, flexShrink: 0, background: "#fff", borderRight: `1px solid ${k.line}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 14px 12px" }}>
          <Link to="/app/hiring" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: k.ink2, textDecoration: "none" }}>
            <ArrowLeft size={15} /> HQ
          </Link>
        </div>
        <div style={{ padding: "4px 14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <OrgLogo name={org.short || org.name} color={accent} logo={org.logo} size={36} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: dsp, fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{org.name}</div>
            <div style={{ fontSize: 12, color: k.mid, marginTop: 2 }}>{planOf(org).name} · {staffRole}</div>
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px 16px" }}>
          {items.map(({ to, label, icon: I }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
              borderRadius: 10, textDecoration: "none",
              background: isActive ? `${accent}18` : "transparent", color: isActive ? accent : k.ink2,
              fontWeight: isActive ? 700 : 500, fontSize: 13.5, fontFamily: bdy,
            })}>
              <I size={16} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div style={{ flex: 1, minWidth: 0, padding: 26, maxWidth: 720 }}>
        <Outlet />
      </div>
    </div>
  );
}
