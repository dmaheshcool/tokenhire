import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, Bookmark, ChevronDown, Menu, Moon, ScanLine, Search, Sun, X } from "lucide-react";
import { TokenMark } from "./brand.jsx";
import { Btn, STROKE, useSaved } from "./ds.jsx";
import { CityChip } from "./CityChip.jsx";
import { t, tl } from "../i18n/strings.js";
import { readSession } from "../lib/api.js";
import { useTheme } from "../context/Theme.jsx";

export const NAV_LINKS = [
  { to: "/walk-ins", label: t("nav.walkIns") },
  { to: "/how-it-works", label: t("nav.how") },
  { to: "/guides", label: t("nav.guides") },
];

export function createDrivePath() {
  return readSession()?.orgId ? "/app/drives/new" : "/register";
}

export function Logo({ size = 30, light }) {
  return (
    <span className="row gap-8" style={{ color: light ? "#fff" : "var(--ink)" }}>
      <TokenMark size={size} />
      <span style={{ font: `800 ${Math.round(size * 0.66)}px/1 var(--font-head)`, letterSpacing: "-0.01em" }}>
        Token<span style={{ color: light ? "var(--slate-accent)" : "var(--primary)" }}>Hire</span>
      </span>
    </span>
  );
}

function SavedLink({ className = "" }) {
  const saved = useSaved();
  const label = saved.count ? t("nav.savedCount", { n: saved.count }) : t("nav.saved");
  return (
    <Link to="/saved" className={`btn btn-ghost btn-icon nav-saved ${className}`} aria-label={label} title={label}>
      <Bookmark size={20} strokeWidth={STROKE} aria-hidden="true" />
      {saved.count > 0 && <span className="nav-badge" aria-hidden="true">{saved.count > 99 ? "99+" : saved.count}</span>}
    </Link>
  );
}

export function AudienceStrip({ kind }) {
  if (kind === "company") {
    return (
      <p className="audience-strip">
        {t("strip.jobLead")} <Link to="/walk-ins">{t("strip.jobLink")}</Link>
      </p>
    );
  }
  return (
    <p className="audience-strip">
      {t("strip.hireLead")} <Link to="/for-companies">{t("strip.hireLink")}</Link>
    </p>
  );
}

export function companyPublicPath(pathname) {
  return pathname === "/for-companies"
    || pathname.startsWith("/walk-ins/list")
    || pathname.startsWith("/walk-ins/confirm");
}

function ThemeToggle({ className = "" }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button type="button" className={`btn btn-ghost btn-icon ${className}`.trim()} onClick={toggle}
      aria-label={dark ? t("nav.themeLight") : t("nav.themeDark")}
      title={dark ? t("nav.themeLight") : t("nav.themeDark")}>
      {dark ? <Sun size={20} strokeWidth={STROKE} aria-hidden="true" /> : <Moon size={20} strokeWidth={STROKE} aria-hidden="true" />}
    </button>
  );
}

const EMPLOYER_ITEMS = [
  { to: "/company/start", label: t("nav.employerSignIn"), sub: t("nav.employerSignInSub") },
  { to: "/register", label: t("nav.startHiring"), sub: t("nav.startHiringSub") },
  { to: "/for-companies#pilot", label: t("nav.bookPilot"), sub: t("nav.bookPilotSub") },
];

function EmployerMenu({ onClose }) {
  return (
    <div className="nav-employer-menu" role="menu">
      {EMPLOYER_ITEMS.map((item) => (
        <Link key={item.to} to={item.to} role="menuitem" onClick={onClose}>
          <span>{item.label}</span>
          <span className="nav-employer-sub">{item.sub}</span>
        </Link>
      ))}
    </div>
  );
}

function ForEmployers({ mobileSheet, setMobileSheet }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const loc = useLocation();
  useEffect(() => { setOpen(false); setMobileSheet?.(false); }, [loc.pathname, loc.hash, setMobileSheet]);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    const narrow = typeof window !== "undefined" && window.matchMedia("(max-width: 900px)").matches;
    if (narrow && setMobileSheet) setMobileSheet((v) => !v);
    else setOpen((v) => !v);
  }

  return (
    <div className="nav-companies" ref={wrap}>
      <button type="button" className="btn btn-secondary" aria-expanded={open || !!mobileSheet} aria-haspopup="menu" onClick={toggle}>
        {t("nav.companies")}
        <ChevronDown size={16} strokeWidth={STROKE} aria-hidden="true" />
      </button>
      {open && <EmployerMenu onClose={() => setOpen(false)} />}
    </div>
  );
}

