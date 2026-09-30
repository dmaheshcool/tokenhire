import { k } from "../theme.js";
import { INDIA_CITIES } from "../data/indiaCities.js";
import { driveStatus, driveWhen, istDate, istNow, tokensOpen, deskOpen } from "./status.js";
import { formatNumber } from "./time.js";

export { INDIA_CITIES };
export { driveStatus, driveWhen, tokensOpen, deskOpen };

export const ROTATE = 45, NOTIFY_MIN = 15, FALLBACK_TAT = 8, MIN = 6e4;

// Listed on every tier once, above the cards, rather than repeated inside each one.
export const PRODUCT_FEATS = [
  "Candidate registration with resume and contact details",
  "QR check-in at the lobby display",
  "Live token page on the candidate’s phone",
  "Lobby display with now serving and up next",
  "One shared queue — recruiters, rooms, and rounds included",
  "Encrypted resume files recruiters can download",
  "Day-end extract ready to send to your ATS",
];

// Recruiters / rooms / rounds are product, not SKUs. Paid plans use a high
// fair-use candidate cap that we never advertise as a number.
export const OPEN_SEATS = 999;
export const FAIR_USE_CANDIDATES = 5000;

function listedLimits({ drives, sites, candidates, reports, wa = 0, notify = false, audit = false, whiteLabel = false, sla = false, sso = false, clients = false, credit = "on" }) {
  return {
    drives, sites, cities: 99, seats: OPEN_SEATS, tvsPerSite: 24, wa, candidates,
    clients, whiteLabel, credit, audit, sla, sso, notify, reports, rooms: true,
  };
}

