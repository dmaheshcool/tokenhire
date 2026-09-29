import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { pathFor } from "../lib/routes.js";
import { SiteFooter, SiteNav } from "../components/SiteChrome.jsx";
import { useLaunch } from "./useLaunch.js";

// Older pages still paint with fixed light colours, so they opt out of dark mode.
const LIGHT_ONLY = ["/privacy", "/terms", "/legal", "/walk-ins/list", "/walk-ins/confirm"];

export function SiteLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const onLaunch = useLaunch();
  const go = (id) => { nav(pathFor(id)); };

  useEffect(() => {
    if (loc.hash) {
      const el = document.getElementById(loc.hash.slice(1));
      if (el) { el.scrollIntoView({ block: "start" }); return; }
    }
    window.scrollTo(0, 0);
  }, [loc.pathname, loc.hash]);

  const light = LIGHT_ONLY.some((p) => loc.pathname === p);
  return (
    <div className="ds" data-theme={light ? "light" : undefined}>
      <a href="#main" className="btn btn-dark" style={{ position: "absolute", left: -9999, top: 8 }} onFocus={(e) => { e.currentTarget.style.left = "8px"; }} onBlur={(e) => { e.currentTarget.style.left = "-9999px"; }}>Skip to content</a>
      <SiteNav />
      <main id="main">
        <Outlet context={{ go, onLaunch }} />
      </main>
      <SiteFooter />
    </div>
  );
}
