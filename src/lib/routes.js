export const PATHS = {
  home: "/",
  services: "/products",
  pricing: "/pricing",
  drives: "/walk-ins",
  about: "/about",
  contact: "/contact",
  legal: "/legal",
  privacy: "/privacy",
  terms: "/terms",
  demo: "/watch",
  login: "/login",
  signup: "/signup",
  status: "/status",
  developers: "/developers",
};

export function pathFor(id) {
  if (!id) return "/";
  if (id.startsWith("sol:")) return `/solutions/${id.slice(4)}`;
  return PATHS[id] || "/";
}

export function pageFromPath(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/solutions/")) return `sol:${pathname.split("/")[2] || ""}`;
  const hit = Object.entries(PATHS).find(([, p]) => p === pathname);
  return hit ? hit[0] : "";
}