export function SiteNav() {
  const saved = useSaved();
  const [open, setOpen] = useState(false);
  const [employerSheet, setEmployerSheet] = useState(false);
  const loc = useLocation();
  useEffect(() => { setOpen(false); }, [loc.pathname, loc.hash]);
  useEffect(() => {
    if (!open && !employerSheet) return undefined;
    const on = (e) => { if (e.key === "Escape") { setOpen(false); setEmployerSheet(false); } };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [open, employerSheet]);
  return (
    <header className="site-nav">
      <div className="wrap site-nav-inner">
        <Link to="/" aria-label={t("nav.home")} style={{ textDecoration: "none" }}><Logo /></Link>
        <nav className="site-nav-links" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} aria-current={undefined} className={({ isActive }) => (isActive ? "active" : "")}
              style={({ isActive }) => (isActive ? { color: "var(--ink)", background: "var(--line)" } : undefined)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-nav-cta">
          <ThemeToggle />
          <SavedLink />
          <Btn to="/check-in" icon={ScanLine}>{t("nav.scanCheckIn")}</Btn>
          <ForEmployers />
        </div>
        <Link to="/check-in" className="btn btn-primary btn-icon nav-scan-mobile" aria-label={t("nav.scanCheckIn")} title={t("nav.scanCheckIn")}>
          <ScanLine size={20} strokeWidth={STROKE} aria-hidden="true" />
        </Link>
        <SavedLink className="nav-saved-mobile" />
        <ThemeToggle className="nav-theme-mobile" />
        <span className="nav-employer-mobile"><ForEmployers mobileSheet={employerSheet} setMobileSheet={setEmployerSheet} /></span>
        <button type="button" className="btn btn-ghost btn-icon site-burger" aria-expanded={open} aria-controls="site-menu" aria-label={open ? t("nav.close") : t("nav.menu")} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={22} strokeWidth={STROKE} /> : <Menu size={22} strokeWidth={STROKE} />}
        </button>
      </div>
      {open && (
        <div id="site-menu" className="site-menu wrap">
          {NAV_LINKS.map((l) => <Link key={l.to} to={l.to} className="menu-link">{l.label}</Link>)}
          <Link to="/saved" className="menu-link">{saved.count ? t("nav.savedCount", { n: saved.count }) : t("nav.saved")}</Link>
          <button type="button" className="menu-link" onClick={() => { setOpen(false); setEmployerSheet(true); }}>{t("nav.companies")}</button>
          <div className="stack gap-8" style={{ marginTop: 18 }}>
            <Btn to="/check-in" variant="primary" size="lg" block icon={ScanLine}>{t("nav.scanCheckIn")}</Btn>
          </div>
        </div>
      )}
      {employerSheet && (
        <div className="filter-sheet" role="dialog" aria-modal="true" aria-label={t("nav.companies")} onClick={(e) => { if (e.target === e.currentTarget) setEmployerSheet(false); }}>
          <div>
            <div className="row between" style={{ marginBottom: 12 }}>
              <h2 className="h-3">{t("nav.companies")}</h2>
              <button type="button" className="btn btn-ghost btn-icon" aria-label={t("nav.close")} onClick={() => setEmployerSheet(false)}><X size={22} strokeWidth={STROKE} /></button>
            </div>
            <EmployerMenu onClose={() => setEmployerSheet(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const email = t("footer.email");
  const col = (title, links) => (
    <div className="site-foot-col">
      <h3>{title}</h3>
      {links.map(([label, to]) => (to.startsWith("mailto:") ? <a key={label} href={to}>{label}</a> : <Link key={label} to={to}>{label}</Link>))}
    </div>
  );
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="site-foot-top">
          <div className="stack gap-8">
            <Logo size={28} />
            <p className="small muted" style={{ margin: 0 }}>{t("tagline")}</p>
          </div>
          <div className="foot-btns">
            <Link to="/walk-ins" className="foot-btn foot-btn-primary">
              <Search size={16} strokeWidth={STROKE} aria-hidden="true" />
              {t("buttons.browse")}
            </Link>
            <Link to="/register" className="foot-btn foot-btn-secondary">
              {t("nav.startHiring")}
              <ArrowRight className="foot-btn-arrow" size={16} strokeWidth={STROKE} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="site-foot-grid">
          {col(t("footer.forCandidates"), [[t("footer.browse"), "/walk-ins"], [t("nav.scanCheckIn"), "/check-in"], [t("footer.saved"), "/saved"], [t("candidate.tabs.details"), "/me"], [t("candidate.tabs.tokens"), "/tokens"], [t("footer.how"), "/how-it-works"], [t("footer.questions"), "/questions?for=candidates"], [t("footer.guides"), "/guides"]])}
          {col(t("footer.forCompanies"), [
            [t("nav.startHiring"), "/register"],
            [t("nav.employerSignIn"), "/company/start"],
            [t("footer.bookPilot"), "/for-companies#pilot"],
            [t("footer.howCompanies"), "/how-it-works?for=employers"],
            [t("footer.questions"), "/questions?for=employers"],
          ])}
          {col(t("footer.company"), [[t("footer.privacy"), "/privacy"], [t("footer.terms"), "/terms"], [email, `mailto:${email}`]])}
        </div>
        <div className="site-foot-cities">
          <p className="site-foot-cities-label">{t("footer.citiesLabel")}</p>
          <nav className="site-foot-city-list" aria-label={t("footer.citiesAria")}>
            {tl("footer.cities").map((c) => <CityChip key={c} city={c} />)}
          </nav>
        </div>
        <div className="site-foot-bar">
          <span className="small muted">{t("footer.line")}</span>
          <span className="small muted">{t("footer.copyright", { year: 2026 })}</span>
        </div>
      </div>
    </footer>
  );
}