// Drives the pricing comparison table. Keeping it derived from `limits` means the
// table can never drift from what the app actually enforces.
export const PLAN_ROWS = [
  { label: "Hiring drives", get: (l, p) => (p?.talk ? "Custom" : l.drives >= 999 ? "Unlimited" : "1") },
  { label: "Locations", get: (l, p) => (p?.talk ? "Custom" : l.sites <= 1 ? "1" : "Multiple") },
  { label: "Candidates", get: () => "No per-candidate charges" },
  { label: "Recruiters, rooms, rounds", get: () => "Included" },
  { label: "Live token page", get: () => true },
  { label: "Lobby display", get: () => true },
  { label: "Reports", get: (l) => l.reports },
  { label: "Branding", get: (l) => l.whiteLabel },
  { label: "Multiple clients", get: (l) => l.clients },
];
export const PLANS = [
  {
    id: "setup", name: "Account", monthInr: 0, yearInr: 0, price: "₹0", unit: "", annual: "", listed: false,
    validity: "Account", blurb: "Create drives. The scan turns on after you pay.",
    best: false, multiDay: true, cta: "Create account",
    highlights: [],
    feats: ["Company account", "Create a walk-in"],
    limits: listedLimits({ drives: 999, sites: 99, candidates: FAIR_USE_CANDIDATES, reports: true }),
  },
  {
    id: "trial", name: "Free", monthInr: 0, yearInr: 0, price: "₹0", unit: "", annual: "", listed: false,
    validity: "Internal demo", blurb: "Unlisted.",
    best: false, multiDay: false, cta: "Start",
    highlights: [],
    feats: ["Internal only"],
    limits: listedLimits({ drives: 1, sites: 1, candidates: 10, reports: false }),
  },
  {
    id: "single", name: "Single Drive", monthInr: 2500, yearInr: 2500, periodInr: 2500, bill: "drive", price: "₹2,500", unit: "/ drive", annual: "₹2,500", listed: true,
    validity: "One hiring drive", blurb: "One drive. Everything included.",
    best: false, multiDay: false, cta: "Run a drive",
    highlights: [
      "Unlimited candidates",
      "Unlimited recruiters",
      "Unlimited rooms & rounds",
      "Digital tokens & live queue",
      "Candidate tracking",
      "Lobby display",
      "Reports",
    ],
    feats: ["One hiring drive", "No subscription", "No per-candidate charges", ...PRODUCT_FEATS],
    limits: listedLimits({ drives: 1, sites: 1, candidates: FAIR_USE_CANDIDATES, reports: true }),
  },
  {
    id: "pack5", name: "Pro", monthInr: 8000, yearInr: 80000, periodInr: 8000, bill: "month", price: "₹8,000", unit: "/ month", annual: "₹8,000/mo", listed: true,
    validity: "Unlimited hiring drives", blurb: "For teams that hire regularly.",
    ribbon: "MOST POPULAR", best: true, multiDay: true, cta: "Start hiring",
    builds: "single",
    highlights: [
      "Unlimited hiring drives",
      "Multiple locations",
      "Company branding",
      "Advanced workflows",
      "Priority support",
    ],
    feats: ["Unlimited hiring drives", "No per-candidate charges", "Cancel anytime", ...PRODUCT_FEATS],
    limits: listedLimits({ drives: 999, sites: 99, candidates: FAIR_USE_CANDIDATES, reports: true, whiteLabel: true }),
  },
  {
    id: "pack10", name: "Platinum", monthInr: 42000, yearInr: 420000, price: "₹42,000", unit: "/ month", annual: "₹35,000/mo", listed: false,
    validity: "More walk-ins", blurb: "Unlisted.",
    best: false, multiDay: true, cta: "Talk to us",
    highlights: [],
    feats: PRODUCT_FEATS,
    limits: listedLimits({ drives: 999, sites: 99, candidates: FAIR_USE_CANDIDATES, reports: true, audit: true }),
  },
  {
    id: "pack25", name: "Agency", monthInr: 60000, yearInr: 600000, price: "₹60,000", unit: "/ month", annual: "₹50,000/mo", listed: false,
    validity: "Client halls", blurb: "Unlisted.",
    best: false, multiDay: true, cta: "Talk to us",
    highlights: [],
    feats: PRODUCT_FEATS,
    limits: listedLimits({ drives: 999, sites: 99, candidates: FAIR_USE_CANDIDATES, reports: true, audit: true, whiteLabel: true, sla: true, clients: true, credit: "tiny" }),
  },
  {
    id: "enterprise", name: "Enterprise", monthInr: null, yearInr: null, price: "Custom", unit: "", annual: "", listed: true, talk: true,
    validity: "High-volume recruitment", blurb: "For high-volume recruitment.",
    best: false, multiDay: true, cta: "Talk to us",
    builds: "pack5",
    highlights: [
      "Multiple clients",
      "Multiple locations",
      "Custom workflows",
      "Integrations & API",
      "Dedicated support",
    ],
    feats: ["Multiple clients", "Custom workflows", "Integrations and API", "Dedicated support"],
    limits: listedLimits({ drives: 999, sites: 99, candidates: FAIR_USE_CANDIDATES, reports: true, audit: true, whiteLabel: true, sla: true, sso: true, clients: true, credit: "tiny" }),
  },
];
export function inr(n) {
  return `₹${formatNumber(n)}`;
}
export function planPrice(plan) {
  if (plan.talk || plan.monthInr == null) return { label: plan.price || "Custom", unit: "", billed: "" };
  if (!plan.monthInr) return { label: "₹0", unit: "", billed: "" };
  if (plan.bill === "drive") return { label: inr(plan.periodInr || plan.monthInr), unit: "/ drive", billed: "No subscription · Pay only when you hire" };
  if (plan.bill === "6month") return { label: inr(plan.periodInr), unit: "/ 6 months", billed: "" };
  if (plan.bill === "year") return { label: inr(plan.yearInr), unit: "/ year", billed: "" };
  return { label: inr(plan.monthInr), unit: "/ month", billed: plan.id === "pack5" ? "No per-candidate charges · Cancel anytime" : "" };
}
export function planCycle(plan) {
  if (plan.bill === "drive") return "drive";
  if (plan.bill === "6month") return "6month";
  if (plan.bill === "year") return "year";
  return "month";
}
export function renewsOn(cycle = "month", now = Date.now()) {
  if (cycle === "drive") return "";
  const start = istNow(now).date;
  const months = cycle === "year" ? 12 : cycle === "6month" ? 6 : 1;
  const [y, m, d] = start.split("-").map(Number);
  const monthIndex = m - 1 + months;
  const year = y + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12;
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(d, last);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
export const PUBLIC_PLANS = PLANS.filter((p) => p.listed);
export function planIdOf(org) {
  const p = org?.plan;
  if (p === "setup" || p === "free" || p === "unpaid") return "setup";
  if (p === "trial") return "trial";
  if (p === "single" || p === "event" || p === "day") return "single";
  if (p === "pack10") return "pack10";
  if (p === "pack25") return "pack25";
  if (p === "company" || p === "agency" || p === "enterprise") return "enterprise";
  if (p === "pack5" || p === "hall") return "pack5";
  return "trial";
}
export function planOf(org) { return PLANS.find((p) => p.id === planIdOf(org)) || PLANS[0]; }
/** The waiting-room scan stays off until the company is on a paid plan. */
export function scanEnabled(org) { return planIdOf(org) !== "setup"; }
export function planLimits(org) { return planOf(org).limits; }
export function atSeatCap(org) {
  const n = planLimits(org).seats;
  if (!org || n >= OPEN_SEATS) return false;
  return (org.members || []).length >= n;
}
export function joinBlockedReason(org, count) {
  const cap = planLimits(org).candidates;
  if (count < cap) return "";
  if (cap >= 999) return "This walk-in is unusually large. Contact us to continue.";
  return `This walk-in is full (${cap} candidates on this plan).`;
}
export function roomName(room) {
  if (!room) return "";
  if (typeof room === "string") return room;
  return room.name || "";
}
export function servingNow(candidates = []) {
  const calling = candidates.filter((c) => c.state === "calling");
  if (calling.length) return calling;
  return candidates.filter((c) => c.state === "interviewing");
}
export function waitingNow(candidates = []) {
  return candidates.filter((c) => c.state === "wait").sort((a, b) => ((a.roundIdx || 0) - (b.roundIdx || 0)) || (a.at - b.at));
}
export function queueAhead(candidates, cand) {
  if (!cand || cand.state !== "wait") return 0;
  const round = cand.roundIdx || 0;
  const wait = (candidates || []).filter((x) => x.state === "wait" && (x.roundIdx || 0) === round).sort((a, b) => a.at - b.at);
  const i = wait.findIndex((x) => x.id === cand.id);
  return i < 0 ? 0 : i;
}
export function currentServingToken(candidates, cand) {
  const round = cand?.roundIdx || 0;
  const same = (x) => (x.roundIdx || 0) === round;
  const serving = servingNow(candidates).filter(same);
  if (serving[0]) return serving[0].token;
  const wait = waitingNow(candidates).filter(same);
  const first = wait.find((x) => x.id !== cand?.id);
  return first?.token || servingNow(candidates)[0]?.token || "";
}
export function monthKey(dateStr) {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || "")) ? dateStr : istNow().date;
  const [y, m] = iso.split("-");
  return `${y}-${Number(m) - 1}`;
}
export function orgDrivesInPlanWindow(org, drives) {
  const mine = (drives || []).filter((d) => d.orgId === org?.id);
  if (planOf(org).multiDay) return mine.filter((d) => monthKey(d.date) === monthKey(todayStr()));
  return mine;
}
export function driveSlotsLeft(org, drives) {
  const cap = planLimits(org).drives;
  if (!org || cap >= 999) return 999;
  return Math.max(0, cap - orgDrivesInPlanWindow(org, drives).length);
}
export function driveCapCopy(org) {
  const spec = planOf(org);
  const n = spec.limits.drives;
  if (n >= 999) return "Run hiring drives without counting them. Fair use applies for unusually large events.";
  const unit = n === 1 ? "hiring drive" : "hiring drives";
  return spec.multiDay ? `This plan allows ${n} ${unit} this month.` : `This plan allows ${n} ${unit}.`;
}
export function orgCities(org) { return Array.from(new Set((org?.branches || []).map((b) => b.city).filter(Boolean))); }
export function bindRoomsToRounds(rooms = []) {
  return rooms || [];
}
// A round with `roleIds` is only for candidates who applied for one of those roles.
export const roundApplies = (round, roleId) => !roleId || !(round?.roleIds || []).length || round.roleIds.includes(roleId);
export function firstRoundIdx(rounds = [], roleId) {
  const i = (rounds || []).findIndex((r) => roundApplies(r, roleId));
  return i < 0 ? 0 : i;
}
/** The next round this candidate's role goes through, or -1 after their last one. */
export function nextRoundIdx(rounds = [], cand) {
  for (let i = (cand?.roundIdx || 0) + 1; i < (rounds || []).length; i += 1) if (roundApplies(rounds[i], cand?.roleId)) return i;
  return -1;
}
export function waitingRoundIdx(rounds = [], cand) {
  if (inARound(cand)) return Math.min(cand.roundIdx || 0, Math.max(0, rounds.length - 1));
  return firstRoundIdx(rounds, cand?.roleId);
}
export function roundIndexOfRoom(rounds = [], room) {
  if (!room?.roundId) return -1;
  return rounds.findIndex((r) => r.id === room.roundId);
}
export function roomRoundLabel(rounds, room) {
  const i = roundIndexOfRoom(rounds, room);
  if (i < 0) return room?.name || "Room";
  return `${rounds[i].name} · ${room.name}`;
}
export function roomStaffLabel(room) {
  const who = room?.interviewer || "Open desk";
  return room?.name ? `${who} · ${room.name}` : who;
}
// Desks that can take this person now. Several recruiters may run the same
// round — Call picks the person, not a different stage.
export function roomsForRound(rooms = [], rounds = [], cand) {
  const list = rooms || [];
  const roundId = rounds[waitingRoundIdx(rounds, cand)]?.id;
  if (!roundId) return list;
  return list.filter((r) => !r.roundId || r.roundId === roundId);
}
export function markPassedUpTo(rounds = [], outcomes = {}, toIdx) {
  const next = { ...outcomes };
  for (let i = 0; i < toIdx; i++) {
    const id = rounds[i]?.id;
    if (id && !next[id]) next[id] = "passed";
  }
  return next;
}
export function roundOutcomeOf(cand, round, i) {
  const o = cand?.roundOutcomes?.[round?.id];
  if (o) return o;
  if (inARound(cand) && i < (cand.roundIdx || 0)) return "passed";
  return "";
}
export const DEFAULT_ROOMS = [
  { id: "rm1", name: "Room 1", interviewer: "Priya", roundId: "r1" },
  { id: "rm2", name: "Room 2", interviewer: "Arun", roundId: "r2" },
  { id: "rm3", name: "Room 3", interviewer: "Neha", roundId: "r3" },
];
export const QUALIFICATIONS = ["10th / 12th", "Diploma", "Graduate", "Post-graduate"];

