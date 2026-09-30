import { useEffect } from "react";
import { pathFor } from "../lib/routes.js";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ScanLine } from "lucide-react";
import { AudienceStrip, SiteFooter, SiteNav, companyPublicPath } from "../components/SiteChrome.jsx";
import { STROKE } from "../components/ds.jsx";
import { t } from "../i18n/strings.js";
import { useLaunch } from "./useLaunch.js";
import { useTheme } from "../context/Theme.jsx";

export function SiteLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const onLaunch = useLaunch();
  const { theme } = useTheme();
  const go = (id) => { nav(pathFor(id)); };

  useEffect(() => {
    if (loc.hash) {
      const el = document.getElementById(loc.hash.slice(1));
      if (el) { el.scrollIntoView({ block: "start" }); return; }
    }
    window.scrollTo(0, 0);
  }, [loc.pathname, loc.hash]);

  const fab = loc.pathname === "/" || loc.pathname.startsWith("/walk-ins");
  const home = loc.pathname === "/";
  return (
    <div className={`ds${fab ? " has-scan-fab" : ""}`} data-theme={theme}>
      <a href="#main" className="btn btn-dark" style={{ position: "absolute", left: -9999, top: 8 }} onFocus={(e) => { e.currentTarget.style.left = "8px"; }} onBlur={(e) => { e.currentTarget.style.left = "-9999px"; }}>Skip to content</a>
      <SiteNav />
      <main id="main">
        <Outlet context={{ go, onLaunch }} />
      </main>
      {fab && (
        <Link to="/check-in" className="scan-fab hide-desktop">
          <ScanLine size={18} strokeWidth={STROKE} aria-hidden="true" />
          {t("nav.scanCheckIn")}
        </Link>
      )}
      {!home && <AudienceStrip kind={companyPublicPath(loc.pathname) ? "company" : "candidate"} />}
      <SiteFooter />
    </div>
  );
}
