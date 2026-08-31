import { k } from "../theme.js";

export const ROTATE = 45, NOTIFY_MIN = 15, FALLBACK_TAT = 8, MIN = 6e4;

// Listed on every tier once, above the cards, rather than repeated inside each one.
export const PRODUCT_FEATS = [
  "Candidate registration with resume and contact details",
  "QR check-in at the waiting-room screen",
  "One shared queue and live wait times",
  "WhatsApp when a candidate is about 15 minutes out",
  "Recruiter dashboard and room assignment",
  "Encrypted resume files recruiters can download",
  "Day-end extract ready to send to your ATS",
];

// Drives the pricing comparison table. Keeping it derived from `limits` means the
// table can never drift from what the app actually enforces.
export const PLAN_ROWS = [
  { label: "Walk-ins", get: (l) => (l.drives >= 999 ? "Included" : String(l.drives)) },
  { label: "People a day", get: (l) => l.candidates.toLocaleString("en-IN") },
  { label: "Recruiter seats", get: (l) => l.seats },
  { label: "Halls", get: (l) => l.sites },
  { label: "Screens", get: (l) => l.tvsPerSite },
  { label: "Nudges", get: (l) => l.notify },
  { label: "Rooms", get: (l) => l.rooms },
  { label: "Reports", get: (l) => l.reports },
  { label: "Audit", get: (l) => l.audit },
  { label: "Branding", get: (l) => l.whiteLabel },
  { label: "SLA", get: (l) => l.sla },
  { label: "SSO", get: (l) => l.sso },
];
export const PLANS = [
  {
    id: "trial", name: "Free", monthInr: 0, yearInr: 0, price: "₹0", unit: "", annual: "", listed: true,
    validity: "One walk-in · 10 people", blurb: "Try the desk on a small morning.",
    ribbon: "FREE", best: false, multiDay: false, cta: "Start free",
    highlights: ["1 walk-in · 10 people", "Token and live queue"],
    feats: [
      "One walk-in · 10 people on the floor",
      "Digital registration and QR check-in",
      "Token and live queue",
      "No WhatsApp nudges",
      "No reports or analytics",
    ],
    limits: { drives: 1, sites: 1, cities: 99, seats: 1, tvsPerSite: 1, wa: 0, candidates: 10, clients: false, whiteLabel: false, credit: "on", audit: false, sla: false, sso: false, notify: false, reports: false, rooms: false },
  },
  {
    id: "single", name: "Basic", monthInr: 8000, yearInr: 80000, price: "₹8,000", unit: "/ month", annual: "₹6,667/mo", listed: true,
    validity: "1 hall · 2 seats · 100 a day", blurb: "One site. Two desks. A normal morning.",
    best: false, multiDay: true, cta: "Subscribe",
    builds: "trial",
    highlights: ["2 recruiter seats", "100 people a day · 1 hall"],
    feats: ["1 hall · walk-ins included", "2 recruiter seats · 100 people a day", ...PRODUCT_FEATS],
    limits: { drives: 999, sites: 1, cities: 99, seats: 2, tvsPerSite: 1, wa: 800, candidates: 100, clients: false, whiteLabel: false, credit: "on", audit: false, sla: false, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "pack5", name: "Pro", monthInr: 24000, yearInr: 240000, price: "₹24,000", unit: "/ month", annual: "₹20,000/mo", listed: true,
    validity: "4 halls · 6 seats · 250 a day", blurb: "A few cities. The plan most halls run.",
    ribbon: "MOST USED", best: true, multiDay: true, cta: "Subscribe",
    builds: "single",
    highlights: ["6 recruiter seats", "250 people a day · 4 halls"],
    feats: ["4 halls · walk-ins included", "6 recruiter seats · 250 people a day", ...PRODUCT_FEATS],
    limits: { drives: 999, sites: 4, cities: 99, seats: 6, tvsPerSite: 2, wa: 2500, candidates: 250, clients: false, whiteLabel: false, credit: "on", audit: false, sla: false, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "pack10", name: "Platinum", monthInr: 42000, yearInr: 420000, price: "₹42,000", unit: "/ month", annual: "₹35,000/mo", listed: true,
    validity: "10 halls · 12 seats · 500 a day", blurb: "Every site. A full panel. Audit.",
    best: false, multiDay: true, cta: "Subscribe",
    builds: "pack5",
    highlights: ["12 recruiter seats", "500 people a day · 10 halls · audit"],
    feats: ["10 halls · walk-ins included", "12 recruiter seats · 500 people a day", ...PRODUCT_FEATS],
    limits: { drives: 999, sites: 10, cities: 99, seats: 12, tvsPerSite: 3, wa: 5000, candidates: 500, clients: false, whiteLabel: false, credit: "on", audit: true, sla: false, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "pack25", name: "Agency", monthInr: 60000, yearInr: 600000, price: "₹60,000", unit: "/ month", annual: "₹50,000/mo", listed: false,
    validity: "Client halls · 500 a day", blurb: "Your brand. Their clients.",
    best: false, multiDay: true, cta: "Talk to us",
    builds: "pack10",
    highlights: ["Client records and hall branding", "20 seats · 500 people a day"],
    feats: ["Walk-ins included", "Staffing clients and white-label halls", ...PRODUCT_FEATS],
    limits: { drives: 999, sites: 16, cities: 99, seats: 20, tvsPerSite: 4, wa: 6000, candidates: 500, clients: true, whiteLabel: true, credit: "tiny", audit: true, sla: true, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "enterprise", name: "Enterprise", monthInr: null, yearInr: null, price: "Custom", unit: "", annual: "", listed: false, talk: true,
    validity: "Contract · SSO · named support", blurb: "For legal, security, and many cities.",
    best: false, multiDay: true, cta: "Talk to us",
    builds: "pack25",
    highlights: ["SSO and SAML", "Signed SLA and named support", "Up to 500 people a day"],
    feats: ["Many halls · 500 people a day", "Staffing clients", "SLA and SSO-ready"],
    limits: { drives: 999, sites: 30, cities: 99, seats: 30, tvsPerSite: 6, wa: 8000, candidates: 500, clients: true, whiteLabel: true, credit: "tiny", audit: true, sla: true, sso: true, notify: true, reports: true, rooms: true },
  },
];
export function inr(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}
export function planPrice(plan, cycle = "month") {
  if (plan.talk || plan.monthInr == null) return { label: plan.price || "Custom", unit: "", billed: "" };
  if (!plan.monthInr) return { label: "₹0", unit: "", billed: "" };
  if (cycle === "year") {
    return { label: inr(Math.round(plan.yearInr / 12)), unit: "/ mo", billed: `${inr(plan.yearInr)} billed yearly` };
  }
  return { label: inr(plan.monthInr), unit: "/ mo", billed: "" };
}
export function renewsOn(cycle = "month") {
  const d = new Date();
  if (cycle === "year") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}
export const PUBLIC_PLANS = PLANS.filter((p) => p.listed);
export function planIdOf(org) {
  const p = org?.plan;
  if (p === "trial" || p === "free") return "trial";
  if (p === "single" || p === "event" || p === "day") return "single";
  if (p === "pack10") return "pack10";
  if (p === "pack25") return "pack25";
  if (p === "company" || p === "agency" || p === "enterprise") return "enterprise";
  if (p === "pack5" || p === "hall") return "pack5";
  return "trial";
}
export function planOf(org) { return PLANS.find((p) => p.id === planIdOf(org)) || PLANS[0]; }
export function planLimits(org) { return planOf(org).limits; }
export function monthKey(dateStr) {
  const d = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
  return `${d.getFullYear()}-${d.getMonth()}`;
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
  if (n >= 999) return "Walk-ins are included on this plan.";
  const unit = n === 1 ? "walk-in" : "walk-ins";
  return spec.multiDay ? `This plan allows ${n} ${unit} this month.` : `This plan allows ${n} ${unit}.`;
}
export function orgCities(org) { return Array.from(new Set((org?.branches || []).map((b) => b.city).filter(Boolean))); }
export function bindRoomsToRounds(rooms = []) {
  return rooms || [];
}
export function waitingRoundIdx(rounds = [], cand) {
  if (inARound(cand)) return Math.min(cand.roundIdx || 0, Math.max(0, rounds.length - 1));
  return 0;
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
  { name: "TokenHire blue", hex: "#2C6BF5" },
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
export const DOC_OPTIONS = [
  "Updated resume (print + PDF)",
  "Aadhaar (original + photocopy)",
  "PAN card",
  "Passport-size photographs (2)",
  "Educational certificates",
  "Experience / relieving letters",
  "Bank passbook or cancelled cheque",
];
export const CITIES = ["Ahmedabad", "Bengaluru", "Bhubaneswar", "Chandigarh", "Chennai", "Coimbatore", "Delhi", "Gurgaon", "Hyderabad", "Indore", "Jaipur", "Kochi", "Kolkata", "Lucknow", "Mumbai", "Nagpur", "Noida", "Pune", "Vadodara", "Visakhapatnam"];

export const code = (n) => { const a = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; let s = ""; for (let i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
export const newHost = () => `HOST-${code(6)}`;
export const newGate = () => `GATE-${code(6)}`;
export const newPass = () => code(4);
export const PASS_TTL = 2 * MIN;
export const bare6 = (s = "") => s.toUpperCase().replace(/^(HOST|GATE|DESK|PASS)-/, "").replace(/[^A-Z0-9]/g, "").slice(0, 6);
// Posters are printed once and reused, so the QR must resolve on whatever host the
// tenant actually runs on. VITE_PUBLIC_URL pins it when posters are printed from a
// laptop on localhost but scanned against production.
export const publicOrigin = () => {
  const pinned = (import.meta.env?.VITE_PUBLIC_URL || "").replace(/\/+$/, "");
  if (pinned) return pinned;
  return typeof window === "undefined" ? "" : window.location.origin;
};
// A printed poster can only carry the drive (`g`). The waiting-room screen re-renders
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
export const dupOf = (d, profile) => d.candidates.find((x) => x.phone === profile.phone || (profile.aadhaarHash && x.aadhaarHash === profile.aadhaarHash));
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
// One-way hash — used only to detect "is this the same Aadhaar number as before," never to recover the number itself.
export async function hashAadhaar(num) {
  const enc = new TextEncoder().encode(`tokenhire-salt-${num}`); // fixed salt: same input always -> same hash, needed for dedup matching
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
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
export const DEMO_OTP = { sms: "482911", wa: "391720", email: "618204" };
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
  const n = (rounds || []).length;
  return n > 0 && (c?.roundIdx || 0) >= n - 1;
}
export function passLabel(rounds, c) {
  if (isLastRound(rounds, c)) return "Select";
  const next = (rounds || [])[(c?.roundIdx || 0) + 1];
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
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}
