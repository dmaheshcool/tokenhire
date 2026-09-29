import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { TokenMark } from "./brand.jsx";
import { Btn, STROKE } from "./ds.jsx";
import { t } from "../i18n/strings.js";
import { HERO_CITIES, cityPath } from "../lib/listing.js";
import { readSession } from "../lib/api.js";
import { HIDE_PRICING } from "../lib/flags.js";

export const NAV_LINKS = [
  { to: "/walk-ins", label: t("nav.walkIns") },
  { to: "/how-it-works", label: t("nav.how") },
  { to: "/for-companies", label: t("nav.companies") },
  { to: "/guides", label: t("nav.guides") },
];

export function createDrivePath() {
  return readSession()?.orgId ? "/app/drives/new" : "/signup";
}

export function Logo({ size = 30, light }) {
  return (
    <span className="row gap-8" style={{ color: light ? "#fff" : "var(--ink)" }}>
      <TokenMark size={size} />
      <span style={{ font: `800 ${Math.round(size * 0.66)}px/1 var(--font-head)`, letterSpacing: "-0.03em" }}>
        Token<span style={{ color: light ? "var(--lime)" : "var(--primary)" }}>Hire</span>
      </span>
    </span>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const on = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open]);
  return (
    <header className="site-nav">
      <div className="wrap site-nav-inner">
        <Link to="/" aria-label="TokenHire home" style={{ textDecoration: "none" }}><Logo /></Link>
        <nav className="site-nav-links" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} aria-current={undefined} className={({ isActive }) => (isActive ? "active" : "")}
              style={({ isActive }) => (isActive ? { color: "var(--ink)", background: "var(--line)" } : undefined)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-nav-cta">
          <Btn to="/login" variant="ghost">{t("nav.signIn")}</Btn>
          <Btn to={createDrivePath()} variant="dark">{t("nav.createDrive")}</Btn>
        </div>
        <button type="button" className="btn btn-ghost btn-icon site-burger" aria-expanded={open} aria-controls="site-menu" aria-label={open ? t("nav.close") : t("nav.menu")} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} strokeWidth={STROKE} /> : <Menu size={22} strokeWidth={STROKE} />}
        </button>
      </div>
      {open && (
        <div id="site-menu" className="site-menu wrap">
          {NAV_LINKS.map((l) => <Link key={l.to} to={l.to} className="menu-link">{l.label}</Link>)}
          <div className="stack gap-8" style={{ marginTop: 18 }}>
            <Btn to={createDrivePath()} variant="dark" size="lg" block>{t("nav.createDrive")}</Btn>
            <Btn to="/login" variant="secondary" size="lg" block>{t("nav.signIn")}</Btn>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const col = (title, links) => (
    <div>
      <h3>{title}</h3>
      {links.map(([label, to]) => <Link key={label} to={to}>{label}</Link>)}
    </div>
  );
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="site-foot-grid">
          <div className="stack gap-12">
            <Logo size={28} />
            <p className="small muted" style={{ margin: 0, maxWidth: 300 }}>{t("footer.blurb")}</p>
          </div>
          {col(t("footer.candidates"), [[t("footer.browse"), "/walk-ins"], [t("footer.how"), "/how-it-works"], [t("footer.guides"), "/guides"]])}
          {col(t("footer.companies"), [
            [t("footer.runDrive"), "/for-companies"],
            ...(HIDE_PRICING ? [] : [[t("footer.pricing"), "/for-companies#pricing"]]),
            [t("footer.contact"), "/for-companies#pilot"],
            [t("footer.signIn"), "/login"],
          ])}
          {col(t("footer.cities"), HERO_CITIES.map((c) => [c, cityPath(c)]))}
        </div>
        <div className="row between wrap-row gap-12" style={{ borderTop: "1px solid var(--line)", padding: "20px 0 28px" }}>
          <span className="small muted">© {new Date().getFullYear()} {t("footer.rights")}</span>
          <span className="row gap-16">
            <Link to="/privacy" className="small muted" style={{ padding: 0 }}>{t("footer.privacy")}</Link>
            <Link to="/terms" className="small muted" style={{ padding: 0 }}>{t("footer.terms")}</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
