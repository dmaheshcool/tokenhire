import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Briefcase, CreditCard, LayoutList, LogOut, MapPin, Plug, Plus, Settings, Sun, UserRound, Users } from "lucide-react";
import { useStore } from "../context/Store.jsx";
import { OrgLogo } from "../components/brand.jsx";
import { Btn, STROKE } from "../components/ds.jsx";
import { AudienceStrip, Logo } from "../components/SiteChrome.jsx";
import { HIDE_PRICING } from "../lib/flags.js";
import { setupProgress } from "../lib/setup.js";
import { t } from "../i18n/strings.js";

const SETUP_NAV = [
  { to: "/app/team", label: t("console.nav.team"), icon: Users, recruiter: true },
  { to: "/app/hiring-teams", label: t("console.nav.hiringTeams"), icon: Briefcase, recruiter: true },
  { to: "/app/venues", label: t("console.nav.venues"), icon: MapPin, recruiter: true },
  { to: "/app/library", label: t("console.nav.library"), icon: BookOpen, recruiter: true },
];
const RUN_NAV = [
  { to: "/app/today", label: t("console.nav.today"), icon: Sun },
  { to: "/app/drives", label: t("console.nav.drives"), icon: LayoutList },
  { to: "/app/talent", label: t("console.nav.talent"), icon: UserRound, recruiter: true },
];
const ACCOUNT_NAV = [
  { to: "/app/integrations", label: t("console.nav.integrations"), icon: Plug, recruiter: true },
  { to: "/app/billing", label: t("console.nav.billing"), icon: CreditCard, recruiter: true, billing: true },
  { to: "/app/settings", label: t("console.nav.settings"), icon: Settings, recruiter: true },
];

export const CONSOLE_NAV = [...SETUP_NAV, ...RUN_NAV, ...ACCOUNT_NAV];

export function useConsole() {
  const store = useStore();
  const org = store.orgs.find((o) => o.id === store.activeOrgId);
  const desk = store.staffRole === "frontdesk";
  const mine = store.drives.filter((d) => org && d.orgId === org.id);
  return { ...store, org, desk, mine };
}

export function PageHead({ title, lede, actions }) {
  return (
    <div className="row between gap-16" style={{ flexWrap: "wrap", marginBottom: 24, alignItems: "flex-end" }}>
      <div className="stack gap-4">
        <h1 className="h-2">{title}</h1>
        {lede && <p className="body muted">{lede}</p>}
      </div>
      {actions && <div className="row gap-8" style={{ flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

function NavGroup({ label, extra, items, desk }) {
  const shown = items.filter((it) => (!desk || !it.recruiter) && (!it.billing || !HIDE_PRICING));
  if (!shown.length) return null;
  return (
    <div className="console-nav-group">
      <p className="console-nav-label">{label}{extra ? <span style={{ display: "block", letterSpacing: 0, textTransform: "none", fontWeight: 600, marginTop: 2 }}>{extra}</span> : null}</p>
      <nav className="console-nav">
        {shown.map(({ to, label: lab, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : "")}>
            <Icon size={19} strokeWidth={STROKE} aria-hidden="true" />{lab}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function ConsoleLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const { org, desk, signOut, staffEmail, mine } = useConsole();
  const [leaving, setLeaving] = useState(false);
  if (leaving) return <Navigate to="/" replace />;
  if (!org) return <Navigate to="/company/start" replace state={{ from: loc.pathname }} />;
  if (org.verified === false) return <Navigate to="/company/start" replace />;
  if (org.hireForAsked === false) return <Navigate to="/company/welcome" replace />;
  const setup = setupProgress(org, mine);
  const mobile = desk ? RUN_NAV : [...RUN_NAV, { to: "/app/settings", label: t("console.nav.settings"), icon: Settings }];
  const out = async () => { await signOut(); setLeaving(true); nav("/", { replace: true }); };
  return (
    <div className="ds console" data-theme="light">
      <aside className="console-side" aria-label="Console">
        <Link to="/" style={{ textDecoration: "none", padding: "2px 8px" }} aria-label="TokenHire home"><Logo size={26} /></Link>
        <NavGroup label={t("console.navGroups.setup")} extra={setup.complete ? null : t("console.setup.doneOf", { done: setup.done })} items={SETUP_NAV} desk={desk} />
        <NavGroup label={t("console.navGroups.run")} items={RUN_NAV} desk={desk} />
        <NavGroup label={t("console.navGroups.account")} items={ACCOUNT_NAV} desk={desk} />
        <div className="stack gap-4" style={{ marginTop: "auto" }}>
          <div className="row gap-8" style={{ padding: "10px 12px", borderTop: "1px solid var(--line)" }}>
            <span className="grow tiny muted" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staffEmail}</span>
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={out} aria-label={t("console.signOut")} title={t("console.signOut")}><LogOut size={17} strokeWidth={STROKE} /></button>
          </div>
        </div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <header className="console-top">
          <div className="row gap-12" style={{ minWidth: 0 }}>
            <OrgLogo name={org.short || org.name} color={org.color} logo={org.logo} size={32} />
            <div style={{ minWidth: 0 }}>
              <p className="strong" style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.name}</p>
              <p className="tiny muted" style={{ margin: 0 }}>{desk ? "Front desk" : "Recruiter"}</p>
            </div>
          </div>
          <div className="row gap-8">
            {!desk && <Btn to="/app/drives/new" icon={Plus} size="sm" aria-label={t("console.createDrive")}><span className="hide-mobile">{t("console.createDrive")}</span><span className="show-mobile">New</span></Btn>}
            <button type="button" className="btn btn-ghost btn-icon show-mobile" onClick={out} aria-label={t("console.signOut")}><LogOut size={18} strokeWidth={STROKE} /></button>
          </div>
        </header>
        <main className="console-body">
          <Outlet />
        </main>
        <AudienceStrip kind="company" />
      </div>
      <nav className="console-bottom" aria-label="Console">
        {mobile.filter((it) => !desk || !it.recruiter).map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : "")}>
            <Icon size={20} strokeWidth={STROKE} aria-hidden="true" />{label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
