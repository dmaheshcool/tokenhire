import { k } from "../theme.js";

export const ROTATE = 45, NOTIFY_MIN = 15, FALLBACK_TAT = 8, MIN = 6e4;

// Listed on every tier once, above the cards, rather than repeated inside each one.
export const PRODUCT_FEATS = [
  "Digital candidate registration",
  "QR check-in",
  "Automatic token and queue",
  "Live candidate status",
  "Recruiter dashboard",
  "Candidate notifications",
  "Interviewer management",
  "Reports and analytics",
];

// Drives the pricing comparison table. Keeping it derived from `limits` means the
// table can never drift from what the app actually enforces.
export const PLAN_ROWS = [
  { label: "Drives", get: (l, p) => (l.drives >= 999 ? "Unlimited" : `${l.drives}${p.multiDay ? " / month" : ""}`) },
  { label: "Candidates per drive", get: (l) => (l.candidates >= 9999 ? "Unlimited" : l.candidates.toLocaleString("en-IN")) },
  { label: "Recruiter seats", get: (l) => l.seats },
  { label: "Venues", get: (l) => l.sites },
  { label: "Waiting screens per venue", get: (l) => l.tvsPerSite },
  { label: "Candidate notifications", get: (l) => l.notify },
  { label: "Interview rooms and rounds", get: (l) => l.rooms },
  { label: "Reports and analytics", get: (l) => l.reports },
  { label: "Audit log", get: (l) => l.audit },
  { label: "Client branding", get: (l) => l.whiteLabel },
  { label: "Priority support", get: (l) => l.sla },
  { label: "SSO", get: (l) => l.sso },
];
export const PLANS = [
  {
    id: "trial", name: "Free", price: "₹0", unit: "", annual: "", listed: true,
    validity: "1 drive · 30 candidates", blurb: "See the whole flow with a real queue before you pay.",
    ribbon: "FREE", best: false, multiDay: false, cta: "Start free",
    highlights: ["One drive, up to 30 candidates", "QR check-in, tokens and live queue", "Waiting-room screen"],
    missing: ["Candidate notifications", "Reports and analytics"],
    feats: [
      "1 drive · up to 30 candidates",
      "Digital registration and QR check-in",
      "Token and live queue",
      "No WhatsApp nudges",
      "No reports or analytics",
    ],
    limits: { drives: 1, sites: 1, cities: 99, seats: 1, tvsPerSite: 1, wa: 0, candidates: 30, clients: false, whiteLabel: false, credit: "on", audit: false, sla: false, sso: false, notify: false, reports: false, rooms: false },
  },
  {
    id: "single", name: "Single drive", price: "₹7,500", unit: " per drive", annual: "", listed: true,
    validity: "1 drive · 300 candidates", blurb: "For companies that hire in occasional bursts.",
    best: false, multiDay: false, cta: "Buy one drive",
    builds: "trial",
    highlights: ["Up to 300 candidates", "Candidate notifications", "Interview rooms and rounds", "Reports and analytics", "8 recruiter seats"],
    feats: ["1 drive · up to 300 candidates", ...PRODUCT_FEATS],
    limits: { drives: 1, sites: 8, cities: 99, seats: 8, tvsPerSite: 1, wa: 500, candidates: 300, clients: false, whiteLabel: false, credit: "on", audit: false, sla: false, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "pack5", name: "Growth", price: "₹15,000", unit: "/ month", annual: "", listed: true,
    validity: "5 drives / month · 300 each", blurb: "For teams running a hall most weeks.",
    ribbon: "MOST POPULAR", best: true, multiDay: true, cta: "Start monthly",
    builds: "single",
    highlights: ["5 drives every month", "12 recruiter seats", "2 waiting screens per venue", "20 venues"],
    feats: ["5 drives / month · 300 candidates each", ...PRODUCT_FEATS],
    limits: { drives: 5, sites: 20, cities: 99, seats: 12, tvsPerSite: 2, wa: 2500, candidates: 300, clients: false, whiteLabel: false, credit: "on", audit: false, sla: false, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "pack10", name: "Scale", price: "₹25,000", unit: "/ month", annual: "", listed: true,
    validity: "10 drives / month · 500 each", blurb: "For multi-city hiring with several halls a week.",
    best: false, multiDay: true, cta: "Start Scale",
    builds: "pack5",
    highlights: ["10 drives every month", "Up to 500 candidates per drive", "20 seats, 4 waiting screens", "Audit log"],
    feats: ["Up to 10 drives / 30 days", "Up to 500 people per drive", "Anywhere in India", "More seats and TVs"],
    limits: { drives: 10, sites: 30, cities: 99, seats: 20, tvsPerSite: 4, wa: 5000, candidates: 500, clients: false, whiteLabel: false, credit: "on", audit: true, sla: false, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "pack25", name: "Volume", price: "₹50,000", unit: "/ month", annual: "", listed: false,
    validity: "25 drives / month · 500 each", blurb: "For staffing agencies billing several clients.",
    best: false, multiDay: true, cta: "Talk to us",
    builds: "pack10",
    highlights: ["25 drives every month", "Client branding and separate client records", "40 seats, 8 waiting screens", "Priority support"],
    feats: ["Up to 25 drives / 30 days", "Up to 500 people per drive", "Anywhere in India", "Priority support"],
    limits: { drives: 25, sites: 40, cities: 99, seats: 40, tvsPerSite: 8, wa: 12000, candidates: 500, clients: true, whiteLabel: true, credit: "tiny", audit: true, sla: true, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "enterprise", name: "Enterprise", price: "Custom", unit: "", annual: "", listed: false, talk: true,
    validity: "Unlimited drives", blurb: "For named contracts, SSO and a signed SLA.",
    best: false, multiDay: true, cta: "Talk to us",
    builds: "pack25",
    highlights: ["Unlimited drives and candidates", "SSO and SAML", "Signed SLA and named support", "Security review and DPA"],
    feats: ["High-volume usage", "Staffing clients", "Anywhere in India", "SLA and SSO-ready"],
    limits: { drives: 999, sites: 80, cities: 99, seats: 80, tvsPerSite: 8, wa: 25000, candidates: 9999, clients: true, whiteLabel: true, credit: "tiny", audit: true, sla: true, sso: true, notify: true, reports: true, rooms: true },
  },
];
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
  const unit = n === 1 ? "drive" : "drives";
  return spec.multiDay ? `This plan allows ${n} ${unit} this month.` : `This plan allows ${n} ${unit}.`;
}
export function orgCities(org) { return Array.from(new Set((org?.branches || []).map((b) => b.city).filter(Boolean))); }
// Only the rooms running the round this candidate is actually on. Drives created
// before rooms carried a round binding have no roundId at all, so those fall back to
// offering every room rather than silently offering none.
export function roomsForRound(rooms = [], rounds = [], cand) {
  if (!rooms.some((r) => r.roundId)) return rooms;
  const idx = inARound(cand) ? cand.roundIdx : 0;
  const roundId = rounds[idx]?.id;
  const match = rooms.filter((r) => r.roundId === roundId);
  return match.length ? match : rooms;
}
export const DEFAULT_ROOMS = [
  { id: "rm1", name: "Room 1", interviewer: "Priya" },
  { id: "rm2", name: "Room 2", interviewer: "Arun" },
  { id: "rm3", name: "Room 3", interviewer: "Neha" },
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
export const tat = (w) => { const d = w.candidates.filter((x) => x.calledAt && x.decidedAt); return d.length ? Math.max(2, Math.round(d.reduce((s, x) => s + (x.decidedAt - x.calledAt), 0) / d.length / MIN)) : FALLBACK_TAT; };
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