export const BRAND_COLORS = [
  { name: "TokenHire blue", hex: "#2F5BFF" },
  { name: "Teal", hex: "#0F8A6B" },
  { name: "Navy", hex: "#163A7A" },
  { name: "Plum", hex: "#341C8A" },
  { name: "Amber", hex: "#B7791F" },
  { name: "Orange", hex: "#E85D04" },
  { name: "Crimson", hex: "#C41E3A" },
  { name: "Rose", hex: "#D6336C" },
  { name: "Charcoal", hex: "#2B2F3A" },
];
export const DEFAULT_ROUNDS = [
  { id: "r1", name: "HR screening" },
  { id: "r2", name: "Ops round" },
  { id: "r3", name: "Manager round" },
];
export const EXP_BANDS = ["Fresher", "0–1 yr", "1–3 yrs", "3–5 yrs", "5+ yrs"];
export const DOC_GROUPS = [
  { title: "Resume and photos", items: ["Updated resume (print + PDF)", "Passport-size photographs (2)"] },
  { title: "Identity", items: ["PAN card"] },
  { title: "Education and work", items: ["Educational certificates", "Experience / relieving letters"] },
];
export const DOC_OPTIONS = DOC_GROUPS.flatMap((g) => g.items);

export function docNameOf(raw) {
  const name = String(raw || "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) return "";
  if (/aadhaar|aadhar|passbook|cheque|checkbook/i.test(name)) return "";
  const known = DOC_OPTIONS.find((d) => d.toLowerCase() === name.toLowerCase());
  if (known) return known;
  if (!/^[\p{L}\d][\p{L}\d\s.'’(),/+&-]{0,78}$/u.test(name)) return "";
  return name;
}

export function docsOf(list) {
  const out = [];
  for (const item of Array.isArray(list) ? list : []) {
    const name = docNameOf(item);
    if (name && !out.includes(name)) out.push(name);
    if (out.length >= 12) break;
  }
  return out;
}

export function driveWindow(drive) {
  const start = String(drive?.date || "");
  const endRaw = String(drive?.endDate || start);
  const end = /^\d{4}-\d{2}-\d{2}$/.test(endRaw) ? endRaw : start;
  return { start, end: end < start ? start : end };
}

export function driveEnded(drive, now = Date.now()) {
  return driveStatus(drive, now) === "wrapped";
}

export function driveOpenToday(drive, now = Date.now()) {
  return driveWhen(drive, now).key === "today";
}
export const CITIES = INDIA_CITIES.map((c) => c.name);

// People search the name they say, not the spelling on the record.
const CITY_ALIAS = {
  bangalore: "Bengaluru", blr: "Bengaluru", bengaluru: "Bengaluru",
  bombay: "Mumbai", mumbai: "Mumbai",
  gurugram: "Gurgaon", gurgaon: "Gurgaon",
  calcutta: "Kolkata", kolkata: "Kolkata",
  madras: "Chennai", chennai: "Chennai",
  vizag: "Visakhapatnam", visakhapatnam: "Visakhapatnam",
  "new delhi": "Delhi", delhi: "Delhi",
  hyd: "Hyderabad", hyderabad: "Hyderabad",
  pune: "Pune", noida: "Noida",
};

export function cityKeywords(city) {
  return Object.entries(CITY_ALIAS).filter(([, v]) => v === city).map(([k]) => k).join(" ");
}

export function citiesMatching(q) {
  const n = (q || "").trim().toLowerCase();
  if (n.length < 2) return [];
  const direct = INDIA_CITIES.filter((c) => c.name.toLowerCase().includes(n) || c.states.some((s) => s.toLowerCase().includes(n))).map((c) => c.name);
  const aliased = INDIA_CITIES.filter((c) => Object.entries(CITY_ALIAS).some(([k, v]) => v === c.name && k.startsWith(n))).map((c) => c.name);
  return Array.from(new Set([...aliased, ...direct]));
}

export function cityNameOf(raw) {
  const city = String(raw || "").trim().replace(/\s+/g, " ");
  if (city.length < 2 || city.length > 80) return "";
  if (!/^[\p{L}][\p{L}\s.'’,-]*$/u.test(city)) return "";
  const exact = INDIA_CITIES.find((c) => c.name.toLowerCase() === city.toLowerCase());
  if (exact) return exact.name;
  const qualified = INDIA_CITIES.find((c) => c.states.some((s) => `${c.name}, ${s}`.toLowerCase() === city.toLowerCase()));
  if (qualified) {
    const state = qualified.states.find((s) => `${qualified.name}, ${s}`.toLowerCase() === city.toLowerCase());
    return qualified.states.length === 1 ? qualified.name : `${qualified.name}, ${state}`;
  }
  const alias = CITY_ALIAS[city.toLowerCase()];
  if (alias) return alias;
  return city.replace(/\p{L}+/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function cityQueryHits(city, q) {
  const n = (q || "").trim().toLowerCase();
  if (n.length < 2 || !city) return false;
  if (city.toLowerCase().includes(n)) return true;
  return Object.entries(CITY_ALIAS).some(([k, v]) => v === city && k.startsWith(n));
}

const FREE_MAIL = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.in", "yahoo.in", "yahoo.co.uk", "ymail.com", "rocketmail.com",
  "hotmail.com", "outlook.com", "outlook.in", "live.com", "msn.com", "hotmail.co.in",
  "rediffmail.com", "rediff.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me",
  "aol.com", "aim.com", "gmx.com", "gmx.net", "mail.com", "inbox.com",
  "yandex.com", "yandex.ru", "mail.ru",
  "qq.com", "163.com", "126.com",
  "tutanota.com", "tuta.com",
]);

export function emailDomain(email) {
  const em = String(email || "").trim().toLowerCase();
  const at = em.lastIndexOf("@");
  return at > 0 ? em.slice(at + 1) : "";
}

function isFreeDomain(domain) {
  if (FREE_MAIL.has(domain)) return true;
  for (const free of FREE_MAIL) {
    if (domain.endsWith(`.${free}`)) return true;
  }
  return false;
}

export function isWorkEmail(email) {
  const domain = emailDomain(email);
  if (!domain || !domain.includes(".") || isFreeDomain(domain)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export const code = (n) => { const a = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; let s = ""; for (let i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
export const newHost = () => `HOST-${code(6)}`;
export const newGate = () => `GATE-${code(6)}`;
export const PASS_TTL = 10 * MIN;
export const newPass = () => { const a = "23456789"; let s = ""; for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
export const bare6 = (s = "") => s.toUpperCase().replace(/^(HOST|GATE|DESK|PASS)-/, "").replace(/[^A-Z0-9]/g, "").slice(0, 6);
// Posters are printed once and reused, so the QR must resolve on whatever host the
// tenant actually runs on. VITE_PUBLIC_URL pins it when posters are printed from a
// laptop on localhost but scanned against production.
export const publicOrigin = () => {
  const pinned = (import.meta.env?.VITE_PUBLIC_URL || "").replace(/\/+$/, "");
  if (pinned) return pinned;
  return typeof window === "undefined" ? "" : window.location.origin;
};
// A printed poster can only carry the drive (`g`). The lobby display re-renders
// its QR every rotation, so it can also carry the live desk code (`d`) — that second
// value is what turns check-in into a single scan.
export const gateUrl = (gate, desk) => {
  const base = `${publicOrigin()}/j?g=${bare6(gate)}`;
  return desk ? `${base}&d=${bare6(desk)}` : base;
};
export const liveDesk = (d) => d?.desk || d?.code || "";
export const livePass = (d, at = Date.now()) => {
  const p = d?.gatePass;
  if (!p || p.used || p.exp <= at) return null;
  return p;
};
export const dupOf = (d, profile) => (d.candidates || []).find((x) => {
  if (!x || x.state === "cancelled" || isTerminal(x.state)) return false;
  if (profile?.phone && x.phone === profile.phone) return true;
  if (profile?.deviceId && x.deviceId === profile.deviceId) return true;
  return false;
});
export function scrubDrive(d) {
  if (!d) return d;
  return {
    ...d,
    msgs: [],
    docs: docsOf(d.docs),
    candidates: (d.candidates || []).map((c) => {
      if (!c) return c;
      const next = { ...c };
      delete next.aadhaarHash;
      delete next.aadhaarLast4;
      delete next.whatsapp;
      delete next.phoneVerifiedAt;
      return next;
    }),
  };
}
export const boundToday = (profile, driveId) => (profile?.bound || {})[driveId] === todayStr();
export function venueProofOf(drive, codeStr, at = Date.now()) {
  const raw = (codeStr || "").trim().toUpperCase();
  if (!raw || raw.startsWith("HOST") || raw.startsWith("GATE")) return null;
  const v = bare6(raw);
  if (v && liveDesk(drive) === v) return "desk";
  const p = livePass(drive, at);
  if (p && p.code === v) return "pass";
  return null;
}
export function resumeName(resume) {
  if (!resume) return "";
  if (typeof resume === "string") return resume;
  return resume.name || "";
}
export function resumeDataUrl(resume) {
  if (!resume || typeof resume !== "object") return "";
  return resume.data || "";
}
export function isPdfResume(resume) {
  const url = resumeDataUrl(resume);
  const type = (resume && resume.type) || "";
  const name = resumeName(resume).toLowerCase();
  return type.includes("pdf") || name.endsWith(".pdf") || url.startsWith("data:application/pdf");
}
export function readResumeFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type || "application/octet-stream", data: String(reader.result) });
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
export const pc = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);
export const mask = (s = "") => { const v = s.trim(); return v.length <= 2 ? v : `${v[0]}${"·".repeat(Math.min(3, v.length - 2))}${v[v.length - 1]}`; };
export const tat = (w) => {
  const d = (w.candidates || []).filter((x) => x.calledAt && x.decidedAt && x.decidedAt > x.calledAt);
  const mins = d.length
    ? Math.round(d.reduce((s, x) => s + (x.decidedAt - x.calledAt), 0) / d.length / MIN)
    : FALLBACK_TAT;
  return Math.min(25, Math.max(2, mins));
};
export const nudgeText = (c) => `${c.name.split(" ")[0]}, you're up in about ${NOTIFY_MIN} minutes — number ${c.token}. Please be near the waiting area.`;
export const inNudgeWindow = (etaMin) => etaMin <= NOTIFY_MIN && etaMin >= 10;
export function memberEmail(m) { return typeof m === "string" ? m : m.email; }
export function memberRole(m) { return typeof m === "string" ? "recruiter" : (m.role || "recruiter"); }
export function memberName(m) {
  const raw = typeof m === "string" ? m.split("@")[0] : (m.name || (m.email || "").split("@")[0] || "");
  return raw.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || raw;
}
export function recruitersOf(org) { return (org?.members || []).filter((m) => memberRole(m) === "recruiter"); }
export function isAgencyOrg(org) { return org?.kind === "agency"; }
export function orgColor(org, drive) { return drive?.brand?.color || org?.color || k.coral; }
export function hallName(drive, org) { return (drive?.brand?.name || "").trim() || org?.short || org?.name || drive?.company || ""; }
export function clientOf(drive) { return (drive?.clientName || "").trim(); }
export function siteOf(drive) { return (drive?.branch || drive?.venue || "").trim(); }
export function hallLogo(drive, org) { return drive?.brand?.logo || org?.logo || "letter"; }
export function hallChrome(drive, org) {
  const hall = hallName(drive, org);
  const client = clientOf(drive);
  return client ? `${hall} · ${client}` : hall;
}
export function listingHost(drive, org) { return hallChrome(drive, org); }
export function listingPlace(drive) {
  if (drive.branch && drive.city) return `${drive.city} · ${drive.branch}`;
  return [drive.city, drive.venue].filter(Boolean).join(" · ");
}
export function orgWash(org) { return org?.wash || k.cream2; }
export const LOGO_PRESETS = [
  { id: "letter", label: "Letter" },
  { id: "bars", label: "Bars" },
  { id: "diamond", label: "Diamond" },
  { id: "ring", label: "Ring" },
  { id: "tile", label: "Tile" },
  { id: "split", label: "Split" },
];
export function isTerminal(state) { return ["selected", "rejected", "onhold", "absent"].includes(state); }
/** Named round once called, interviewing, advanced, or sent there — not while only waiting after check-in. */
export function inARound(c) {
  return !!(c?.roundAssigned || ["calling", "interviewing"].includes(c?.state) || (c?.roundIdx || 0) > 0);
}
export function isLastRound(rounds, c) {
  return (rounds || []).length > 0 && nextRoundIdx(rounds, c) < 0;
}
export function passLabel(rounds, c) {
  if (isLastRound(rounds, c)) return "Select";
  const next = (rounds || [])[nextRoundIdx(rounds, c)];
  return next ? `Pass to ${next.name}` : "Pass";
}
export function trackerCurrent(rounds, c) {
  const n = (rounds || []).length;
  if (isTerminal(c?.state)) return n + 1;
  if (!inARound(c) && (c?.roundIdx || 0) === 0) return 0;
  return 1 + (c?.roundIdx || 0);
}
export function roundLabel(rounds, c) {
  if (isTerminal(c?.state)) return "Decision";
  if (!inARound(c) && (c?.roundIdx || 0) === 0) return "Checked in";
  return (rounds || [])[c?.roundIdx]?.name || "—";
}
export function occupantOf(drive, roomId) {
  return (drive?.candidates || []).find((x) => ["calling", "interviewing"].includes(x.state) && x.room?.id === roomId);
}
export function withRoundStart(c, roundId, room, at = Date.now()) {
  if (!roundId) return c;
  const prev = c.roundLog?.[roundId] || {};
  return {
    ...c,
    roundLog: {
      ...(c.roundLog || {}),
      [roundId]: { ...prev, start: prev.start || at, room: room?.name || prev.room || "", interviewer: room?.interviewer || prev.interviewer || "" },
    },
  };
}
export function withRoundEnd(c, roundId, at = Date.now()) {
  if (!roundId) return c;
  const prev = c.roundLog?.[roundId] || {};
  return { ...c, roundLog: { ...(c.roundLog || {}), [roundId]: { ...prev, end: at } } };
}
export function downloadFile(name, body, mime) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: mime }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}

export function tokenPath(driveId, token, claim) {
  const p = `/t/${encodeURIComponent(driveId)}/${encodeURIComponent(token)}`;
  return claim ? `${p}?k=${encodeURIComponent(claim)}` : p;
}
export function tokenHref(driveId, token, claim) {
  return `${publicOrigin()}${tokenPath(driveId, token, claim)}`;
}

export function todayStr(offsetDays = 0) {
  return istDate(offsetDays);
}
