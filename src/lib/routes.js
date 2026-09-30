export const PATHS = {
  home: "/",
  services: "/for-companies",
  companies: "/for-companies",
  pricing: "/for-companies#pricing",
  drives: "/walk-ins",
  how: "/how-it-works",
  questions: "/questions",
  about: "/how-it-works",
  guides: "/guides",
  blog: "/guides",
  contact: "/for-companies#pilot",
  legal: "/legal",
  privacy: "/privacy",
  terms: "/terms",
  demo: "/watch",
  login: "/company/start",
  signup: "/company/start",
  status: "/status",
  developers: "/developers",
};

export function pathFor(id) {
  if (!id) return "/";
  if (id.startsWith("sol:")) return "/for-companies";
  return PATHS[id] || "/";
}

export function pageFromPath(pathname) {
  if (pathname === "/") return "home";
  if (pathname === "/walk-ins" || pathname.startsWith("/walk-ins/")) return "drives";
  if (pathname === "/guides" || pathname.startsWith("/guides/")) return "guides";
  const hit = Object.entries(PATHS).find(([, p]) => p === pathname);
  return hit ? hit[0] : "";
}
