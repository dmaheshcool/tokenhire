import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { bdy, k } from "../theme.js";
import { pathFor, pageFromPath } from "../lib/routes.js";
import { SiteFooter, SiteNav } from "../pages/marketing/site.jsx";
import { useLaunch } from "./useLaunch.js";

export function SiteLayout() {
  const loc = useLocation();
  const nav = useNavigate();
  const onLaunch = useLaunch();
  const go = (id) => { nav(pathFor(id)); };
  const page = pageFromPath(loc.pathname);

  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  return (
    <div style={{ background: k.cream, color: k.ink, fontFamily: bdy, minHeight: "100vh" }}>
      <SiteNav page={page} go={go} onLaunch={onLaunch} />
      <Outlet context={{ go, onLaunch }} />
      <SiteFooter go={go} onLaunch={onLaunch} />
    </div>
  );
}
