const EMPLOYER_PREFIXES = [
  "/register",
  "/for-companies",
  "/company/start",
  "/company/welcome",
  "/sign-in",
  "/login",
  "/signup",
];

export const FAQ_PREV_KEY = "th:prevPath";
export const FAQ_CURR_KEY = "th:currPath";

export function pathOnly(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      return u.pathname || "";
    }
  } catch { /* not a URL */ }
  return raw.split("?")[0].split("#")[0] || "";
}

export function isEmployerPath(pathname) {
  const p = pathOnly(pathname);
  return EMPLOYER_PREFIXES.some((pre) => p === pre || p.startsWith(`${pre}/`));
}

/** Default FAQ audience from ?for= and the page the visitor just left. */
export function faqAudienceFrom({ searchFor, previousPath, referrer } = {}) {
  const q = String(searchFor || "").toLowerCase().trim();
  if (q === "employers" || q === "employer") return "employers";
  if (q === "candidates" || q === "candidate") return "candidates";
  if (isEmployerPath(previousPath) || isEmployerPath(referrer)) return "employers";
  return "candidates";
}

export function rememberFaqPath(pathname) {
  if (typeof sessionStorage === "undefined") return;
  try {
    const curr = sessionStorage.getItem(FAQ_CURR_KEY) || "";
    const next = pathOnly(pathname);
    if (curr && curr !== next) sessionStorage.setItem(FAQ_PREV_KEY, curr);
    if (next) sessionStorage.setItem(FAQ_CURR_KEY, next);
  } catch { /* private mode */ }
}

export function readPrevFaqPath() {
  if (typeof sessionStorage === "undefined") return "";
  try { return sessionStorage.getItem(FAQ_PREV_KEY) || ""; } catch { return ""; }
}

export function faqJsonLd(groups) {
  const entities = [];
  for (const group of groups || []) {
    for (const item of group.items || []) {
      if (!item?.q || !item?.a) continue;
      entities.push({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      });
    }
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entities,
  };
}
