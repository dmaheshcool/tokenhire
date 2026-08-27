import React, { useState, useEffect, useCallback, useRef } from "react";
import { LayoutGrid, ScanLine, MonitorSmartphone, ListChecks, Send, PieChart, ArrowRight, Plus, ArrowLeft, Mail, Linkedin, Check, ShieldCheck, FileText, User, Building2, Download, BadgeCheck, Phone, MapPin, Users2, Building, HeartHandshake, ChevronDown, Globe, Lock, QrCode, MessageCircle, X, Search, Play, Pause, RotateCcw, Maximize2, Minimize2, Palette, Menu, MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

/* ============================================================
   TOKENHIRE — visual system
   Cream/white hero, vivid blue pill buttons, generous rounded
   cards, geometric display type. Product mockups live inside
   pale rounded containers rather than floating loose.
   ============================================================ */
const k = {
  cream: "#FFFFFF", cream2: "#F5F8FF", ink: "#0B1020", ink2: "#4A5268", mid: "#737C93", faint: "#A3ABBE",
  line: "#E4E9F5", coral: "#2C6BF5", coralDim: "#E8EFFE", teal: "#3D4658", tealDim: "#EEF2FA",
  gold: "#9A6B00", goldDim: "#FBF3E2", red: "#B3261E", redDim: "#FBEAE8",
  band: "#D9E5FF", bandSoft: "#EDF3FF",
};
const R = { pill: 999, card: 20, inner: 14 };
const FONT = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Roboto+Mono:wght@500;600;700&display=swap');
*{box-sizing:border-box} body{margin:0}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes storyIn{from{opacity:0;transform:translateY(10px) scale(.985)}to{opacity:1;transform:none}}
@keyframes storyKen{from{transform:scale(1)}to{transform:scale(1.035)}}
@keyframes scanSweep{0%{top:18%}100%{top:72%}}
@keyframes paperSettle{from{transform:rotate(var(--r,-2deg)) translateY(10px)}to{transform:rotate(var(--r,-2deg)) translateY(0)}}
.navitem:hover{color:#0B1020}
.scrollx{overflow-x:auto;-webkit-overflow-scrolling:touch}
.tabscroll{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.tabscroll::-webkit-scrollbar{display:none}
.nav-burger{display:none}
.bottabs{display:none}
@media (max-width:860px){
  .g3,.g2,.hg{grid-template-columns:1fr!important}
  .driverow{grid-template-columns:1fr!important}
  .driverow2{flex-direction:column!important;align-items:flex-start!important}
  .storystage{flex-direction:column!important;align-items:center!important;transform:none!important;gap:18px!important}
  .storypage{padding:12px 12px 22px!important}
  .storyphone{width:230px!important}
  .storytv,.storydesk{width:min(100%,360px)!important}
  .nav-links,.nav-ctas{display:none!important}
  .nav-burger{display:flex!important}
  .toptabs{display:none!important}
  .bottabs{display:flex}
  .pagepad{padding:16px 14px!important}
  .has-bottabs{padding-bottom:96px!important}
  .chrome-wrap{padding:0!important}
  .chrome-inner{border-radius:0!important;border-left:none!important;border-right:none!important}
}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;
const dsp = "'Outfit', system-ui, sans-serif";
const bdy = "'Outfit', system-ui, sans-serif";
const typ = "'Roboto Mono', monospace";

const ROTATE = 45, NOTIFY_MIN = 15, FALLBACK_TAT = 8, MIN = 6e4;
const PRODUCT_FEATS = [
  "Digital candidate registration",
  "QR check-in",
  "Automatic token and queue",
  "Live candidate status",
  "Recruiter dashboard",
  "Candidate notifications",
  "Interviewer management",
  "Reports and analytics",
];
const PLANS = [
  {
    id: "trial", name: "Free trial", price: "₹0", unit: "", annual: "", listed: true,
    validity: "1 drive · 30 candidates", blurb: "Enough to run a small hall once — not the full product.",
    ribbon: "FREE", best: false, multiDay: false, cta: "Start free",
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
    id: "single", name: "Single drive", price: "₹7,500", unit: " once", annual: "", listed: true,
    validity: "1 drive · 300 candidates", blurb: "One walk-in. The queue, the rooms, the record.",
    best: false, multiDay: false, cta: "Buy one drive",
    feats: ["1 drive · up to 300 candidates", ...PRODUCT_FEATS],
    limits: { drives: 1, sites: 8, cities: 99, seats: 8, tvsPerSite: 1, wa: 500, candidates: 300, clients: false, whiteLabel: false, credit: "on", audit: false, sla: false, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "pack5", name: "Monthly", price: "₹15,000", unit: "/ month", annual: "", listed: true,
    validity: "5 drives / month · 300 each", blurb: "Stop 300 people standing around with no idea when they're up.",
    ribbon: "★", best: true, multiDay: true, cta: "Start monthly",
    feats: ["5 drives / month · 300 candidates each", ...PRODUCT_FEATS],
    limits: { drives: 5, sites: 20, cities: 99, seats: 12, tvsPerSite: 2, wa: 2500, candidates: 300, clients: false, whiteLabel: false, credit: "on", audit: false, sla: false, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "pack10", name: "10 drives", price: "₹25,000", unit: "/ month", annual: "", listed: false,
    validity: "30 days", blurb: "Weekly halls, still one bill.",
    best: false, multiDay: true, cta: "Take 10 / month",
    feats: ["Up to 10 drives / 30 days", "Up to 500 people per drive", "Anywhere in India", "More seats and TVs"],
    limits: { drives: 10, sites: 30, cities: 99, seats: 20, tvsPerSite: 4, wa: 5000, candidates: 500, clients: false, whiteLabel: false, credit: "on", audit: true, sla: false, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "pack25", name: "25 drives", price: "₹50,000", unit: "/ month", annual: "", listed: false,
    validity: "30 days", blurb: "A busy month across many halls.",
    best: false, multiDay: true, cta: "Take 25 / month",
    feats: ["Up to 25 drives / 30 days", "Up to 500 people per drive", "Anywhere in India", "Priority support"],
    limits: { drives: 25, sites: 40, cities: 99, seats: 40, tvsPerSite: 8, wa: 12000, candidates: 500, clients: true, whiteLabel: true, credit: "tiny", audit: true, sla: true, sso: false, notify: true, reports: true, rooms: true },
  },
  {
    id: "enterprise", name: "Enterprise", price: "Custom", unit: "", annual: "", listed: false, talk: true,
    validity: "Monthly", blurb: "High volume, staffing, or a named contract.",
    best: false, multiDay: true, cta: "Talk to us",
    feats: ["High-volume usage", "Staffing clients", "Anywhere in India", "SLA and SSO-ready"],
    limits: { drives: 999, sites: 80, cities: 99, seats: 80, tvsPerSite: 8, wa: 25000, candidates: 9999, clients: true, whiteLabel: true, credit: "tiny", audit: true, sla: true, sso: true, notify: true, reports: true, rooms: true },
  },
];
const PUBLIC_PLANS = PLANS.filter((p) => p.listed);
function planIdOf(org) {
  const p = org?.plan;
  if (p === "trial" || p === "free") return "trial";
  if (p === "single" || p === "event" || p === "day") return "single";
  if (p === "pack10") return "pack10";
  if (p === "pack25") return "pack25";
  if (p === "company" || p === "agency" || p === "enterprise") return "enterprise";
  if (p === "pack5" || p === "hall") return "pack5";
  return "trial";
}
function planOf(org) { return PLANS.find((p) => p.id === planIdOf(org)) || PLANS[0]; }
function planLimits(org) { return planOf(org).limits; }
function monthKey(dateStr) {
  const d = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
  return `${d.getFullYear()}-${d.getMonth()}`;
}
function orgDrivesInPlanWindow(org, drives) {
  const mine = (drives || []).filter((d) => d.orgId === org?.id);
  if (planOf(org).multiDay) return mine.filter((d) => monthKey(d.date) === monthKey(todayStr()));
  return mine;
}
function driveSlotsLeft(org, drives) {
  const cap = planLimits(org).drives;
  if (!org || cap >= 999) return 999;
  return Math.max(0, cap - orgDrivesInPlanWindow(org, drives).length);
}
function driveCapCopy(org) {
  const spec = planOf(org);
  const n = spec.limits.drives;
  const unit = n === 1 ? "drive" : "drives";
  return spec.multiDay ? `This plan allows ${n} ${unit} this month.` : `This plan allows ${n} ${unit}.`;
}
function orgCities(org) { return Array.from(new Set((org?.branches || []).map((b) => b.city).filter(Boolean))); }
function useNarrow() {
  const [n, setN] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 860px)");
    const fn = () => setN(q.matches);
    q.addEventListener("change", fn);
    return () => q.removeEventListener("change", fn);
  }, []);
  return n;
}

const DEFAULT_ROOMS = [
  { id: "rm1", name: "Room 1", interviewer: "Priya" },
  { id: "rm2", name: "Room 2", interviewer: "Arun" },
  { id: "rm3", name: "Room 3", interviewer: "Neha" },
];
const QUALIFICATIONS = ["10th / 12th", "Diploma", "Graduate", "Post-graduate"];

const BRAND_COLORS = [
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
const DEFAULT_ROUNDS = [
  { id: "r1", name: "HR screening" },
  { id: "r2", name: "Ops round" },
  { id: "r3", name: "Manager round" },
];
const EXP_BANDS = ["Fresher", "0–1 yr", "1–3 yrs", "3–5 yrs", "5+ yrs"];
const DOC_OPTIONS = [
  "Updated resume (print + PDF)",
  "Aadhaar (original + photocopy)",
  "PAN card",
  "Passport-size photographs (2)",
  "Educational certificates",
  "Experience / relieving letters",
  "Bank passbook or cancelled cheque",
];
const CITIES = ["Ahmedabad", "Bengaluru", "Bhubaneswar", "Chandigarh", "Chennai", "Coimbatore", "Delhi", "Gurgaon", "Hyderabad", "Indore", "Jaipur", "Kochi", "Kolkata", "Lucknow", "Mumbai", "Nagpur", "Noida", "Pune", "Vadodara", "Visakhapatnam"];

const code = (n) => { const a = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; let s = ""; for (let i = 0; i < n; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
const newHost = () => `HOST-${code(6)}`;
const newGate = () => `GATE-${code(6)}`;
const newPass = () => code(4);
const PASS_TTL = 2 * MIN;
const bare6 = (s = "") => s.toUpperCase().replace(/^(HOST|GATE|DESK|PASS)-/, "").replace(/[^A-Z0-9]/g, "").slice(0, 6);
const gateQr = (gate, s = 180) => qr(`https://tokenhire.app/j?g=${bare6(gate)}`, s);
const liveDesk = (d) => d?.desk || d?.code || "";
const livePass = (d, at = Date.now()) => {
  const p = d?.gatePass;
  if (!p || p.used || p.exp <= at) return null;
  return p;
};
const dupOf = (d, profile) => d.candidates.find((x) => x.phone === profile.phone || (profile.aadhaarHash && x.aadhaarHash === profile.aadhaarHash));
const boundToday = (profile, driveId) => (profile?.bound || {})[driveId] === todayStr();
function venueProofOf(drive, codeStr, at = Date.now()) {
  const raw = (codeStr || "").trim().toUpperCase();
  if (!raw || raw.startsWith("HOST") || raw.startsWith("GATE")) return null;
  const v = bare6(raw);
  if (v && liveDesk(drive) === v) return "desk";
  const p = livePass(drive, at);
  if (p && p.code === v) return "pass";
  return null;
}
// One-way hash — used only to detect "is this the same Aadhaar number as before," never to recover the number itself.
async function hashAadhaar(num) {
  const enc = new TextEncoder().encode(`tokenhire-salt-${num}`); // fixed salt: same input always -> same hash, needed for dedup matching
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const qr = (d, s = 180) => `https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&margin=6&color=27-24-21&bgcolor=251-247-238&data=${encodeURIComponent(d)}`;
const pc = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);
const mask = (s = "") => { const v = s.trim(); return v.length <= 2 ? v : `${v[0]}${"·".repeat(Math.min(3, v.length - 2))}${v[v.length - 1]}`; };
const tat = (w) => { const d = w.candidates.filter((x) => x.calledAt && x.decidedAt); return d.length ? Math.max(2, Math.round(d.reduce((s, x) => s + (x.decidedAt - x.calledAt), 0) / d.length / MIN)) : FALLBACK_TAT; };
const DEMO_OTP = { sms: "482911", wa: "391720", email: "618204" };
const nudgeText = (c) => `${c.name.split(" ")[0]}, you're up in about ${NOTIFY_MIN} minutes — number ${c.token}. Please be near the waiting area.`;
const inNudgeWindow = (etaMin) => etaMin <= NOTIFY_MIN && etaMin >= 10;

/* ============ root ============ */
export default function App() {
  const [view, setView] = useState("site");
  const [side, setSide] = useState("pick");
  const [drives, setDrives] = useState([seedMegaDrive(), seedDrive(), ...seedExtraDrives(), ...seedPlanDemoDrives()]);
  const [orgs, setOrgs] = useState(seedOrgs());
  const [activeOrgId, setActiveOrgId] = useState(null);
  const [staffRole, setStaffRole] = useState("recruiter"); // recruiter | frontdesk
  const [profile, setProfile] = useState(null);
  const [left, setLeft] = useState(ROTATE);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setLeft((s) => {
      if (s <= 1) { setDrives((p) => p.map((d) => ({ ...d, desk: code(6) }))); return ROTATE; }
      return s - 1;
    }), 1000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => { const i = setInterval(() => setBeat((b) => b + 1), 4000); return () => clearInterval(i); }, []);

  // launch(target) — when target is given ('candidate' | 'employer'), skip the picker entirely
  const launch = (target) => { if (target) setSide(target); setView("app"); };

  const store = { drives, setDrives, orgs, setOrgs, activeOrgId, setActiveOrgId, staffRole, setStaffRole, profile, setProfile, left, beat };

  return (
    <>
      <style>{FONT}</style>
      {view === "site" && <Site onLaunch={launch} drives={drives} />}
      {view === "app" && (
        <>
          {side === "pick" && <Pick go={setSide} back={() => setView("site")} hasProfile={!!profile} driveCount={drives.length} />}
          {side === "employer" && <Employer store={store} back={() => setView("site")} />}
          {side === "candidate" && <Candidate store={store} back={() => setView("site")} />}
        </>
      )}
    </>
  );
}

/* ============ demo seed ============ */
function seedDrive() {
  const t0 = Date.now();
  const mk = (n, name, phone, exp, state, opts = {}) => ({
    id: `W-${String(n).padStart(3, "0")}`, token: `W-${String(n).padStart(3, "0")}`,
    name, phone, email: opts.email || "", exp, linkedin: opts.linkedin || "",
    resume: opts.resume ?? `${name.split(" ")[0].toLowerCase()}_cv.pdf`,
    state, at: t0 - (40 - n) * 3 * MIN, pinged: true,
    calledAt: opts.calledAt ?? null, decidedAt: opts.decidedAt ?? null,
    expBand: opts.expBand ?? (exp === "Fresher" ? "Fresher" : parseFloat(exp) >= 5 ? "5+ yrs" : parseFloat(exp) >= 3 ? "3–5 yrs" : parseFloat(exp) >= 1 ? "1–3 yrs" : "0–1 yr"),
    roundIdx: opts.roundIdx ?? (["selected", "rejected", "onhold"].includes(state) ? 2 : ["interviewing"].includes(state) ? 1 : 0),
    roundAssigned: opts.roundAssigned ?? (["calling", "interviewing", "selected", "rejected", "onhold"].includes(state)),
    notes: opts.notes ?? {},
  });
  const done = (n, name, ph, exp, state, callMin, dur, o = {}) => mk(n, name, ph, exp, state, { ...o, calledAt: t0 - callMin * MIN, decidedAt: t0 - (callMin - dur) * MIN });
  const candidates = [
    done(1, "Rahul Menon", "9840112233", "2 years", "selected", 118, 7, { email: "rahul.menon@gmail.com" }),
    done(2, "Sneha Iyer", "9884556677", "Fresher", "rejected", 108, 6),
    done(3, "Mohammed Ali", "9701223344", "4 years", "selected", 99, 9, { email: "m.ali@outlook.com", linkedin: "https://linkedin.com/in/mali" }),
    done(4, "Priya Nair", "9963447788", "1 year", "onhold", 88, 8, { email: "priyanair@gmail.com" }),
    done(5, "Arjun Reddy", "9848990011", "Fresher", "rejected", 79, 5, { resume: null }),
    done(6, "Fatima Sheikh", "9700334455", "3 years", "selected", 68, 10, { email: "fatima.s@gmail.com" }),
    done(7, "Vikram Das", "9885667788", "6 months", "rejected", 57, 6),
    done(8, "Ananya Rao", "9959001122", "2 years", "selected", 46, 9, { email: "ananya.rao@gmail.com", linkedin: "https://linkedin.com/in/ananyarao" }),
    done(9, "Karthik Subramanian", "9701778899", "5 years", "selected", 35, 11, { email: "karthik.s@gmail.com" }),
    mk(10, "Deepika Shetty", "9846223344", "1 year", "absent", { resume: null }),
    mk(11, "Kavya Menon", "9700556611", "3 years", "interviewing", { calledAt: t0 - 6 * MIN, email: "kavya.m@gmail.com", roundIdx: 0 }),
    mk(12, "Lakshmi Prasad", "9963118822", "Fresher", "calling", { calledAt: t0 - 1 * MIN }),
    mk(13, "Sandeep Kumar", "9885774411", "2 years", "wait", { email: "sandeep.k@gmail.com" }),
    mk(14, "Zoya Khan", "9701009988", "4 years", "wait", { email: "zoya.khan@gmail.com", linkedin: "https://linkedin.com/in/zoyakhan" }),
    mk(15, "Ravi Teja", "9848337766", "Fresher", "wait", { resume: null }),
    mk(16, "Meera Joshi", "9959664433", "1 year", "wait", { email: "meera.j@gmail.com" }),
    mk(17, "Ajay Pillai", "9700882299", "3 years", "wait"),
    mk(18, "Nikhil Varma", "9884001177", "Fresher", "wait", { resume: null }),
  ];
  const waiters = candidates.filter((c) => c.state === "wait").sort((a, b) => a.at - b.at);
  waiters.forEach((c, i) => { const etaMin = i * 8; c.pinged = inNudgeWindow(etaMin) || etaMin < 10; });
  const msgs = [
    { id: 1, at: t0 - 3 * MIN, ch: "WhatsApp", to: "9848337766", name: "Ravi Teja", text: nudgeText({ name: "Ravi Teja", token: "W-015" }) },
    { id: 2, at: t0 - 32 * MIN, ch: "WhatsApp", to: "9700556611", name: "Kavya Menon", text: nudgeText({ name: "Kavya Menon", token: "W-011" }) },
  ];
  return { id: "d_demo", orgId: "org_sagility", host: "HOST-4KQ7ZM", gate: "GATE-9M2K7P", desk: code(6), visibility: "public", status: "live", city: "Hyderabad", date: todayStr(), company: "Sagility India", role: "Customer Support Executive", venue: "Gachibowli campus, Gate 1",
    jd: "Inbound customer support for a US healthcare client. Rotational shifts including weekends. Voice process — clear spoken English required. Training stipend for the first two weeks.",
    expNeeded: ["Fresher", "0–1 yr", "1–3 yrs"],
    docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "PAN card", "Passport-size photographs (2)", "Educational certificates"],
    candidates, msgs, seq: 18, rounds: DEFAULT_ROUNDS.map((r) => ({ ...r })), brand: { name: "Sagility", color: "#C41E3A", logo: "bars" }, rooms: DEFAULT_ROOMS.map((r) => ({ ...r })),
    clientId: "", clientName: "", branchId: "br_sag_gachi", branch: "Gachibowli campus" };
}

function seedOrgs() {
  return [
    { id: "org_vistaar", name: "Vistaar Services", short: "Vistaar", kind: "agency", logo: "diamond", color: "#163A7A", wash: "#E8EEF7", email: "demo@vistaar.com", password: "demo1234", plan: "company",
      clients: [
        { id: "cl_vistaar_voice", name: "Voice process – captive" },
        { id: "cl_vistaar_bfsi", name: "Retail BFSI" },
        { id: "cl_vistaar_bench", name: "Associate bench" },
      ],
      branches: [
        { id: "br_vistaar_hitec", name: "Hyderabad HITEC", city: "Hyderabad" },
        { id: "br_vistaar_pune", name: "Pune Magarpatta", city: "Pune" },
      ],
      members: [
      { email: "demo@vistaar.com", role: "recruiter", name: "Demo recruiter" },
      { email: "desk@vistaar.com", role: "frontdesk", name: "Front desk" },
      { email: "priya@vistaar.com", role: "recruiter", name: "Priya" },
      { email: "arun@vistaar.com", role: "recruiter", name: "Arun" },
      { email: "neha@vistaar.com", role: "recruiter", name: "Neha" },
      { email: "kavya@vistaar.com", role: "recruiter", name: "Kavya" },
      { email: "rohit@vistaar.com", role: "recruiter", name: "Rohit" },
    ] },
    { id: "org_sagility", name: "Sagility India", short: "Sagility", kind: "captive", logo: "bars", color: "#C41E3A", wash: "#F9E8EB", email: "hr@sagility.com", password: "demo1234", plan: "event",
      clients: [],
      branches: [{ id: "br_sag_gachi", name: "Gachibowli campus", city: "Hyderabad" }],
      members: [
      { email: "hr@sagility.com", role: "recruiter" },
      { email: "priya.hr@sagility.com", role: "recruiter" },
      { email: "desk@sagility.com", role: "frontdesk" },
    ] },
    { id: "org_quess", name: "Quess Corp", short: "Quess", kind: "agency", logo: "bars", color: "#0F8A6B", wash: "#E6F5F0", email: "hr@quesscorp.com", password: "demo1234", plan: "enterprise",
      clients: [
        { id: "cl_hdfc", name: "HDFC sales" },
        { id: "cl_amazon", name: "Amazon warehouse" },
        { id: "cl_voice", name: "Voice process – captive" },
        { id: "cl_bench", name: "Associate bench" },
      ],
      branches: [
        { id: "br_q_wfd", name: "Whitefield Hub", city: "Bengaluru" },
        { id: "br_q_hitec", name: "Hyderabad HITEC", city: "Hyderabad" },
        { id: "br_q_pune", name: "Pune Hinjawadi", city: "Pune" },
      ],
      members: [
        { email: "hr@quesscorp.com", role: "recruiter", name: "Quess recruiter" },
        { email: "desk@quesscorp.com", role: "frontdesk", name: "Whitefield desk" },
        { email: "hyd@quesscorp.com", role: "recruiter", name: "Hyderabad branch" },
      ] },
    { id: "org_teamlease", name: "TeamLease", short: "TeamLease", kind: "agency", logo: "split", color: "#E85D04", wash: "#FDEEE4", email: "hr@teamlease.com", password: "demo1234", plan: "company",
      clients: [
        { id: "cl_tl_ce", name: "Consumer electronics retail" },
        { id: "cl_tl_bank", name: "Private bank – sales" },
      ],
      branches: [{ id: "br_tl_kora", name: "Koramangala Office", city: "Bengaluru" }],
      members: [{ email: "hr@teamlease.com", role: "recruiter", name: "TeamLease recruiter" }] },
    { id: "org_genpact", name: "Genpact", short: "Genpact", kind: "captive", logo: "tile", color: "#B7791F", wash: "#F8F1E2", email: "hr@genpact.com", password: "demo1234", plan: "company",
      clients: [],
      branches: [
        { id: "br_gen_uppal", name: "Uppal campus", city: "Hyderabad" },
        { id: "br_gen_noida", name: "Noida SEZ", city: "Noida" },
      ],
      members: [{ email: "hr@genpact.com", role: "recruiter" }, { email: "desk@genpact.com", role: "frontdesk" }] },
    { id: "org_zonal", name: "Zonal Retail Pvt Ltd", short: "Zonal", kind: "captive", logo: "letter", color: "#D6336C", wash: "#F9E8EF", email: "hr@zonalretail.com", password: "demo1234", plan: "hall",
      clients: [],
      branches: [{ id: "br_zonal_andheri", name: "Andheri East", city: "Mumbai" }],
      members: [{ email: "hr@zonalretail.com", role: "recruiter" }] },
    { id: "org_wipro", name: "Wipro", short: "Wipro", kind: "captive", logo: "ring", color: "#341C8A", wash: "#EEE8F8", email: "hr@wipro.com", password: "demo1234", plan: "company",
      clients: [],
      branches: [
        { id: "br_wipro_hinja", name: "Hinjawadi Phase 2", city: "Pune" },
        { id: "br_wipro_ecity", name: "Electronic City", city: "Bengaluru" },
      ],
      members: [{ email: "hr@wipro.com", role: "recruiter" }, { email: "desk@wipro.com", role: "frontdesk" }] },
    { id: "org_plan_trial", name: "Trial Hall Co", short: "Trial", kind: "captive", logo: "letter", color: "#2C6BF5", wash: "#EEF3FE",
      email: "trial@tokenhire.demo", password: "demo1234", plan: "trial",
      clients: [], branches: [{ id: "br_trial_hyd", name: "Gachibowli", city: "Hyderabad" }],
      members: [{ email: "trial@tokenhire.demo", role: "recruiter", name: "Trial recruiter" }] },
    { id: "org_plan_single", name: "One Drive Foods", short: "One Drive", kind: "captive", logo: "tile", color: "#0F8A6B", wash: "#E6F5F0",
      email: "single@tokenhire.demo", password: "demo1234", plan: "single",
      clients: [], branches: [{ id: "br_single_hyd", name: "Madhapur hall", city: "Hyderabad" }],
      members: [
        { email: "single@tokenhire.demo", role: "recruiter", name: "Drive lead" },
        { email: "desk@single.demo", role: "frontdesk", name: "Door" },
      ] },
    { id: "org_plan_monthly", name: "Monthly Halls", short: "Monthly", kind: "captive", logo: "bars", color: "#163A7A", wash: "#E8EEF7",
      email: "monthly@tokenhire.demo", password: "demo1234", plan: "pack5",
      clients: [],
      branches: [
        { id: "br_mo_hyd", name: "Gachibowli", city: "Hyderabad" },
        { id: "br_mo_blr", name: "Whitefield", city: "Bengaluru" },
      ],
      members: [
        { email: "monthly@tokenhire.demo", role: "recruiter", name: "Monthly lead" },
        { email: "desk@monthly.demo", role: "frontdesk", name: "Desk" },
      ] },
    { id: "org_plan_pack10", name: "Weekly Halls", short: "Weekly", kind: "captive", logo: "split", color: "#B7791F", wash: "#F8F1E2",
      email: "pack10@tokenhire.demo", password: "demo1234", plan: "pack10",
      clients: [], branches: [{ id: "br_w10_pune", name: "Hinjawadi", city: "Pune" }],
      members: [{ email: "pack10@tokenhire.demo", role: "recruiter", name: "Weekly lead" }] },
    { id: "org_plan_pack25", name: "Busy Month Staffing", short: "Busy Month", kind: "agency", logo: "diamond", color: "#E85D04", wash: "#FDEEE4",
      email: "pack25@tokenhire.demo", password: "demo1234", plan: "pack25",
      clients: [{ id: "cl_bm_bank", name: "Private bank – sales" }, { id: "cl_bm_retail", name: "Retail chain" }],
      branches: [{ id: "br_bm_mum", name: "Andheri East", city: "Mumbai" }],
      members: [{ email: "pack25@tokenhire.demo", role: "recruiter", name: "Agency lead" }] },
    { id: "org_plan_ent", name: "Enterprise Staffing", short: "Enterprise", kind: "agency", logo: "ring", color: "#341C8A", wash: "#EEE8F8",
      email: "enterprise@tokenhire.demo", password: "demo1234", plan: "enterprise",
      clients: [{ id: "cl_ent_hdfc", name: "HDFC sales" }, { id: "cl_ent_wh", name: "Warehouse" }],
      branches: [
        { id: "br_ent_blr", name: "Whitefield Hub", city: "Bengaluru" },
        { id: "br_ent_hyd", name: "HITEC", city: "Hyderabad" },
      ],
      members: [
        { email: "enterprise@tokenhire.demo", role: "recruiter", name: "Enterprise recruiter" },
        { email: "desk@enterprise.demo", role: "frontdesk", name: "Front desk" },
      ] },
  ];
}

function memberEmail(m) { return typeof m === "string" ? m : m.email; }
function memberRole(m) { return typeof m === "string" ? "recruiter" : (m.role || "recruiter"); }
function memberName(m) {
  const raw = typeof m === "string" ? m.split("@")[0] : (m.name || (m.email || "").split("@")[0] || "");
  return raw.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || raw;
}
function recruitersOf(org) { return (org?.members || []).filter((m) => memberRole(m) === "recruiter"); }
function isAgencyOrg(org) { return org?.kind === "agency"; }
function orgColor(org, drive) { return drive?.brand?.color || org?.color || k.coral; }
function hallName(drive, org) { return (drive?.brand?.name || "").trim() || org?.short || org?.name || drive?.company || ""; }
function clientOf(drive) { return (drive?.clientName || "").trim(); }
function siteOf(drive) { return (drive?.branch || drive?.venue || "").trim(); }
function hallLogo(drive, org) { return drive?.brand?.logo || org?.logo || "letter"; }
function hallChrome(drive, org) {
  const hall = hallName(drive, org);
  const client = clientOf(drive);
  return client ? `${hall} · ${client}` : hall;
}
function listingHost(drive, org) { return hallChrome(drive, org); }
function listingPlace(drive) {
  if (drive.branch && drive.city) return `${drive.city} · ${drive.branch}`;
  return [drive.city, drive.venue].filter(Boolean).join(" · ");
}
function orgWash(org) { return org?.wash || k.cream2; }
const LOGO_PRESETS = [
  { id: "letter", label: "Letter" },
  { id: "bars", label: "Bars" },
  { id: "diamond", label: "Diamond" },
  { id: "ring", label: "Ring" },
  { id: "tile", label: "Tile" },
  { id: "split", label: "Split" },
];
function isTerminal(state) { return ["selected", "rejected", "onhold", "absent"].includes(state); }
/** Named round once called, interviewing, advanced, or sent there — not while only waiting after check-in. */
function inARound(c) {
  return !!(c?.roundAssigned || ["calling", "interviewing"].includes(c?.state) || (c?.roundIdx || 0) > 0);
}
function isLastRound(rounds, c) {
  const n = (rounds || []).length;
  return n > 0 && (c?.roundIdx || 0) >= n - 1;
}
function passLabel(rounds, c) {
  if (isLastRound(rounds, c)) return "Select";
  const next = (rounds || [])[(c?.roundIdx || 0) + 1];
  return next ? `Pass to ${next.name}` : "Pass";
}
function trackerCurrent(rounds, c) {
  const n = (rounds || []).length;
  if (isTerminal(c?.state)) return n + 1;
  if (!inARound(c) && (c?.roundIdx || 0) === 0) return 0;
  return 1 + (c?.roundIdx || 0);
}
function roundLabel(rounds, c) {
  if (isTerminal(c?.state)) return "Decision";
  if (!inARound(c) && (c?.roundIdx || 0) === 0) return "Checked in";
  return (rounds || [])[c?.roundIdx]?.name || "—";
}
function occupantOf(drive, roomId) {
  return (drive?.candidates || []).find((x) => ["calling", "interviewing"].includes(x.state) && x.room?.id === roomId);
}
function downloadFile(name, body, mime) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type: mime }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
}

function todayStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

/* Showcase drive: 50 people at one Vistaar walk-in, mid-morning snapshot */
function seedMegaDrive() {
  const t0 = Date.now();
  const names = [
    "Aditya Sharma", "Bhavana Reddy", "Chirag Patel", "Divya Nair", "Esha Krishnan",
    "Farhan Qureshi", "Gayatri Iyer", "Harsh Vardhan", "Ishita Bose", "Jatin Mehta",
    "Kavya Menon", "Lalit Chauhan", "Mansi Gupta", "Naveen Rao", "Ojasvi Singh",
    "Pooja Deshmukh", "Qasim Ali", "Riya Sen", "Siddharth Pillai", "Tanvi Joshi",
    "Uday Kulkarni", "Varsha Hegde", "Wasim Khan", "Yashica Jain", "Zara Sheikh",
    "Aniket Pawar", "Bindu Thomas", "Chetan Gowda", "Deepa Rani", "Eshan Verma",
    "Falguni Shah", "Gopal Krishna", "Hema Sundaram", "Iqbal Hussain", "Jhanvi Kapoor",
    "Kiran Bhat", "Leela Prasad", "Mohan Das", "Neelima Rao", "Omkar Patil",
    "Pranav Iyer", "Rashmi Kulkarni", "Sana Mirza", "Tarun Reddy", "Uma Sharma",
    "Vivek Nair", "Wafa Begum", "Yamini Rao", "Zaheer Ahmed", "Aarav Kulkarni",
  ];
  const rooms = [
    { id: "rm1", name: "Room 1", interviewer: "Priya", recruiterEmail: "priya@vistaar.com" },
    { id: "rm2", name: "Room 2", interviewer: "Arun", recruiterEmail: "arun@vistaar.com" },
    { id: "rm3", name: "Room 3", interviewer: "Neha", recruiterEmail: "neha@vistaar.com" },
    { id: "rm4", name: "Room 4", interviewer: "Kavya", recruiterEmail: "kavya@vistaar.com" },
    { id: "rm5", name: "Room 5", interviewer: "Rohit", recruiterEmail: "rohit@vistaar.com" },
  ];
  const rounds = DEFAULT_ROUNDS.map((r) => ({ ...r }));
  const bands = EXP_BANDS;
  const quals = QUALIFICATIONS;
  const first = (s) => s.split(" ")[0];
  const plan = [
    ...Array.from({ length: 8 }, () => ({ state: "selected", roundIdx: 2 })),
    ...Array.from({ length: 7 }, () => ({ state: "rejected", roundIdx: 1 })),
    ...Array.from({ length: 4 }, () => ({ state: "onhold", roundIdx: 2 })),
    ...Array.from({ length: 3 }, () => ({ state: "absent", roundIdx: 0 })),
    ...Array.from({ length: 5 }, (_, i) => ({ state: "interviewing", roundIdx: i % 3, room: rooms[i] })),
    ...Array.from({ length: 2 }, () => ({ state: "calling", roundIdx: 0 })),
    ...Array.from({ length: 12 }, () => ({ state: "wait", roundIdx: 0 })),
    ...Array.from({ length: 5 }, () => ({ state: "wait", roundIdx: 1 })),
    ...Array.from({ length: 4 }, () => ({ state: "wait", roundIdx: 2 })),
  ];
  const candidates = names.map((name, i) => {
    const n = i + 1;
    const p = plan[i];
    const minsAgo = (50 - n) * 4;
    const at = t0 - minsAgo * MIN;
    const expBand = bands[i % bands.length];
    const exp = expBand === "Fresher" ? "Fresher" : expBand;
    const slug = first(name).toLowerCase();
    const phone = `98${String(40000000 + n * 137).slice(0, 8)}`;
    const roundOutcomes = {};
    if (p.roundIdx > 0 || ["selected", "rejected", "onhold"].includes(p.state)) {
      for (let r = 0; r < p.roundIdx; r++) roundOutcomes[rounds[r].id] = "selected";
      if (p.state === "rejected") roundOutcomes[rounds[p.roundIdx].id] = "rejected";
      if (p.state === "onhold") roundOutcomes[rounds[p.roundIdx].id] = "onhold";
      if (p.state === "selected") roundOutcomes[rounds[rounds.length - 1].id] = "selected";
    }
    const inFlow = ["calling", "interviewing"].includes(p.state);
    const decided = ["selected", "rejected", "onhold"].includes(p.state);
    return {
      id: `W-${String(n).padStart(3, "0")}`, token: `W-${String(n).padStart(3, "0")}`,
      name, phone, email: i % 4 === 0 ? "" : `${slug}.${n}@gmail.com`,
      exp, expBand, linkedin: i % 5 === 0 ? `https://linkedin.com/in/${slug}${n}` : "",
      resume: i % 7 === 0 ? null : `${slug}_cv.pdf`,
      qual: quals[i % quals.length],
      state: p.state, roundIdx: p.roundIdx, roundOutcomes, notes: {},
      at, pinged: true,
      calledAt: inFlow || decided || p.state === "absent" ? t0 - Math.max(2, (p.state === "calling" ? 1 : p.state === "interviewing" ? 5 + i % 4 : 20 + n)) * MIN : null,
      decidedAt: decided ? t0 - (8 + n) * MIN : null,
      room: p.room || null,
      skipped: p.state === "wait" && i % 11 === 0 ? 1 : 0,
      roundAssigned: p.roundIdx > 0 || ["calling", "interviewing"].includes(p.state),
    };
  });
  const waitSorted = candidates.filter((c) => c.state === "wait").sort((a, b) => a.at - b.at);
  waitSorted.forEach((c, i) => {
    const etaMin = i * 12;
    c.pinged = inNudgeWindow(etaMin) || etaMin < 10;
  });
  candidates.filter((c) => !["wait"].includes(c.state)).forEach((c) => { c.pinged = true; });
  const msgs = [
    ...waitSorted.filter((_, i) => inNudgeWindow(i * 12)).map((c) => ({
      id: `m_nudge_${c.id}`, at: t0 - 2 * MIN, ch: "WhatsApp", to: c.phone, name: c.name, text: nudgeText(c),
    })),
    ...candidates.filter((c) => c.state === "calling").map((c, i) => ({
      id: `m_nudge_call_${c.id}`, at: t0 - (18 + i) * MIN, ch: "WhatsApp", to: c.phone, name: c.name, text: nudgeText(c),
    })),
    ...candidates.filter((c) => c.state === "interviewing").slice(0, 2).map((c, i) => ({
      id: `m_nudge_int_${c.id}`, at: t0 - (28 + i * 4) * MIN, ch: "WhatsApp", to: c.phone, name: c.name, text: nudgeText(c),
    })),
  ];
  return {
    id: "d_vistaar_50", orgId: "org_vistaar", host: "HOST-DEMO50", gate: "GATE-VISTA1", desk: code(6),
    visibility: "public", status: "live", city: "Hyderabad", date: todayStr(),
    company: "Vistaar Services", role: "Voice Process Associate", venue: "HITEC City, Tower B, Ground floor",
    jd: "US and UK voice process. Rotational shifts. Graduate preferred. Three rounds today — HR screening, ops, manager. Offers are not made on the floor; selected names go to HR for ATS.",
    expNeeded: ["Fresher", "0–1 yr", "1–3 yrs"],
    docs: DOC_OPTIONS.slice(0, 5),
    candidates, msgs, seq: 50, rounds, brand: { name: "Vistaar", color: "#163A7A", logo: "diamond" }, rooms,
    clientId: "cl_vistaar_voice", clientName: "Voice process – captive", branchId: "br_vistaar_hitec", branch: "Hyderabad HITEC",
  };
}

/* extra sample drives so "Browse drives" has real, multi-city data to filter */
function demoWaiters(n = 3) {
  const t0 = Date.now();
  const people = [
    ["Ravi Teja", "9848111001", "Fresher"],
    ["Meera Joshi", "9848111002", "1 year"],
    ["Sandeep Kumar", "9848111003", "Fresher"],
    ["Lakshmi Prasad", "9848111004", "2 years"],
  ];
  return people.slice(0, n).map((p, i) => ({
    id: `W-${String(i + 1).padStart(3, "0")}`, token: `W-${String(i + 1).padStart(3, "0")}`,
    name: p[0], phone: p[1], email: "", exp: p[2], expBand: p[2] === "Fresher" ? "Fresher" : "0–1 yr",
    linkedin: "", resume: null, state: "wait", at: t0 - (18 - i * 4) * MIN, pinged: true,
    calledAt: null, decidedAt: null, roundIdx: 0, roundAssigned: false, notes: {}, room: null, skipped: 0,
  }));
}

function blankSeed(extra) {
  return {
    host: newHost(), gate: newGate(), desk: code(6), visibility: "public", status: "upcoming",
    candidates: [], msgs: [], seq: 0, rounds: DEFAULT_ROUNDS.map((r) => ({ ...r })),
    rooms: DEFAULT_ROOMS.map((r) => ({ ...r })),
    ...extra,
  };
}
function seedExtraDrives() {
  return [
    blankSeed({ id: "d_blr1", orgId: "org_quess", status: "live", city: "Bengaluru", date: todayStr(), company: "Quess Corp", role: "Warehouse Associate", venue: "Whitefield Hub, Gate 2",
      jd: "Last-mile and inbound for Amazon warehouse. Own two-wheeler helpful. Daily payouts. Reporting 7am.",
      expNeeded: ["Fresher", "0–1 yr"],
      docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "PAN card", "Bank passbook or cancelled cheque"],
      candidates: demoWaiters(3), seq: 3, msgs: [],
      brand: { name: "Quess", color: "#0F8A6B", logo: "bars" }, clientId: "cl_amazon", clientName: "Amazon warehouse", branchId: "br_q_wfd", branch: "Whitefield Hub" }),
    blankSeed({ id: "d_q_hdfc", orgId: "org_quess", status: "live", city: "Hyderabad", date: todayStr(), company: "Quess Corp", role: "Relationship Officer", venue: "HITEC City, Tower 3, Level 2",
      jd: "Walk-in for HDFC sales. Field + branch. Telugu and English. Quess hires you; you work on the HDFC book.",
      expNeeded: ["0–1 yr", "1–3 yrs", "3–5 yrs"],
      docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "PAN card", "Passport-size photographs (2)"],
      brand: { name: "Quess", color: "#0F8A6B", logo: "bars" }, clientId: "cl_hdfc", clientName: "HDFC sales", branchId: "br_q_hitec", branch: "Hyderabad HITEC" }),
    blankSeed({ id: "d_q_voice", orgId: "org_quess", city: "Pune", date: todayStr(1), company: "Quess Corp", role: "Voice Process Associate", venue: "Hinjawadi Phase 1, Block C",
      jd: "Captive voice process staffed by Quess. Rotational shifts. Clear spoken English.",
      expNeeded: ["Fresher", "0–1 yr", "1–3 yrs"],
      docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "Educational certificates"],
      brand: { name: "Quess", color: "#0F8A6B", logo: "bars" }, clientId: "cl_voice", clientName: "Voice process – captive", branchId: "br_q_pune", branch: "Pune Hinjawadi" }),
    blankSeed({ id: "d_q_bench", orgId: "org_quess", city: "Bengaluru", date: todayStr(3), company: "Quess Corp", role: "Associate (bench)", venue: "Whitefield Hub, Training floor",
      jd: "Quess associate bench — hired onto Quess payroll, deployed to client sites as they open. Not a client walk-in.",
      expNeeded: ["Fresher", "0–1 yr"],
      docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "PAN card"],
      brand: { name: "Quess", color: "#0F8A6B", logo: "bars" }, clientId: "cl_bench", clientName: "Associate bench", branchId: "br_q_wfd", branch: "Whitefield Hub" }),
    blankSeed({ id: "d_vistaar_bfsi", orgId: "org_vistaar", city: "Hyderabad", date: todayStr(2), company: "Vistaar Services", role: "Collections Officer", venue: "HITEC City, Tower B",
      jd: "Field collections for a retail BFSI client. Vistaar payroll. Telugu and English.",
      expNeeded: ["0–1 yr", "1–3 yrs"],
      docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "PAN card"],
      brand: { name: "Vistaar", color: "#163A7A", logo: "diamond" }, clientId: "cl_vistaar_bfsi", clientName: "Retail BFSI", branchId: "br_vistaar_hitec", branch: "Hyderabad HITEC" }),
    blankSeed({ id: "d_blr2", orgId: "org_teamlease", city: "Bengaluru", date: todayStr(4), company: "TeamLease", role: "Sales Associate", venue: "Koramangala Office",
      jd: "In-store sales for a consumer-electronics brand. Target-based incentives. Kannada or Tamil plus English.",
      expNeeded: ["0–1 yr", "1–3 yrs", "3–5 yrs"],
      docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "PAN card", "Passport-size photographs (2)", "Experience / relieving letters"],
      brand: { name: "TeamLease", color: "#E85D04", logo: "split" }, clientId: "cl_tl_ce", clientName: "Consumer electronics retail", branchId: "br_tl_kora", branch: "Koramangala Office" }),
    blankSeed({ id: "d_hyd2", orgId: "org_genpact", status: "live", city: "Hyderabad", date: todayStr(), company: "Genpact", role: "Voice Process Associate", venue: "Uppal campus",
      jd: "UK voice process. Night shift. Graduate preferred. Walk-in includes an aptitude test and a 10-minute mock call.",
      expNeeded: ["Fresher", "0–1 yr", "1–3 yrs"],
      docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "Educational certificates", "Passport-size photographs (2)"],
      brand: { name: "Genpact", color: "#B7791F", logo: "tile" }, clientId: "", clientName: "", branchId: "br_gen_uppal", branch: "Uppal campus" }),
    blankSeed({ id: "d_mum1", orgId: "org_zonal", city: "Mumbai", date: todayStr(6), company: "Zonal Retail Pvt Ltd", role: "Store Associate", venue: "Andheri East",
      jd: "Floor staff for a new grocery format. Weekend roster. Hindi and Marathi useful. Immediate joining.",
      expNeeded: ["Fresher", "0–1 yr", "1–3 yrs"],
      docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "PAN card", "Passport-size photographs (2)"],
      brand: { name: "Zonal", color: "#D6336C", logo: "letter" }, clientId: "", clientName: "", branchId: "br_zonal_andheri", branch: "Andheri East" }),
    blankSeed({ id: "d_wipro_live", orgId: "org_wipro", status: "live", city: "Pune", date: todayStr(), company: "Wipro", role: "Technical Support Associate", venue: "Hinjawadi Phase 2, Block 8",
      jd: "IT helpdesk for internal Wipro accounts. Day shift. Own hiring — not a staffing client walk-in.",
      expNeeded: ["Fresher", "0–1 yr", "1–3 yrs"],
      docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "PAN card", "Educational certificates"],
      brand: { name: "Wipro", color: "#341C8A", logo: "ring" }, clientId: "", clientName: "", branchId: "br_wipro_hinja", branch: "Hinjawadi Phase 2" }),
    blankSeed({ id: "d_pun1", orgId: "org_wipro", visibility: "private", status: "closed", city: "Pune", date: todayStr(-3), company: "Wipro", role: "Document Validation", venue: "Hinjawadi Phase 2",
      jd: "Back-office document QC. Day shift.",
      expNeeded: ["1–3 yrs", "3–5 yrs"],
      docs: ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "PAN card"],
      brand: { name: "Wipro", color: "#341C8A", logo: "ring" }, clientId: "", clientName: "", branchId: "br_wipro_hinja", branch: "Hinjawadi Phase 2" }),
  ];
}

function seedPlanDemoDrives() {
  const docs = ["Updated resume (print + PDF)", "Aadhaar (original + photocopy)", "PAN card"];
  const trialRooms = [{ ...DEFAULT_ROOMS[0] }];
  return [
    blankSeed({ id: "d_plan_trial", orgId: "org_plan_trial", status: "live", city: "Hyderabad", date: todayStr(), company: "Trial Hall Co", role: "Customer Support", venue: "Gachibowli",
      jd: "Trial plan — 1 drive, 30 people, no WhatsApp, no reports, one room.",
      expNeeded: ["Fresher"], docs, brand: { name: "Trial", color: "#2C6BF5", logo: "letter" },
      rooms: trialRooms, clientId: "", clientName: "", branchId: "br_trial_hyd", branch: "Gachibowli" }),
    blankSeed({ id: "d_plan_single", orgId: "org_plan_single", status: "live", city: "Hyderabad", date: todayStr(), company: "One Drive Foods", role: "Store Associate", venue: "Madhapur hall",
      jd: "Single-drive plan — full product, one hall, 300 people. You cannot create a second drive.",
      expNeeded: ["Fresher", "0–1 yr"], docs, brand: { name: "One Drive", color: "#0F8A6B", logo: "tile" },
      clientId: "", clientName: "", branchId: "br_single_hyd", branch: "Madhapur hall" }),
    blankSeed({ id: "d_plan_mo1", orgId: "org_plan_monthly", status: "live", city: "Hyderabad", date: todayStr(), company: "Monthly Halls", role: "Voice Associate", venue: "Gachibowli",
      jd: "Monthly plan — 5 drives this month. This is 1 of 5.",
      expNeeded: ["Fresher"], docs, brand: { name: "Monthly", color: "#163A7A", logo: "bars" },
      clientId: "", clientName: "", branchId: "br_mo_hyd", branch: "Gachibowli" }),
    blankSeed({ id: "d_plan_mo2", orgId: "org_plan_monthly", status: "live", city: "Bengaluru", date: todayStr(), company: "Monthly Halls", role: "Warehouse Associate", venue: "Whitefield",
      jd: "Monthly plan — this is 2 of 5 this month.",
      expNeeded: ["Fresher"], docs, brand: { name: "Monthly", color: "#163A7A", logo: "bars" },
      clientId: "", clientName: "", branchId: "br_mo_blr", branch: "Whitefield" }),
    blankSeed({ id: "d_plan_p10", orgId: "org_plan_pack10", status: "live", city: "Pune", date: todayStr(), company: "Weekly Halls", role: "Tech Support", venue: "Hinjawadi",
      jd: "10 drives / month pack.",
      expNeeded: ["Fresher", "0–1 yr"], docs, brand: { name: "Weekly", color: "#B7791F", logo: "split" },
      clientId: "", clientName: "", branchId: "br_w10_pune", branch: "Hinjawadi" }),
    blankSeed({ id: "d_plan_p25", orgId: "org_plan_pack25", status: "live", city: "Mumbai", date: todayStr(), company: "Busy Month Staffing", role: "Relationship Officer", venue: "Andheri East",
      jd: "25-drive pack with staffing clients.",
      expNeeded: ["0–1 yr", "1–3 yrs"], docs, brand: { name: "Busy Month", color: "#E85D04", logo: "diamond" },
      clientId: "cl_bm_bank", clientName: "Private bank – sales", branchId: "br_bm_mum", branch: "Andheri East" }),
    blankSeed({ id: "d_plan_ent", orgId: "org_plan_ent", status: "live", city: "Bengaluru", date: todayStr(), company: "Enterprise Staffing", role: "Warehouse Associate", venue: "Whitefield Hub",
      jd: "Enterprise — unconstrained drives, clients, tiny TokenHire mark.",
      expNeeded: ["Fresher"], docs, brand: { name: "Enterprise", color: "#341C8A", logo: "ring" },
      clientId: "cl_ent_wh", clientName: "Warehouse", branchId: "br_ent_blr", branch: "Whitefield Hub" }),
  ];
}

/* Mark: walk-in token face with a short queue — three people, next holds a ticket. */
function TokenMark({ size = 28, light }) {
  const face = light ? "#fff" : k.coral;
  const fig = light ? k.coral : "#fff";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0, display: "block" }} aria-hidden="true">
      <rect x="1.75" y="1.75" width="44.5" height="44.5" rx="13" fill={face} />
      <g fill={fig}>
        <circle cx="12.35" cy="21.15" r="3.85" />
        <path d="M8.55 39.4V28.55c0-2.05 1.7-3.7 3.8-3.7s3.8 1.65 3.8 3.7V39.4Z" />
        <circle cx="22.15" cy="19.55" r="4.2" />
        <path d="M17.85 39.4V27.05c0-2.3 1.92-4.15 4.3-4.15s4.3 1.85 4.3 4.15V39.4Z" />
        <circle cx="32.35" cy="18.15" r="4.55" />
        <path d="M27.6 39.4V25.65c0-2.5 2.12-4.5 4.75-4.5s4.75 2 4.75 4.5V39.4Z" />
      </g>
      <rect x="36.2" y="23.35" width="7.4" height="10.15" rx="1.65" fill={fig} stroke={face} strokeWidth="1.4" />
      <circle cx="39.9" cy="26.55" r="1.28" fill={face} />
      <path d="M37.35 30.85h5.1" stroke={face} strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  );
}

function Wordmark({ size = 18, light, bare = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.38, fontFamily: dsp, fontSize: size * 1.22, letterSpacing: -0.55, color: light ? "#fff" : k.ink }}>
      {!bare && <TokenMark size={Math.round(size * 1.78)} light={light} />}
      <span style={{ lineHeight: 1 }}>
        <b style={{ fontWeight: 800 }}>Token</b>
        <span style={{ fontWeight: 700, color: light ? "rgba(255,255,255,.9)" : k.coral }}>Hire</span>
      </span>
    </span>
  );
}

function OrgLogo({ name, color, logo = "letter", size = 34 }) {
  const n = ((name || "?").trim() || "?")[0].toUpperCase();
  const c = color || k.coral;
  const r = Math.round(size * (logo === "ring" || logo === "diamond" ? 0.5 : logo === "tile" ? 0.18 : 0.28));
  const fs = Math.round(size * 0.42);
  const base = { width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: dsp, fontWeight: 800, color: "#fff", flexShrink: 0, fontSize: fs, letterSpacing: -0.4, position: "relative", overflow: "hidden" };
  if (logo === "ring") {
    return (
      <div style={{ ...base, borderRadius: "50%", background: "transparent", border: `${Math.max(2, Math.round(size * 0.08))}px solid ${c}`, color: c }}>{n}</div>
    );
  }
  if (logo === "diamond") {
    return (
      <div style={{ width: size, height: size, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...base, width: size * 0.78, height: size * 0.78, borderRadius: 6, background: c, transform: "rotate(45deg)" }}>
          <span style={{ transform: "rotate(-45deg)", display: "block" }}>{n}</span>
        </div>
      </div>
    );
  }
  if (logo === "bars") {
    return (
      <div style={{ ...base, borderRadius: r, background: c }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "22%", height: "10%", background: "rgba(255,255,255,.28)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: "68%", height: "10%", background: "rgba(255,255,255,.18)" }} />
        <span style={{ position: "relative" }}>{n}</span>
      </div>
    );
  }
  if (logo === "tile") {
    return <div style={{ ...base, borderRadius: r, background: c, boxShadow: `inset 0 0 0 ${Math.max(2, Math.round(size * 0.07))}px rgba(255,255,255,.35)` }}>{n}</div>;
  }
  if (logo === "split") {
    return (
      <div style={{ ...base, borderRadius: r, background: c }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${c} 50%, rgba(0,0,0,.22) 50%)` }} />
        <span style={{ position: "relative" }}>{n}</span>
      </div>
    );
  }
  return <div style={{ ...base, borderRadius: r, background: c }}>{n}</div>;
}

function OrgMark({ name, color, size = 34, logo }) {
  return <OrgLogo name={name} color={color} size={size} logo={logo} />;
}

function HallBrand({ name, color, light, powered = true, credit, sub, logo, size = 26 }) {
  const title = sub ? `${name} · ${sub}` : name;
  const mark = credit || (powered === false ? "off" : powered === "tiny" ? "tiny" : "on");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
      <OrgLogo name={name} color={color} size={size} logo={logo} />
      <span style={{ fontFamily: dsp, fontWeight: 700, fontSize: 16, color: light ? "#fff" : k.ink }}>{title}</span>
      {mark === "on" && <span style={{ fontSize: 11, fontWeight: 600, color: light ? "rgba(255,255,255,.7)" : k.coral, marginLeft: 2 }}>Powered by TokenHire</span>}
      {mark === "tiny" && <span style={{ fontSize: 9, color: light ? "rgba(255,255,255,.32)" : k.faint, marginLeft: 2 }}>TokenHire</span>}
    </div>
  );
}

/* Physical walk-in token: same rounded-square face as TokenMark, number instead of the queue. */
function tokenDigits(token = "") {
  const s = String(token);
  const m = s.match(/(\d+)\s*$/);
  return m ? m[1] : s.replace(/^W-/i, "") || s;
}

function TokenTile({ token, size = 36, color = k.coral, light = false, pulse = false }) {
  const face = light ? "#fff" : (color || k.coral);
  const ink = light ? (color || k.coral) : "#fff";
  const n = tokenDigits(token);
  const fs = n.length > 3 ? size * 0.30 : size * 0.36;
  return (
    <span
      role="img"
      aria-label={String(token)}
      title={String(token)}
      style={{
        width: size, height: size, minWidth: size, minHeight: size, maxWidth: size, maxHeight: size,
        borderRadius: Math.round(size * 0.25), boxSizing: "border-box",
        background: face, color: ink, display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: dsp, fontWeight: 800, fontSize: Math.max(10, Math.round(fs)),
        letterSpacing: n.length > 2 ? -0.6 : 0, flexShrink: 0, lineHeight: 1,
        animation: pulse ? "blink 1.8s infinite" : "none",
      }}
    >{n}</span>
  );
}

function TokenChip({ token, name, size = 36, color, light, pulse, muted, nameSize }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.max(8, Math.round(size * 0.28)), minWidth: 0 }}>
      <TokenTile token={token} size={size} color={color} light={light} pulse={pulse} />
      {name != null && name !== "" && (
        <span style={{
          fontFamily: bdy, fontWeight: 600, fontSize: nameSize || Math.max(13, Math.round(size * 0.38)),
          color: muted ? k.mid : k.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.25,
        }}>{name}</span>
      )}
    </span>
  );
}

/* ================= MARKETING SITE ================= */
const PAGES = [["home", "Home"], ["services", "Products"], ["drives", "Upcoming walk-ins"], ["about", "About us"], ["contact", "Contact us"]];

const NAV = [
  { id: "home", label: "Home" },
  {
    label: "Solutions", menu: [
      ["sol:bpo", "BPO & customer support", "500-a-day drives without the shouting"],
      ["sol:retail", "Retail & delivery", "Store-by-store hiring, one dashboard"],
      ["sol:campus", "Campus hiring", "A whole batch through in one morning"],
      ["sol:agency", "Staffing agencies", "Your hall. Their clients."],
    ],
  },
  { id: "pricing", label: "Pricing" },
  { id: "drives", label: "Upcoming walk-ins" },
  { id: "about", label: "About us" },
];

const chromeStrip = { background: k.cream, borderBottom: `1px solid ${k.line}` };
const chromeBox = { background: "#fff", border: `1px solid ${k.line}`, borderRadius: 16, boxShadow: "0 10px 28px -18px rgba(11,16,32,.28)" };

function Site({ onLaunch, drives }) {
  const [page, setPage] = useState("home");
  const go = (p) => { setPage(p); window.scrollTo?.(0, 0); };
  if (page === "demo") {
    return (
      <div style={{ background: k.cream, color: k.ink, fontFamily: bdy, minHeight: "100vh" }}>
        <WalkInDemo go={go} onLaunch={onLaunch} />
      </div>
    );
  }
  return (
    <div style={{ background: k.cream, color: k.ink, fontFamily: bdy, minHeight: "100vh" }}>
      <SiteNav page={page} go={go} onLaunch={onLaunch} />
      {page === "home" && <Home go={go} onLaunch={onLaunch} drives={drives} />}
      {page === "drives" && <PublicDrives drives={drives} onLaunch={onLaunch} />}
      {page === "services" && <Services go={go} onLaunch={onLaunch} />}
      {page.startsWith("sol:") && <SolutionPage id={page.slice(4)} go={go} onLaunch={onLaunch} />}
      {page === "pricing" && <PricingPage onLaunch={onLaunch} go={go} />}
      {page === "about" && <AboutPage go={go} onLaunch={onLaunch} />}
      {page === "contact" && <Contact />}
      {page === "privacy" && <LegalPage kind="privacy" />}
      {page === "terms" && <LegalPage kind="terms" />}
      <SiteFooter go={go} onLaunch={onLaunch} />
    </div>
  );
}

function SiteNav({ page, go, onLaunch }) {
  const [open, setOpen] = useState(null);
  const [menu, setMenu] = useState(false);
  const navigate = (t) => { setOpen(null); setMenu(false); go(t); };
  useEffect(() => {
    const close = () => setOpen(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);
  return (
    <div className="chrome-wrap" style={{ position: "sticky", top: 0, zIndex: 50, ...chromeStrip, padding: "10px 16px 12px" }}>
      <div className="chrome-inner" style={{ maxWidth: 1140, margin: "0 auto", ...chromeBox, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginRight: 4 }}><Wordmark size={20} /></button>
        <button className="nav-burger" type="button" aria-label="Menu" onClick={() => setMenu((m) => !m)} style={{ ...iconBtn, padding: 8, display: "none", alignItems: "center" }}>
          {menu ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
          {NAV.map((n, i) => n.menu ? (
            <div key={i} style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                onMouseEnter={() => setOpen(i)}
                style={{ ...navBtn, color: open === i ? k.ink : k.ink2, display: "flex", alignItems: "center", gap: 5 }}>
                {n.label} <ChevronDown size={15} style={{ transform: open === i ? "rotate(180deg)" : "none", transition: "transform .18s" }} />
              </button>
              {open === i && (
                <div
                  onMouseLeave={() => setOpen(null)}
                  style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", paddingTop: 12, zIndex: 60 }}>
                  <div style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.card, boxShadow: "0 22px 50px -20px rgba(11,16,32,.22)", padding: 10, width: 310 }}>
                    {n.menu.map(([target, label, desc]) => (
                      <button key={label} onClick={() => navigate(target)} style={{
                        display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
                        cursor: "pointer", padding: "11px 13px", borderRadius: 12, fontFamily: bdy,
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = k.cream2)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: k.ink }}>{label}</div>
                        <div style={{ fontSize: 12.5, color: k.mid, marginTop: 3 }}>{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button key={n.id} className="navitem" onClick={() => navigate(n.id)} style={{ ...navBtn, color: page === n.id ? k.ink : k.ink2, fontWeight: page === n.id ? 600 : 500 }}>{n.label}</button>
          ))}
        </div>
        <div className="nav-ctas" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => onLaunch("employer")} style={solidSm}>I'm hiring <ArrowRight size={15} /></button>
          <button onClick={() => onLaunch("candidate")} style={outlineSm}>Joining a walk-in?</button>
        </div>
      </div>
      {menu && (
        <div style={{ background: "#fff", borderBottom: `1px solid ${k.line}`, padding: "8px 16px 18px" }}>
          {NAV.flatMap((n) => n.menu ? n.menu.map(([target, label]) => [target, label]) : [[n.id, n.label]]).map(([id, label]) => (
            <button key={label} type="button" onClick={() => navigate(id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "14px 4px", border: "none", background: "none", borderBottom: `1px solid ${k.line}`, fontFamily: bdy, fontSize: 16, fontWeight: 600, color: k.ink, cursor: "pointer" }}>{label}</button>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            <button onClick={() => { setMenu(false); onLaunch("employer"); }} style={{ ...solid, justifyContent: "center", width: "100%" }}>I'm hiring</button>
            <button onClick={() => { setMenu(false); onLaunch("candidate"); }} style={{ ...outline, justifyContent: "center", width: "100%" }}>Joining a walk-in?</button>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn = { background: "none", border: "none", cursor: "pointer", fontFamily: bdy, fontSize: 15, fontWeight: 500, padding: 0, transition: "color .15s" };

function SiteFooter({ go, onLaunch }) {
  const cols = [
    ["Company", [["home", "Home"], ["services", "Products"], ["about", "About us"], ["contact", "Contact us"]]],
    ["Solutions", [["services", "Walk-in drives"], ["services", "Campus hiring"], ["drives", "Staffing agencies"], ["pricing", "Pricing"]]],
    ["Resources", [["demo", "Watch a walk-in"], ["drives", "Upcoming walk-ins"], ["contact", "Contact us"], ["privacy", "Privacy"], ["terms", "Terms of use"]]],
  ];
  return (
    <footer style={{ background: "#fff", borderTop: `1px solid ${k.line}`, marginTop: 60 }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "56px 26px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr) 1.1fr", gap: 30 }} className="g3">
          {cols.map(([title, links]) => (
            <div key={title}>
              <div style={{ fontFamily: dsp, fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {links.map(([target, label], i) => (
                  <button key={i} onClick={() => go(target)} style={{ background: "none", border: "none", color: k.ink2, fontSize: 14.5, cursor: "pointer", fontFamily: bdy, padding: 0, textAlign: "left" }}>{label}</button>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {[Linkedin, Mail, Phone].map((I, i) => (
                <div key={i} style={{ width: 38, height: 38, borderRadius: "50%", background: k.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <I size={17} color="#fff" />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 14.5, color: k.ink2, lineHeight: 1.7 }}>
              Gachibowli<br />Hyderabad, Telangana 500032
            </div>
            <div style={{ fontSize: 14.5, color: k.ink2, marginTop: 14 }}>hello@tokenhire.app</div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${k.line}`, marginTop: 44, padding: "22px 0 30px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13.5, color: k.mid }}>Copyright 2026 ©. All rights reserved.</span>
          <Wordmark size={15} />
        </div>
      </div>
    </footer>
  );
}

/* --- Cinematic walk-in story demo (in-product, not an MP4) --- */
const STORY_SCENES = [
  { id: "title", ms: 2400, kicker: "TokenHire", line: "A walk-in." },
  { id: "chaos", ms: 3000, kicker: "8:47am", line: "The usual." },
  { id: "gate", ms: 3600, kicker: "Gate", line: "Printed. It never rotates." },
  { id: "prove", ms: 3800, kicker: "Waiting room", line: "DESK on the TV. Forty-five seconds." },
  { id: "checkin", ms: 3400, kicker: "Checked in", line: "014 · Priya Nair" },
  { id: "nudge", ms: 3400, kicker: "WhatsApp", line: "Once. Fifteen minutes out." },
  { id: "floor", ms: 4000, kicker: "On the floor", line: "Call her to Room 2." },
  { id: "end", ms: 5200, kicker: "Same day", line: "Selected." },
];

function WalkInDemo({ go, onLaunch }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fill, setFill] = useState(0);
  const [full, setFull] = useState(false);
  const elapsedRef = useRef(0);
  const iRef = useRef(0);
  const playingRef = useRef(true);
  iRef.current = i;
  playingRef.current = playing;
  const scene = STORY_SCENES[i];
  const last = i === STORY_SCENES.length - 1;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf;
    const t0 = performance.now() - elapsedRef.current;
    const tick = (now) => {
      if (!playingRef.current) return;
      const t = now - t0;
      elapsedRef.current = t;
      const dur = STORY_SCENES[iRef.current].ms;
      setFill(Math.min(1, t / dur));
      if (t >= dur) {
        if (iRef.current < STORY_SCENES.length - 1) {
          elapsedRef.current = 0;
          setFill(0);
          setI(iRef.current + 1);
        } else {
          setPlaying(false);
          setFill(1);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, i]);

  const jump = (n) => {
    const next = Math.max(0, Math.min(STORY_SCENES.length - 1, n));
    elapsedRef.current = 0;
    setFill(0);
    setI(next);
  };
  const replay = () => { jump(0); setPlaying(true); };
  const toggle = () => {
    if (!playingRef.current && iRef.current === STORY_SCENES.length - 1 && elapsedRef.current >= STORY_SCENES[STORY_SCENES.length - 1].ms) {
      replay();
      return;
    }
    setPlaying((p) => !p);
  };
  const toggleRef = useRef(toggle);
  const jumpRef = useRef(jump);
  toggleRef.current = toggle;
  jumpRef.current = jump;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === " " || e.code === "Space") { e.preventDefault(); toggleRef.current(); }
      if (e.key === "ArrowRight") jumpRef.current(iRef.current + 1);
      if (e.key === "ArrowLeft") jumpRef.current(iRef.current - 1);
      if (e.key === "Escape") go("home");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const toggleFull = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setFull(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setFull(false)).catch(() => {});
    }
  };
  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const filmBtn = { width: 40, height: 40, borderRadius: "50%", border: `1px solid ${k.line}`, background: "#fff", color: k.ink, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

  return (
    <div className="storypage" style={{
      position: "fixed", inset: 0, zIndex: 80, background: k.cream,
      display: "flex", flexDirection: "column", fontFamily: bdy, color: k.ink, overflow: "auto",
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", width: "100%", padding: "12px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Wordmark size={16} />
          <span style={{ fontSize: 12.5, color: k.mid, fontWeight: 600 }}>A walk-in · playable demo</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={toggleFull} style={filmBtn} aria-label={full ? "Exit fullscreen" : "Enter fullscreen"}>{full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          <button onClick={() => go("home")} style={filmBtn} aria-label="Close demo"><X size={16} /></button>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "10px auto 0", width: "100%", padding: "0 24px", display: "flex", gap: 5, flexShrink: 0 }}>
        {STORY_SCENES.map((s, idx) => (
          <button key={s.id} onClick={() => jump(idx)} aria-label={`Scene ${idx + 1}: ${s.kicker || s.line}`} style={{
            flex: 1, height: 12, padding: "4px 0", border: "none", borderRadius: 99, background: "transparent", cursor: "pointer", overflow: "hidden",
          }}>
            <div style={{ height: 3, borderRadius: 99, background: k.line, overflow: "hidden" }}>
              <div style={{ height: "100%", width: idx < i ? "100%" : idx === i ? `${fill * 100}%` : "0%", background: k.coral, borderRadius: 99 }} />
            </div>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0, padding: "8px 24px 0" }}>
        <div key={scene.id} style={{ animation: "storyIn .45s ease", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="storystage" style={{
            flex: 1, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 0,
            animation: "storyKen 10s ease-out forwards",
          }}>
            <StoryFrame id={scene.id} fill={fill} onLaunch={onLaunch} replay={replay} />
          </div>
          {scene.id !== "title" && (scene.kicker || scene.line) ? (
            <div style={{ textAlign: "center", padding: "8px 12px 4px", flexShrink: 0 }}>
              {scene.kicker ? <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", color: k.coral, marginBottom: 3 }}>{scene.kicker}</div> : null}
              {scene.line ? <div style={{ fontFamily: dsp, fontSize: "clamp(17px, 2.2vw, 24px)", fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{scene.line}</div> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: "0 auto 14px", width: "100%", padding: "6px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => jump(i - 1)} style={{ ...filmBtn, opacity: i === 0 ? .35 : 1 }} aria-label="Previous scene" disabled={i === 0}><ArrowLeft size={16} /></button>
          <button onClick={toggle} style={{ ...filmBtn, width: 52, height: 52, background: k.coral, color: "#fff", border: "none" }} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />}
          </button>
          <button onClick={() => jump(i + 1)} style={{ ...filmBtn, opacity: last ? .35 : 1 }} aria-label="Next scene" disabled={last}><ArrowRight size={16} /></button>
          <span style={{ fontFamily: typ, fontSize: 12, fontWeight: 600, color: k.mid, marginLeft: 6 }}>{String(i + 1).padStart(2, "0")} / {String(STORY_SCENES.length).padStart(2, "0")}</span>
        </div>
        <button onClick={replay} style={{ ...ghostSm, gap: 6 }}><RotateCcw size={13} /> Replay</button>
      </div>
    </div>
  );
}

function StoryFrame({ id, fill, onLaunch, replay }) {
  if (id === "title") return <StoryTitle />;
  if (id === "chaos") return <StoryChaos />;
  if (id === "gate") return <StoryGate />;
  if (id === "prove") return <StoryProve fill={fill} />;
  if (id === "checkin") return <StoryCheckin />;
  if (id === "nudge") return <StoryNudge />;
  if (id === "floor") return <StoryFloor />;
  return <StoryOutcomes onLaunch={onLaunch} replay={replay} />;
}

function StorySet({ children, tone = "set" }) {
  const bg = tone === "chaos" ? "#F6EEDC" : tone === "night" ? "#EEF2FA" : k.cream2;
  return (
    <div className="storystage" style={{
      width: "min(1120px, 100%)", minHeight: 500, background: bg, borderRadius: 28,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 40, padding: "40px 36px",
      boxSizing: "border-box",
    }}>{children}</div>
  );
}
function DemoQr({ seed = "GATE", size = 176 }) {
  const n = 21, cell = size / n;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const on = (x, y) => {
    const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    if (finder) {
      const dx = x >= n - 7 ? x - (n - 7) : x;
      const dy = y >= n - 7 ? y - (n - 7) : y;
      return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
    }
    return ((Math.imul(h + x * 17 + y * 31, 1103515245) + 12345) >>> 24 & 1) === 1;
  };
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (on(x, y)) cells.push(`${x},${y}`);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ display: "block", background: "#fff" }}>
      <rect width={size} height={size} fill="#fff" />
      {cells.map((p) => {
        const [x, y] = p.split(",").map(Number);
        return <rect key={p} x={x * cell} y={y * cell} width={cell} height={cell} fill={k.ink} />;
      })}
    </svg>
  );
}
function StoryPhone({ children, glow }) {
  return (
    <div className="storyphone" style={{
      width: 320, background: k.ink, borderRadius: 44, padding: "14px 11px 18px", flexShrink: 0,
      boxShadow: glow ? "0 36px 70px -18px rgba(44,107,245,.42)" : "0 36px 64px -20px rgba(11,16,32,.45)",
    }}>
      <div style={{ width: 96, height: 24, borderRadius: 16, background: "#000", margin: "0 auto 12px" }} />
      <div style={{ background: "#fff", borderRadius: 34, overflow: "hidden", minHeight: 460 }}>{children}</div>
    </div>
  );
}
function StoryDesk({ children, label, width = 520 }) {
  return (
    <div className="storydesk" style={{ width, flexShrink: 0 }}>
      <div style={{ background: k.ink, borderRadius: "18px 18px 10px 10px", padding: "14px 14px 0", boxShadow: "0 36px 64px -24px rgba(11,16,32,.42)" }}>
        <div style={{ background: "#fff", borderRadius: "12px 12px 0 0", overflow: "hidden", minHeight: 320 }}>
          <div style={{ padding: "12px 18px", background: k.cream2, borderBottom: `1px solid ${k.line}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", gap: 5 }}>
              {["#E8A0A0", "#E2D48A", "#A8D4B8"].map((c) => <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: k.mid }}>{label}</span>
          </div>
          {children}
        </div>
      </div>
      <div style={{ height: 12, background: "#1a2033", borderRadius: "0 0 12px 12px" }} />
      <div style={{ height: 8, width: "42%", margin: "0 auto", background: "#2a3148", borderRadius: "0 0 8px 8px" }} />
    </div>
  );
}
function StoryTv({ children, width = 460 }) {
  return (
    <div className="storytv" style={{ width, flexShrink: 0 }}>
      <div style={{ background: k.ink, borderRadius: 18, padding: 12, boxShadow: "0 36px 64px -18px rgba(11,16,32,.45)" }}>
        <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", minHeight: 300 }}>{children}</div>
      </div>
      <div style={{ height: 10, width: 64, background: "#2a3148", borderRadius: 2, margin: "12px auto 0" }} />
      <div style={{ height: 8, width: 140, background: "#1a2033", borderRadius: 4, margin: "0 auto" }} />
    </div>
  );
}
function StoryPaper({ children, rot, width = 268, z = 1 }) {
  return (
    <div style={{
      width, background: k.goldDim, borderRadius: 3, padding: "20px 18px 22px", flexShrink: 0, zIndex: z,
      boxShadow: "0 22px 44px -20px rgba(11,16,32,.38)",
      border: "1px solid rgba(154,107,0,.2)",
      "--r": `${rot}deg`,
      animation: "paperSettle .7s ease both",
    }}>{children}</div>
  );
}

function StoryTitle() {
  return (
    <StorySet>
      <div style={{ textAlign: "center", padding: "8px 20px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}><TokenMark size={96} /></div>
        <Wordmark size={24} />
        <div style={{ fontFamily: dsp, fontSize: 28, fontWeight: 700, letterSpacing: -0.8, marginTop: 18 }}>A walk-in.</div>
        <div style={{ fontSize: 14, color: k.mid, fontWeight: 600, marginTop: 14 }}>Vistaar Services · HITEC City, Tower B</div>
        <div style={{ fontFamily: typ, fontSize: 13, color: k.coral, fontWeight: 700, marginTop: 8, letterSpacing: 1.4 }}>LIVE · 8:47am</div>
      </div>
    </StorySet>
  );
}

function StoryChaos() {
  return (
    <StorySet tone="chaos">
      <StoryPaper rot={-7.5} width={270} z={1}>
        <div style={{ fontFamily: typ, fontSize: 10, letterSpacing: 1.2, color: k.gold, fontWeight: 700, marginBottom: 8 }}>CLIPBOARD · GATE 1</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Vistaar — 26 Aug</div>
        {[
          ["Rahul Menon", "Room 1??"],
          ["Sneha Iyer", "waiting"],
          ["Priya Nair", "which list"],
          ["Arjun Reddy", "SKIPPED"],
          ["Fatima S.", "called twice"],
        ].map(([n, st], i) => (
          <div key={n} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 0", borderTop: i ? "1px dashed rgba(154,107,0,.28)" : "none", fontSize: 14 }}>
            <span style={{ textDecoration: st === "SKIPPED" ? "line-through" : "none", color: st === "SKIPPED" ? k.red : k.ink }}>{i + 1}. {n}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: st === "SKIPPED" ? k.red : k.gold }}>{st}</span>
          </div>
        ))}
      </StoryPaper>
      <div style={{ marginLeft: -56, zIndex: 2 }}>
        <StoryPaper rot={4.2} width={250} z={2}>
          <div style={{ fontFamily: typ, fontSize: 10, letterSpacing: 1.2, color: k.gold, fontWeight: 700, marginBottom: 8 }}>FRONT DESK</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: -0.4 }}>“Priya? Which list?”</div>
          <div style={{ fontSize: 14, color: k.ink2, lineHeight: 1.45, marginBottom: 16 }}>Notebook. Three photocopies. A WhatsApp group named Walk-in TODAY.</div>
          <div style={{ background: k.redDim, color: k.red, borderRadius: 8, padding: "12px 14px", fontSize: 13.5, fontWeight: 700 }}>40 at the gate · nobody next</div>
        </StoryPaper>
      </div>
    </StorySet>
  );
}

function StoryGate() {
  return (
    <StorySet>
      <div style={{
        width: 300, background: "#fff", borderRadius: 4, padding: "26px 22px 22px", textAlign: "center", flexShrink: 0,
        boxShadow: "0 28px 56px -20px rgba(11,16,32,.38)",
        outline: "1px dashed rgba(11,16,32,.16)", outlineOffset: 10,
        transform: "rotate(-1.2deg)",
      }}>
        <div style={{ fontFamily: typ, fontSize: 11, letterSpacing: 1.8, color: k.coral, fontWeight: 700, marginBottom: 8 }}>GATE · PRINT THIS</div>
        <div style={{ fontFamily: dsp, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Vistaar Services</div>
        <div style={{ fontSize: 13, color: k.mid, marginBottom: 18 }}>Voice Process · HITEC City</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><DemoQr seed="GATE-VISTA1" size={188} /></div>
        <div style={{ fontFamily: typ, fontSize: 20, fontWeight: 700, letterSpacing: 2.2 }}>GATE-VISTA1</div>
        <div style={{ fontSize: 12.5, color: k.mid, marginTop: 8 }}>Tape at security. Does not rotate.</div>
      </div>
      <StoryPhone glow>
        <div style={{ background: "#0B1020", height: 460, position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 16px 8px", color: "rgba(255,255,255,.72)", fontSize: 13, fontWeight: 600, textAlign: "center" }}>Scan GATE QR</div>
          <div style={{ flex: 1, margin: "10px 22px 36px", borderRadius: 18, overflow: "hidden", position: "relative", background: "#1a2238", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DemoQr seed="GATE-VISTA1" size={140} />
            <div style={{ position: "absolute", inset: 18, border: `2px solid ${k.coral}`, borderRadius: 14, pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 24, right: 24, height: 2, background: k.coral, animation: "scanSweep 1.8s ease-in-out infinite alternate", pointerEvents: "none" }} />
          </div>
          <div style={{ padding: "0 16px 24px", textAlign: "center", color: "#fff", fontSize: 13.5 }}>Hold over the printed poster</div>
        </div>
      </StoryPhone>
    </StorySet>
  );
}

function StoryProve({ fill = 0 }) {
  const left = Math.max(1, Math.round(45 * (1 - fill)));
  return (
    <StorySet tone="night">
      <StoryTv>
        <div style={{ padding: "14px 20px", borderBottom: `2px solid ${k.ink}`, fontFamily: typ, fontSize: 12, letterSpacing: 1.5, color: k.ink2, display: "flex", justifyContent: "space-between" }}>
          <span>WAITING ROOM</span><span style={{ color: k.coral, fontWeight: 700 }}>LIVE</span>
        </div>
        <div style={{ padding: "40px 22px 32px", textAlign: "center", background: k.cream2 }}>
          <div style={{ fontFamily: typ, fontSize: 12, letterSpacing: 1.8, color: k.mid, fontWeight: 700, marginBottom: 12 }}>DESK · TV ONLY</div>
          <div style={{ fontFamily: typ, fontSize: 36, fontWeight: 800, letterSpacing: 3.4, color: k.ink }}>DESK-K7P2N9</div>
          <div style={{ fontSize: 14, color: k.coral, fontFamily: typ, marginTop: 14, fontWeight: 700 }}>ROTATES IN {String(left).padStart(2, "0")}s</div>
        </div>
        <div style={{ padding: "16px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: k.mid }}>
          <span>Now calling</span>
          <TokenChip token="W-013" name="M···a" size={32} muted />
        </div>
      </StoryTv>
      <StoryPhone glow>
        <div style={{ padding: "32px 22px 24px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: .9, textTransform: "uppercase", color: k.coral, marginBottom: 12 }}>You're at the right walk-in</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Vistaar Services</div>
          <div style={{ fontSize: 14, color: k.mid, lineHeight: 1.45, marginBottom: 28 }}>Voice Process · HITEC City</div>
          <div style={{ fontSize: 12.5, color: k.ink2, marginBottom: 8, fontWeight: 600 }}>DESK from the TV</div>
          <div style={{ fontFamily: typ, letterSpacing: 2.6, fontSize: 17, fontWeight: 700, border: `1.5px solid ${k.coral}`, borderRadius: 12, padding: "16px 14px", marginBottom: 18, textAlign: "center" }}>DESK-K7P2N9</div>
          <div style={{ ...solid, justifyContent: "center", padding: 13, fontSize: 15, width: "100%", boxSizing: "border-box" }}>Prove I'm here</div>
        </div>
      </StoryPhone>
    </StorySet>
  );
}

function StoryCheckin() {
  return (
    <StorySet>
      <StoryPhone glow>
        <div style={{ background: k.ink, color: "#fff", padding: "14px 20px", fontFamily: typ, fontSize: 12, letterSpacing: 1.8, display: "flex", justifyContent: "space-between" }}>
          <span>ADMISSION SLIP</span><span style={{ opacity: .7 }}>Vistaar</span>
        </div>
        <div style={{ padding: "32px 24px 26px" }}>
          <div style={{ fontSize: 13.5, color: k.mid, marginBottom: 20 }}>Vistaar Services · Voice Process</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
            <TokenTile token="W-014" size={84} pulse />
            <div>
              <div style={{ fontWeight: 700, fontSize: 24, lineHeight: 1.15, letterSpacing: -0.5 }}>Priya Nair</div>
              <div style={{ fontSize: 14, color: k.mid, marginTop: 5 }}>Walk-in 014</div>
            </div>
          </div>
          <div style={{ textAlign: "center", background: k.band, borderRadius: 20, padding: "30px 16px" }}>
            <div style={{ fontFamily: dsp, fontSize: 64, fontWeight: 800, color: k.coral, letterSpacing: -2.5, lineHeight: 1 }}>4</div>
            <div style={{ fontSize: 15, color: k.ink, fontWeight: 600, marginTop: 6 }}>ahead of you</div>
            <div style={{ fontSize: 13.5, color: k.ink2, marginTop: 8 }}>~28 min</div>
          </div>
        </div>
      </StoryPhone>
    </StorySet>
  );
}

function StoryNudge() {
  return (
    <StorySet>
      <StoryPhone glow>
        <div style={{ background: k.coral, color: "#fff", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TokenMark size={22} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>TokenHire</div>
            <div style={{ fontSize: 12, opacity: .88 }}>WhatsApp · now</div>
          </div>
        </div>
        <div style={{ background: k.cream2, minHeight: 380, padding: "28px 18px" }}>
          <div style={{ background: "#fff", borderRadius: "4px 18px 18px 18px", padding: "16px 18px", fontSize: 15.5, color: k.ink, lineHeight: 1.5, boxShadow: "0 1px 3px rgba(11,16,32,.06)" }}>
            Priya, you're up in about 15 minutes — 014. Please be near the waiting area.
          </div>
          <div style={{ fontSize: 12.5, color: k.mid, marginTop: 12 }}>11:02am · one message</div>
        </div>
      </StoryPhone>
    </StorySet>
  );
}

function StoryFloor() {
  return (
    <StorySet tone="night">
      <StoryDesk label="Recruiter · Arun · Room 2">
        <div style={{ padding: "18px 18px 20px" }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .7, textTransform: "uppercase", marginBottom: 12 }}>Live queue</div>
          {[
            ["W-013", "Meera Joshi", "In interview", false],
            ["W-014", "Priya Nair", "Call · Room 2", true],
            ["W-015", "Sandeep Kumar", "Waiting", false],
          ].map(([tok, name, st, on]) => (
            <div key={tok} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "14px 12px", borderRadius: 12, background: on ? k.coralDim : "transparent", marginBottom: 4 }}>
              <TokenChip token={tok} name={name} size={44} pulse={on} />
              {on ? <span style={{ ...solid, padding: "8px 14px", fontSize: 13 }}>{st}</span> : <span style={{ fontSize: 13.5, color: k.mid, fontWeight: 600 }}>{st}</span>}
            </div>
          ))}
        </div>
      </StoryDesk>
      <StoryTv width={380}>
        <div style={{ padding: "14px 18px", borderBottom: `2px solid ${k.ink}`, fontFamily: typ, fontSize: 12, letterSpacing: 1.5, color: k.ink2, display: "flex", justifyContent: "space-between" }}>
          <span>NOW CALLING</span><span style={{ color: k.coral, fontWeight: 700 }}>LIVE</span>
        </div>
        <div style={{ padding: "32px 20px", background: k.band, display: "flex", justifyContent: "center" }}>
          <TokenChip token="W-014" name="P···a" size={64} pulse />
        </div>
        <div style={{ padding: "10px 18px", background: k.cream2, fontFamily: typ, fontSize: 11, letterSpacing: 1.3, color: k.mid }}>UP NEXT</div>
        {[["W-015", "S···r"], ["W-016", "A···a"]].map(([tok, nm]) => (
          <div key={tok} style={{ padding: "14px 18px", borderTop: `1px solid ${k.line}` }}>
            <TokenChip token={tok} name={nm} size={36} muted />
          </div>
        ))}
      </StoryTv>
    </StorySet>
  );
}

function StoryOutcomes({ onLaunch, replay }) {
  return (
    <StorySet>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <div style={{
          width: 340, background: "#fff", border: `1px solid ${k.line}`, borderRadius: 24, padding: "32px 32px 26px",
          boxShadow: "0 24px 50px -24px rgba(11,16,32,.28)",
        }}>
          <TokenChip token="W-014" name="Priya Nair" size={64} />
          <div style={{ background: k.coralDim, color: k.coral, fontSize: 14, fontWeight: 700, padding: "8px 12px", borderRadius: 8, display: "inline-block", marginTop: 18 }}>Selected</div>
        </div>
        <div style={{ fontFamily: typ, fontSize: 13.5, color: k.mid, fontWeight: 600 }}>50 walked in · 8 selected · 4 on hold · 7 rejected</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => onLaunch("employer")} style={solid}>Set up a walk-in <ArrowRight size={16} /></button>
          <button onClick={replay} style={outline}><RotateCcw size={14} /> Replay</button>
        </div>
      </div>
    </StorySet>
  );
}

function Highlight({ children }) {
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <span style={{ position: "absolute", left: -4, right: -4, bottom: 4, height: "0.32em", background: k.coralDim, borderRadius: 3, zIndex: 0 }} />
    </span>
  );
}

/* the signature hero: one queue, two honest views, shown side by side and physically linked */
function SplitHero() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTick((t) => t + 1), 2800); return () => clearInterval(iv); }, []);
  const calling = tick % 3 === 1;
  const rows = [
    { tok: "W-013", name: "Meera Joshi", st: "In interview", tone: k.mid },
    { tok: "W-014", name: "Priya Nair", st: calling ? "Being called" : "Waiting", tone: calling ? k.coral : k.mid },
    { tok: "W-015", name: "Sandeep Kumar", st: "Waiting", tone: k.mid },
  ];
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 26px" }}>
      <div style={{ ...box, overflow: "hidden", borderRadius: 24, boxShadow: "0 24px 50px -28px rgba(11,16,32,.28)" }}>
        <div style={{ padding: "14px 22px", background: k.cream2, borderBottom: `1px solid ${k.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: dsp, fontWeight: 700, fontSize: 14.5 }}>Vistaar Services · Voice Process Associate</div>
            <div style={{ fontSize: 12, color: k.mid, marginTop: 2 }}>HITEC City · live walk-in</div>
          </div>
          <Pill tone="teal">LIVE NOW</Pill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="g2">
          <div style={{ padding: "28px 28px 32px", borderRight: `1px solid ${k.line}`, background: "#fff" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: k.mid, letterSpacing: .7, textTransform: "uppercase", marginBottom: 16 }}>On their phone</div>
            <div style={{ fontSize: 12.5, color: k.ink2, margin: "0 0 14px" }}>Your walk-in number</div>
            <TokenChip token="W-014" name="Priya Nair" size={64} pulse={calling} />
            <div style={{ height: 6, background: k.cream2, borderRadius: 3, margin: "16px 0 12px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: calling ? "92%" : "58%", background: k.coral, borderRadius: 3, transition: "width 1s ease" }} />
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: calling ? k.coral : k.ink2 }}>
              {calling ? "You're being called — go to Room 2" : "3 people ahead · about 24 min"}
            </div>
          </div>
          <div style={{ padding: "28px 28px 32px", background: k.bandSoft }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: k.mid, letterSpacing: .7, textTransform: "uppercase", marginBottom: 16 }}>On the recruiter desk</div>
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${k.line}`, overflow: "hidden" }}>
              {rows.map((r, i) => (
                <div key={r.tok} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 14px", borderTop: i ? `1px solid ${k.line}` : "none", background: r.st === "Being called" ? k.coralDim : "#fff" }}>
                  <TokenChip token={r.tok} name={r.name} size={36} pulse={r.st === "Being called"} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: r.tone, whiteSpace: "nowrap" }}>{r.st}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCards({ onChoose, go }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="g3">
      {PUBLIC_PLANS.map((p) => (
        <div key={p.id} style={{ border: `1px solid ${p.best ? k.teal : k.line}`, borderRadius: 8, padding: 24, background: "#fff", position: "relative", boxShadow: p.best ? "0 14px 32px -22px rgba(31,111,92,.4)" : "none" }}>
          {p.ribbon && <div style={{ position: "absolute", top: -9, left: 22, background: p.best ? k.teal : k.ink, color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 3, fontFamily: typ, letterSpacing: .5 }}>{p.ribbon}</div>}
          <div style={{ fontFamily: dsp, fontSize: 16, fontWeight: 700 }}>{p.name}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, margin: "12px 0 5px" }}>
            <span style={{ fontFamily: typ, fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{p.price}</span>
            <span style={{ fontSize: 12.5, color: k.faint }}>{p.unit}</span>
          </div>
          {p.annual && <div style={{ fontSize: 12, color: k.mid, marginBottom: 8 }}>{p.annual}</div>}
          <div style={{ fontSize: 13, color: k.ink2, lineHeight: 1.55, minHeight: 44, marginBottom: 14 }}>{p.blurb}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: k.coralDim, color: k.coral, fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: R.pill, marginBottom: 18 }}>
            {p.validity}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>{p.feats.map((f) => <div key={f} style={{ display: "flex", gap: 8, fontSize: 13, alignItems: "flex-start" }}><Check size={14} color={k.teal} style={{ flexShrink: 0, marginTop: 2 }} />{f}</div>)}</div>
          <button onClick={() => (p.talk && go ? go("contact") : onChoose(p))} style={{ ...(p.best ? solid : outline), width: "100%", justifyContent: "center", padding: 11 }}>{p.cta}</button>
        </div>
      ))}
    </div>
  );
}

function Home({ go, onLaunch, drives }) {
  return (
    <>
      <div style={{ background: k.cream, minHeight: "100vh", padding: "0 0 48px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "64px 26px 0", textAlign: "center" }}>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(36px, 5vw, 58px)", lineHeight: 1.12, letterSpacing: -1.4, margin: "0 auto 20px", color: k.ink, fontWeight: 700, maxWidth: 780 }}>
            One line. Two screens. <Highlight>Nobody's forgotten.</Highlight>
          </h1>
          <p style={{ fontSize: 17.5, color: k.ink2, lineHeight: 1.6, margin: "0 auto 34px", maxWidth: 520 }}>
            Candidates watch their own turn approach from their phone. Recruiters run the whole line from one screen. Same queue, two honest views.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
            <button onClick={() => onLaunch("employer")} style={solid}>Set up a walk-in <ArrowRight size={16} /></button>
            <button onClick={() => go("demo")} style={outline}><Play size={14} fill="currentColor" /> Watch a walk-in</button>
          </div>
        </div>
        <div style={{ marginTop: "auto", background: k.bandSoft, padding: "28px 0 36px" }}>
          <SplitHero />
        </div>
      </div>

      <div style={{ background: k.bandSoft, padding: "72px 0 88px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 26px" }}>
          <h2 style={{ fontFamily: dsp, fontSize: "clamp(30px,4vw,44px)", fontWeight: 400, letterSpacing: -1, margin: "0 0 40px", textAlign: "center" }}>
            Built for <b style={{ fontWeight: 800 }}>how you hire</b>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }} className="g3">
            {[
              ["bpo", "BPO & support", "500-a-day drives"],
              ["retail", "Retail & delivery", "Store-by-store hiring"],
              ["campus", "Campus hiring", "A batch in one morning"],
              ["agency", "Staffing agencies", "Hire for clients, branded as you"],
            ].map(([id, h, d]) => (
              <button key={id} onClick={() => go(`sol:${id}`)} style={{
                background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.card, padding: 26,
                textAlign: "left", cursor: "pointer", fontFamily: bdy,
              }}>
                <div style={{ fontFamily: dsp, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{h}</div>
                <div style={{ fontSize: 14, color: k.mid, marginBottom: 16 }}>{d}</div>
                <span style={{ fontSize: 13.5, color: k.coral, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>Learn more <ArrowRight size={13} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", padding: "96px 0 32px" }}>
        <CtaBand onLaunch={onLaunch} variant="home" flush />
      </div>
    </>
  );
}

const CTA_COPY = {
  home: { head: ["The ", "chaos is over"], sub: "Your next walk-in can run without a clipboard.", btn: "Set up a walk-in" },
  products: { head: ["Built for ", "the front desk"], sub: "Every piece above works out of the box. Nothing to configure, nothing to install.", btn: "Try it on a real drive" },
  about: { head: ["Come ", "build it with us"], sub: "We're early, and we'd rather hear from ten real recruiters than guess at what they need.", btn: "Talk to us" },
  solution: { head: ["Run your next walk-in ", "this way"], sub: "Set it up in a few minutes. Plans start at a small one-day event.", btn: "Set up a walk-in" },
};
function CtaBand({ onLaunch, variant = "home", onContact, flush }) {
  const c = CTA_COPY[variant] || CTA_COPY.home;
  return (
    <div style={{ maxWidth: 1140, margin: flush ? "0 auto" : "70px auto 0", padding: "0 26px" }}>
      <div style={{ background: k.band, borderRadius: 28, padding: "56px 40px", textAlign: "center" }}>
        <h2 style={{ fontFamily: dsp, fontSize: "clamp(28px,3.6vw,42px)", fontWeight: 400, letterSpacing: -1, margin: "0 0 14px" }}>
          {c.head[0]}<b style={{ fontWeight: 800 }}>{c.head[1]}</b>
        </h2>
        <p style={{ fontSize: 17, color: k.ink2, margin: "0 auto 30px", maxWidth: 460, lineHeight: 1.6 }}>{c.sub}</p>
        <button onClick={() => (variant === "about" && onContact ? onContact() : onLaunch("employer"))} style={solid}>{c.btn} <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}

function LiveBoard() {
  const [n, setN] = useState({ waiting: 7, calling: 1, interviewing: 2, completed: 4 });
  useEffect(() => {
    const iv = setInterval(() => {
      setN((p) => {
        const move = Math.random();
        if (move < 0.4 && p.waiting > 0) return { ...p, waiting: p.waiting - 1, calling: p.calling + 1 };
        if (move < 0.65 && p.calling > 0) return { ...p, calling: Math.max(0, p.calling - 1), interviewing: p.interviewing + 1 };
        if (move < 0.9 && p.interviewing > 0) return { ...p, interviewing: Math.max(0, p.interviewing - 1), completed: p.completed + 1 };
        return { ...p, waiting: p.waiting + 2 };
      });
    }, 2000);
    return () => clearInterval(iv);
  }, []);
  const rows = [
    ["Waiting", n.waiting, k.mid],
    ["Calling", n.calling, k.coral],
    ["Interviewing", n.interviewing, "#5C7DE0"],
    ["Completed", n.completed, k.teal],
  ];
  const max = Math.max(1, ...rows.map((r) => r[1]));
  const [filled, setFilled] = useState(false);
  const [spot, setSpot] = useState(0);
  useEffect(() => { const t = setTimeout(() => setFilled(true), 120); return () => clearTimeout(t); }, []);
  useEffect(() => { const iv = setInterval(() => setSpot((s) => (s + 1) % rows.length), 1700); return () => clearInterval(iv); }, [rows.length]);

  return (
    <div style={{ ...box, padding: "26px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: k.ink2 }}>What a drive looks like, minute to minute</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: k.teal, fontFamily: typ, fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: k.coral, animation: "blink 1.6s infinite" }} />EXAMPLE
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {rows.map(([label, val, color], i) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "6px 8px", marginLeft: -8, marginRight: -8, borderRadius: 8,
            background: spot === i ? k.cream2 : "transparent", transition: "background 0.5s ease",
          }}>
            <span style={{ fontSize: 13, color: k.ink2, width: 100, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 8, background: k.cream2, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: filled ? `${(val / max) * 100}%` : 0, background: color, borderRadius: 4, transition: `width 0.8s ease ${i * 0.08}s` }} />
            </div>
            <span style={{ fontFamily: typ, fontSize: 15, fontWeight: 700, color: k.ink, width: 24, textAlign: "right", flexShrink: 0 }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- About --- */
function AboutPage({ go, onLaunch }) {
  const principles = [
    [ShieldCheck, "Privacy by default", "Public screens show a token and a masked name. Only recruiters signed in to that drive see anything more."],
    [FileText, "We store as little as possible", "Aadhaar is optional, and even then we keep a one-way hash — never the number."],
    [HeartHandshake, "One job, done properly", "Walk-in hiring drives. Not general queueing, not an ATS. That focus is the point."],
  ];
  return (
    <>
      <div style={{ background: k.band }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "76px 26px 80px", textAlign: "center" }}>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(34px,4.8vw,52px)", fontWeight: 700, letterSpacing: -1.5, margin: "0 0 22px", lineHeight: 1.12 }}>
            Nobody should wait all day <Highlight>without knowing why.</Highlight>
          </h1>
          <p style={{ fontSize: 18, color: k.ink2, lineHeight: 1.65, margin: "0 auto", maxWidth: 500 }}>
            That's the whole reason TokenHire exists.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "70px 26px 0" }}>
        <p style={{ fontSize: 18, color: k.ink, lineHeight: 1.75, margin: "0 0 22px", fontWeight: 500 }}>
          A thousand people can pass through a walk-in drive in a weekend. By Monday, nothing's left but a paper register and a rough headcount.
        </p>
        <p style={{ fontSize: 16.5, color: k.ink2, lineHeight: 1.8, margin: "0 0 22px" }}>
          We watched it happen — candidates standing in corridors with no idea if they'd be seen, recruiters working off a shouted name and a clipboard, nobody able to say afterwards who was screened or why.
        </p>
        <p style={{ fontSize: 16.5, color: k.ink2, lineHeight: 1.8, margin: 0 }}>
          Every tool we found handled sourcing <i>before</i> the drive, or was queue software built for hospitals. Nothing sat at the actual front desk. So we built that: one place for a candidate to become known once, and one place for a recruiter to run the day without losing count of anyone in the room.
        </p>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "60px 26px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="g3">
          {principles.map(([I, t2, d]) => (
            <div key={t2}>
              <I size={22} color={k.coral} />
              <div style={{ fontFamily: dsp, fontSize: 18, fontWeight: 700, margin: "14px 0 8px" }}>{t2}</div>
              <div style={{ fontSize: 14.5, color: k.ink2, lineHeight: 1.65 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <CtaBand onLaunch={onLaunch} variant="about" onContact={() => go("contact")} />
    </>
  );
}

/* --- Services --- */
function Services({ go, onLaunch }) {
  const blocks = [
    { h: "A QR that can be printed", d: "Security holds a GATE QR that never changes — paper, a laminate, or a phone screenshot. That only identifies the walk-in. Check-in needs the rotating DESK code on the waiting-room TV, so a forwarded photo of the poster can't join the queue.", art: <ArtCode /> },
    { h: "One queue, many recruiters", d: "Every recruiter screening today works off the identical list. Nobody ever calls the same token twice, because there's only one source of truth.", art: <ArtQueue /> },
    { h: "A nudge 15 minutes before", d: "Candidates don't have to stand around watching a screen. WhatsApp tells them exactly when to come back, timed off your actual pace.", art: <ArtNudge /> },
    { h: "Names stay private in public", d: "The screen on the wall shows a token and a masked name — R···l, not Rahul. Only recruiters signed in to that drive see anything more.", art: <ArtMasked /> },
    { h: "Wait times from today's pace", d: "Estimates aren't set once at 9am and left stale. They recalculate continuously from how long your interviews are actually running.", art: <ArtPace /> },
    { h: "The report you never had", d: "Checked in, interviewed, selected, rejected, on hold — a real extract at the end of the day, ready to drop into your ATS. Offers stay off the walk-in floor.", art: <ArtReport /> },
  ];

  return (
    <>
      <div style={{ background: k.band }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "76px 26px 80px", textAlign: "center" }}>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(34px,4.8vw,52px)", fontWeight: 700, letterSpacing: -1.5, margin: "0 0 20px", lineHeight: 1.12 }}>
            One queue. <Highlight>One honest record.</Highlight>
          </h1>
          <p style={{ fontSize: 18, color: k.ink2, lineHeight: 1.65, margin: "0 auto", maxWidth: 480 }}>
            Everything that happens at the front desk of a walk-in drive — handled in one place.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "70px 26px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }} className="g2">
          {blocks.map((b) => (
            <div key={b.h} style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: 22, padding: 30, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontFamily: dsp, fontSize: 21, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 10px" }}>{b.h}</h3>
              <p style={{ fontSize: 14.5, color: k.ink2, lineHeight: 1.7, margin: "0 0 24px", flex: 1 }}>{b.d}</p>
              <div style={{ background: k.cream2, borderRadius: 16, padding: 24, display: "flex", justifyContent: "center" }}>{b.art}</div>
            </div>
          ))}
        </div>
      </div>

      <CtaBand onLaunch={onLaunch} variant="products" />
    </>
  );
}

/* --- small illustrative mockups for the Services page, built from our own UI language --- */
function ArtFrame({ children }) {
  return <div style={{ background: "#fff", borderRadius: 16, padding: 22, width: "100%", maxWidth: 340, boxShadow: "0 10px 26px -18px rgba(11,16,32,.28)" }}>{children}</div>;
}
function ArtCode() {
  return (
    <ArtFrame>
      <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 10, background: k.cream2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
            <QrCode size={36} color={k.ink} />
          </div>
          <div style={{ fontFamily: typ, fontSize: 10, color: k.coral, fontWeight: 700 }}>GATE · PRINT</div>
        </div>
        <div style={{ fontSize: 18, color: k.faint }}>+</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: typ, fontSize: 16, fontWeight: 700, letterSpacing: 1.5, color: k.ink, marginBottom: 8 }}>K7P2N9</div>
          <div style={{ fontFamily: typ, fontSize: 10, color: k.mid }}>DESK · TV ONLY</div>
        </div>
      </div>
    </ArtFrame>
  );
}
function ArtSlip() {
  return (
    <ArtFrame>
      <div style={{ background: k.ink, color: k.cream, padding: "6px 12px", fontFamily: typ, fontSize: 9.5, letterSpacing: 1.2, borderRadius: "6px 6px 0 0", margin: "-22px -22px 16px" }}>ADMISSION SLIP</div>
      <div style={{ marginBottom: 14 }}>
        <TokenChip token="W-014" name="Priya Nair" size={48} />
      </div>
      <div style={{ display: "flex", gap: 20, paddingTop: 10, borderTop: `1px solid ${k.line}` }}>
        <div><div style={{ fontSize: 10.5, color: k.mid }}>Position</div><div style={{ fontFamily: typ, fontWeight: 700, fontSize: 14 }}>4</div></div>
        <div><div style={{ fontSize: 10.5, color: k.mid }}>Roughly</div><div style={{ fontFamily: typ, fontWeight: 700, fontSize: 14 }}>28 min</div></div>
      </div>
    </ArtFrame>
  );
}
function ArtQueue() {
  const rows = [["W-011", "Lakshmi Prasad", "Being called", k.coral], ["W-012", "Sandeep Kumar", "Waiting", k.mid], ["W-013", "Meera Joshi", "Waiting", k.mid]];
  return (
    <ArtFrame>
      <div style={{ fontSize: 10.5, color: k.mid, fontWeight: 700, letterSpacing: .6, marginBottom: 10, textTransform: "uppercase" }}>Live queue</div>
      {rows.map(([tok, name, st, c], i) => (
        <div key={tok} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${k.line}` : "none" }}>
          <TokenChip token={tok} name={name} size={32} pulse={st === "Being called"} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: c, whiteSpace: "nowrap" }}>{st}</span>
        </div>
      ))}
    </ArtFrame>
  );
}
function ArtMasked() {
  return (
    <ArtFrame>
      <div style={{ fontSize: 10.5, color: k.mid, fontWeight: 700, letterSpacing: .6, marginBottom: 10, textTransform: "uppercase" }}>Waiting screen</div>
      {[["W-014", "R···l"], ["W-015", "P···a"], ["W-016", "M···d"]].map(([tok, nm], i) => (
        <div key={tok} style={{ display: "flex", alignItems: "center", padding: "9px 0", borderTop: i ? `1px solid ${k.line}` : "none" }}>
          <TokenChip token={tok} name={nm} size={28} muted />
        </div>
      ))}
    </ArtFrame>
  );
}
function ArtNudge() {
  return (
    <ArtFrame>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: k.tealDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Send size={12} color={k.teal} />
        </div>
        <div style={{ background: k.cream2, borderRadius: 10, padding: "10px 13px", fontSize: 12.5, color: k.ink2, lineHeight: 1.5 }}>
          Hi Rahul, you're up in about 15 minutes — number W-014. Please be near the waiting area.
        </div>
      </div>
      <div style={{ textAlign: "right", fontSize: 10.5, color: k.faint, marginTop: 8 }}>WhatsApp · now</div>
    </ArtFrame>
  );
}
function ArtPace() {
  const rows = [["Waiting", 68, k.faint], ["Interviewing", 40, k.coral], ["Selected", 22, k.teal]];
  return (
    <ArtFrame>
      {rows.map(([l, pct, c], i) => (
        <div key={l} style={{ marginBottom: i < rows.length - 1 ? 14 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}><span style={{ color: k.ink2 }}>{l}</span></div>
          <div style={{ height: 6, background: k.cream2, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 3 }} /></div>
        </div>
      ))}
    </ArtFrame>
  );
}
function ArtReport() {
  const rows = [["Walked in", 100, k.faint], ["Interviewed", 66, k.mid], ["Offered", 28, k.gold], ["Joined", 17, k.teal]];
  return (
    <ArtFrame>
      {rows.map(([l, pct, c]) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, color: k.mid, width: 76, flexShrink: 0 }}>{l}</span>
          <div style={{ flex: 1, height: 14, background: k.cream2, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: c, borderRadius: 3 }} /></div>
        </div>
      ))}
    </ArtFrame>
  );
}

/* --- Solutions: a real page per industry --- */
const SOLUTIONS = {
  bpo: {
    eyebrow: "BPO & customer support",
    head: ["Five hundred walk-ins. ", "One calm room."],
    sub: "Voice and non-voice drives run at volumes nothing else in hiring touches. The bottleneck isn't sourcing — it's the four hours between arriving and being seen.",
    pains: [
      ["The room holds 80. The queue is 400.", "Candidates spill into corridors and car parks because nobody knows who's next. Tokens and honest wait times let people leave and come back."],
      ["Six recruiters, six paper lists.", "Names get called twice, or never. One shared queue means every screener works off the same order."],
      ["Decisions stay in your ATS.", "The walk-in records selected, rejected, and on hold by round. Offers and joining happen later, in the system you already use."],
    ],
    stat: ["500+", "candidates in a single day's drive"],
  },
  retail: {
    eyebrow: "Retail & delivery",
    head: ["Hiring in ", "forty stores at once."],
    sub: "Store managers run their own walk-ins, usually with a notebook. Nothing rolls up, so head office finds out how it went a week later.",
    pains: [
      ["Every store does it differently.", "One store's register is a WhatsApp group, another's is paper. The same check-in flow everywhere makes the data comparable."],
      ["Head office is flying blind.", "Each drive posts its own numbers as it happens, instead of a spreadsheet emailed on Monday."],
      ["Walk-ins clash with the shop floor.", "Candidates waiting inside the store hurt trade. Send the 15-minute WhatsApp nudge so they can wait outside, and the aisle stays clear."],
    ],
    stat: ["40+", "store drives running the same week"],
  },
  campus: {
    eyebrow: "Campus hiring",
    head: ["A whole batch, ", "through by lunch."],
    sub: "Placement drives cram three hundred students into a corridor for a process that takes eight minutes each. The maths never works, and the students know it.",
    pains: [
      ["Everyone arrives at 9am.", "All of them, at once, because nobody's told them otherwise. Staggered wait times spread the same crowd across the day."],
      ["The placement cell is the queue.", "Two coordinators managing three hundred students by memory. The queue runs itself instead."],
      ["No record for the college.", "Placement officers need real numbers per drive. They get a report instead of a headcount."],
    ],
    stat: ["300", "students, one morning, one queue"],
  },
  agency: {
    eyebrow: "Staffing agencies",
    head: ["You hire for them. ", "The hall is yours."],
    sub: "Quess, TeamLease, Adecco — you staff banks, BPOs, and factories, and sometimes your own associate bench. Candidates join a Quess walk-in for HDFC, not a TokenHire event. Vistaar next door never sees your books.",
    pains: [
      ["One agency space — not a shared soup.", "Your recruiters and front desks only see Quess drives. Another agency (or a captive like Wipro) cannot open yours. Clients are tags inside your space, not logins that peek at each other."],
      ["The poster and the TV say Quess.", "GATE, waiting screen, and the admission slip carry your mark and the client name. A small Powered by TokenHire is all we keep."],
      ["Branches and clients in one login.", "Hyderabad HITEC vs Pune, HDFC sales vs Amazon warehouse vs bench. Tag the drive; the hall and the Monday extract follow."],
    ],
    stat: ["1", "agency login, many clients and cities"],
  },
};

function SolutionPage({ id, go, onLaunch }) {
  const s = SOLUTIONS[id];
  if (!s) return null;
  return (
    <>
      <div style={{ background: k.band }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "72px 26px 76px", textAlign: "center" }}>
          <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 18 }}>{s.eyebrow}</div>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(34px,5vw,56px)", fontWeight: 400, letterSpacing: -1.6, margin: "0 0 22px", lineHeight: 1.08 }}>
            {s.head[0]}<b style={{ fontWeight: 800 }}>{s.head[1]}</b>
          </h1>
          <p style={{ fontSize: 18, color: k.ink2, lineHeight: 1.65, margin: "0 auto 32px", maxWidth: 560 }}>{s.sub}</p>
          <button onClick={() => onLaunch("employer")} style={solid}>Set up a walk-in <ArrowRight size={16} /></button>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "-38px auto 0", padding: "0 26px" }}>
        <div style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: 26, padding: "34px 40px", boxShadow: "0 30px 60px -40px rgba(11,16,32,.25)", textAlign: "center" }}>
          <span style={{ fontFamily: dsp, fontSize: 42, fontWeight: 800, color: k.coral, letterSpacing: -1.5 }}>{s.stat[0]}</span>
          <span style={{ fontSize: 16, color: k.ink2, marginLeft: 14 }}>{s.stat[1]}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "64px 26px 0" }}>
        <h2 style={{ fontFamily: dsp, fontSize: "clamp(26px,3.6vw,38px)", fontWeight: 700, letterSpacing: -1, margin: "0 0 40px", textAlign: "center" }}>What actually goes wrong</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {s.pains.map(([h, d], i) => (
            <div key={h} style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 22, background: k.cream2, borderRadius: R.card, padding: "28px 32px" }}>
              <div style={{ fontFamily: dsp, fontSize: 26, fontWeight: 800, color: k.coral, opacity: .55 }}>{String(i + 1).padStart(2, "0")}</div>
              <div>
                <div style={{ fontFamily: dsp, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{h}</div>
                <div style={{ fontSize: 15, color: k.ink2, lineHeight: 1.7 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 34 }}>
          <button onClick={() => go("services")} style={outline}>See the full product <ArrowRight size={15} /></button>
        </div>
      </div>

      <CtaBand onLaunch={onLaunch} variant="solution" />
    </>
  );
}

/* --- Upcoming drives (public) --- */
function PublicDrives({ drives, onLaunch }) {
  const listed = drives.filter((d) => d.visibility !== "private");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("All");
  const [role, setRole] = useState("All roles");
  const [exp, setExp] = useState("");
  const [openId, setOpenId] = useState(null);
  const roles = ["All roles", ...Array.from(new Set(listed.map((d) => d.role))).sort()];

  const visible = listed
    .filter((d) => d.status !== "closed")
    .filter((d) => !city || d.city === city)
    .filter((d) => status === "All" || d.status === status)
    .filter((d) => role === "All roles" || d.role === role)
    .filter((d) => !exp || !(d.expNeeded || []).length || d.expNeeded.includes(exp))
    .sort((a, b) => a.date.localeCompare(b.date));

  const liveCount = listed.filter((d) => d.status === "live").length;
  const upcomingCount = listed.filter((d) => d.status === "upcoming").length;

  return (
    <>
      <div style={{ background: k.band }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "70px 26px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 16 }}>Upcoming drives</div>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(34px,4.8vw,54px)", fontWeight: 400, letterSpacing: -1.6, margin: "0 0 18px", lineHeight: 1.08 }}>
            Find a walk-in <b style={{ fontWeight: 800 }}>near you</b>
          </h1>
          <p style={{ fontSize: 18, color: k.ink2, lineHeight: 1.65, margin: "0 auto 30px", maxWidth: 500 }}>
            Sorted by date. Public walk-ins for the weekend show up here. Joining still means being at that venue: scan GATE, then enter the rotating DESK code from the TV.
          </p>
          <button onClick={() => onLaunch("candidate")} style={solid}>Set up my profile <ArrowRight size={16} /></button>
        </div>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 26px 46px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="g3">
            <QuickStat n={liveCount} label="drives open today" />
            <QuickStat n={upcomingCount} label="drives coming up" />
            <QuickStat n={new Set(listed.map((d) => d.city).filter(Boolean)).size} label="cities represented" />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "50px 26px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 34 }} className="g2">
          <div>
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>City</div>
              <CitySelect value={city} onChange={setCity} allowAll />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 26 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>Status</div>
              {["All", "live", "upcoming"].map((s) => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  textAlign: "left", padding: "10px 14px", borderRadius: R.pill, border: "none", cursor: "pointer", fontFamily: bdy, fontSize: 14,
                  background: status === s ? k.coralDim : "transparent", color: status === s ? k.coral : k.ink2, fontWeight: status === s ? 600 : 500,
                }}>{s === "All" ? "All" : s === "live" ? "Open today" : "Upcoming"}</button>
              ))}
            </div>
            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>Experience</div>
              <select value={exp} onChange={(e) => setExp(e.target.value)} style={{ ...input, appearance: "auto" }}>
                <option value="">All levels</option>
                {EXP_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>Role</div>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...input, fontSize: 13.5 }}>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            {!visible.length ? <Blank text="No walk-ins match that filter right now." /> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {visible.map((d) => {
                  const open = openId === d.id;
                  return (
                  <div key={d.id} style={{ background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.card, padding: "22px 26px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }} className="driverow2">
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ fontFamily: dsp, fontWeight: 700, fontSize: 18 }}>{d.role}</div>
                        <StatusPill status={d.status} />
                      </div>
                      <div style={{ fontSize: 14, color: k.mid }}>{listingHost(d)} · {listingPlace(d)}</div>
                      <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 12.5, color: k.ink2, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><ListChecks size={13} color={k.faint} />{(d.rounds || DEFAULT_ROUNDS).length} rounds</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Users2 size={13} color={k.faint} />{d.candidates.length} checked in so far</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: d.status === "live" ? k.coral : k.gold, marginBottom: 4 }}>{d.status === "live" ? "Open today" : fmtDate(d.date)}</div>
                      <div style={{ fontSize: 12, color: k.ink2, fontWeight: 600 }}>{expLabel(d.expNeeded)}</div>
                      <button onClick={() => setOpenId(open ? null : d.id)} style={{ ...textLink, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {open ? "Hide details" : "Job details"} <ChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none" }} />
                      </button>
                    </div>
                    </div>
                    {open && <DrivePosting d={d} />}
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function expLabel(bands) {
  if (!bands || !bands.length) return "All experience levels";
  return bands.join(" · ");
}
function DrivePosting({ d, flush }) {
  const docs = d.docs || [];
  return (
    <div style={{ marginTop: flush ? 0 : 18, paddingTop: flush ? 0 : 18, borderTop: flush ? "none" : `1px solid ${k.line}`, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }} className="g2">
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", marginBottom: 8 }}>Job description</div>
        <p style={{ fontSize: 14, color: k.ink2, lineHeight: 1.65, margin: 0 }}>{d.jd || "The recruiter hasn't added a description yet."}</p>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", margin: "16px 0 8px" }}>Experience needed</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(d.expNeeded && d.expNeeded.length ? d.expNeeded : ["All levels"]).map((b) => <Pill key={b} tone="coral">{b}</Pill>)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .7, textTransform: "uppercase", marginBottom: 8 }}>Bring these documents</div>
        {docs.length ? docs.map((doc) => (
          <div key={doc} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13.5, color: k.ink2, marginBottom: 8 }}>
            <Check size={14} color={k.teal} style={{ flexShrink: 0, marginTop: 3 }} />{doc}
          </div>
        )) : <div style={{ fontSize: 13.5, color: k.mid }}>No document list posted — carry a resume and ID to be safe.</div>}
      </div>
    </div>
  );
}
function QuickStat({ n, label }) {
  return (
    <div style={{ background: "#fff", borderRadius: R.card, padding: "20px 22px", textAlign: "center" }}>
      <div style={{ fontFamily: dsp, fontSize: 34, fontWeight: 800, color: k.coral, letterSpacing: -1 }}>{n}</div>
      <div style={{ fontSize: 13, color: k.ink2, marginTop: 4 }}>{label}</div>
    </div>
  );
}

/* --- Pricing --- */
function PricingPage({ onLaunch, go }) {
  return (
    <>
      <div style={{ background: k.band }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "70px 26px 74px", textAlign: "center" }}>
          <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 18 }}>Pricing</div>
          <h1 style={{ fontFamily: dsp, fontSize: "clamp(32px,4.4vw,50px)", fontWeight: 400, letterSpacing: -1.6, margin: "0 0 18px", lineHeight: 1.1 }}>
            Instead of 300 people waiting, this <b style={{ fontWeight: 800 }}>runs the walk-in</b>.
          </h1>
          <p style={{ fontSize: 18, color: k.ink2, lineHeight: 1.65, margin: "0 auto", maxWidth: 520 }}>Register, QR check-in, token, live status, rooms, reports — one system. GST extra.</p>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "54px 26px 80px" }}>
        <PlanCards onChoose={() => onLaunch("employer")} go={go} />
        <p style={{ fontSize: 14, color: k.mid, marginTop: 28, textAlign: "center", lineHeight: 1.6 }}>
          Need more?{" "}
          <button type="button" onClick={() => go("contact")} style={{ background: "none", border: "none", padding: 0, color: k.coral, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}>Contact us</button>.
        </p>
      </div>
    </>
  );
}

/* --- Contact --- */
const LEGAL = {
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated: August 2026",
    sections: [
      ["What we collect", "From candidates: name, phone number, email, experience level, LinkedIn URL, and resume file. Aadhaar is optional and used only to stop the same person re-registering to a drive under a different phone number — we run it through a one-way cryptographic hash before it ever reaches our database, so the number itself is never stored, only the last 4 digits and the hash. From hosts: work email, company name, and the drives they create."],
      ["Why we collect it", "To run the walk-in queue you signed up for: issuing your token, estimating your wait, letting a recruiter see your profile, and sending one WhatsApp nudge about 15 minutes before your turn. We do not text you when you are called, selected, or rejected — that status lives on your phone in the app."],
      ["Who can see it", "Only recruiters signed in to the specific drive you joined. On the public waiting-room screen, everyone else sees a token and a masked name — never your phone number, resume, or full name."],
      ["How long we keep it", "Candidate profiles stay in your account so you can join future drives without re-entering everything. You can ask us to delete your data at any time by writing to hello@tokenhire.app."],
      ["Where it's stored", "Resumes and identity-verification results are stored encrypted. Every resume download by a recruiter is logged."],
      ["Your rights", "Under India's Digital Personal Data Protection Act, you can request a copy of your data, ask us to correct it, or ask us to delete it. Write to hello@tokenhire.app and we'll respond within a reasonable time."],
    ],
  },
  terms: {
    title: "Terms of Use",
    updated: "Last updated: August 2026",
    sections: [
      ["What TokenHire is", "A queue and check-in system for walk-in hiring drives. We are not a staffing agency, a recruiter, or a party to any employment decision — we provide the software; the hiring company makes the calls."],
      ["Accounts", "A company account belongs to the business that creates it. Anyone invited to that account can see and manage every drive under it. It's the company's responsibility to manage who has access."],
      ["Candidate use", "Creating a candidate profile is free and always will be. You're responsible for the accuracy of what you submit — a false experience claim or fabricated verification status can get an application rejected by the hiring company, not by us."],
      ["Fair use of check-in codes", "GATE codes and the printed QR identify which walk-in you're at. They do not complete check-in. Joining the queue requires a live DESK code from the waiting-room screen (it rotates every 45 seconds) or a one-time pass issued by front desk. HOST codes are for recruiters only. Sharing or forwarding a GATE QR, DESK code, or gate pass so someone who isn't at the venue can check in is a violation of these terms and may result in account suspension."],
      ["No guarantee of hiring outcomes", "TokenHire manages the queue and the record-keeping. We don't guarantee interviews, offers, or job placement — those decisions rest entirely with the hiring company running the drive."],
      ["Changes", "We may update these terms as the product changes. Material changes will be reflected here with an updated date."],
    ],
  },
};

function LegalPage({ kind }) {
  const l = LEGAL[kind];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 26px 80px" }}>
      <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 10 }}>{l.updated}</div>
      <h1 style={{ fontFamily: dsp, fontSize: "clamp(28px,4vw,40px)", fontWeight: 700, letterSpacing: -1, margin: "0 0 36px" }}>{l.title}</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {l.sections.map(([h, d]) => (
          <div key={h}>
            <div style={{ fontFamily: dsp, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{h}</div>
            <div style={{ fontSize: 15, color: k.ink2, lineHeight: 1.75 }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 40, padding: "16px 20px", background: k.cream2, borderRadius: 12, fontSize: 12.5, color: k.mid, lineHeight: 1.6 }}>
        This is a plain-language summary, not a substitute for legal advice. Questions about either document — write to hello@tokenhire.app.
      </div>
    </div>
  );
}

function Contact() {
  const [f, setF] = useState({ role: "company", name: "", email: "", org: "", city: "", msg: "" });
  const [sent, setSent] = useState(false);
  const roleCopy = {
    company: { org: "Company name", msgPh: "Tell us about your walk-in drives — roles, volume, cities…" },
    agency: { org: "Agency name", msgPh: "Tell us how many client companies you run drives for…" },
    candidate: { org: "Which company's drive?", msgPh: "What's the issue — a code not working, a status question…" },
    other: { org: "Organization (optional)", msgPh: "What can we help with?" },
  };
  const rc = roleCopy[f.role];
  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "54px 26px 70px" }}>
      <div style={{ fontSize: 15, color: k.coral, fontWeight: 500, marginBottom: 16 }}>Contact</div>
      <h1 style={{ fontFamily: dsp, fontSize: "clamp(32px,4.4vw,48px)", fontWeight: 400, letterSpacing: -1.4, margin: "0 0 36px", lineHeight: 1.1 }}>
        Talk to us about a <b style={{ fontWeight: 800 }}>pilot</b>
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 40 }} className="g2">
        <div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}><Mail size={17} color={k.teal} style={{ marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>Email</div><div style={{ fontSize: 13.5, color: k.mid, fontFamily: typ }}>hello@tokenhire.app</div></div></div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}><Phone size={17} color={k.teal} style={{ marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>Phone</div><div style={{ fontSize: 13.5, color: k.mid, fontFamily: typ }}>+91 90000 00000</div></div></div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><MapPin size={17} color={k.teal} style={{ marginTop: 2 }} /><div><div style={{ fontSize: 13, fontWeight: 600 }}>Based in</div><div style={{ fontSize: 13.5, color: k.mid }}>Hyderabad, India</div></div></div>
        </div>
        <div style={{ ...box, padding: 26 }}>
          {sent ? (
            <div><BadgeCheck size={22} color={k.teal} /><div style={{ fontFamily: dsp, fontSize: 16, fontWeight: 700, margin: "10px 0 5px" }}>Message received</div><div style={{ fontSize: 13.5, color: k.ink2 }}>We'll get back to you shortly.</div></div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (!f.name.trim() || !f.email.trim()) return; setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <Field label="I am a…">
                <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} style={input}>
                  <option value="company">Company looking to hire</option>
                  <option value="agency">Staffing / recruitment agency</option>
                  <option value="candidate">Candidate</option>
                  <option value="other">Something else</option>
                </select>
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={input} /></Field>
                <Field label="Email"><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={input} /></Field>
              </div>
              <Field label={rc.org + (f.role !== "candidate" ? " (optional)" : "")}>
                <input value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} style={input} />
              </Field>
              <Field label="City">
                <CitySelect value={f.city || ""} onChange={(city) => setF({ ...f, city })} allowAll={false} placeholder="Select a city" />
              </Field>
              <Field label="Message"><textarea value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} rows={4} placeholder={rc.msgPh} style={{ ...input, resize: "vertical", fontFamily: bdy }} /></Field>
              <button type="submit" style={{ ...solid, justifyContent: "center", padding: 11, marginTop: 4 }}>Send</button>
              <div style={{ fontSize: 11.5, color: k.faint, lineHeight: 1.5 }}>This form isn't connected to an inbox yet — email us directly meanwhile.</div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function PageEnd() { return null; } // no longer used — nav already carries the primary CTA on every page

/* ================= APP ================= */
function Pick({ go, back, hasProfile, driveCount }) {
  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
      <div style={{ maxWidth: 640, width: "100%" }}>
        <button onClick={back} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 22 }}><ArrowLeft size={14} /> Back to site</button>
        <div style={{ marginBottom: 8 }}><Wordmark size={20} /></div>
        <p style={{ color: k.mid, fontSize: 14, margin: "0 0 26px" }}>One profile for candidates. One live queue for employers.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <button onClick={() => go("candidate")} style={{ ...box, padding: 24, textAlign: "left", cursor: "pointer", fontFamily: bdy, borderLeft: `3px solid ${k.teal}` }}>
            <User size={20} color={k.teal} />
            <div style={{ fontFamily: dsp, fontSize: 17, fontWeight: 700, margin: "12px 0 6px" }}>I'm a candidate</div>
            <div style={{ fontSize: 13.5, color: k.ink2, lineHeight: 1.55 }}>Build your profile once, verify phone, WhatsApp and email, then join a drive by scanning GATE and the live DESK code in the room.</div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: k.teal, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>{hasProfile ? "Open my profile" : "Create my profile"} <ArrowRight size={13} /></div>
          </button>
          <button onClick={() => go("employer")} style={{ ...box, padding: 24, textAlign: "left", cursor: "pointer", fontFamily: bdy, borderLeft: `3px solid ${k.coral}` }}>
            <Building2 size={20} color={k.coral} />
            <div style={{ fontFamily: dsp, fontSize: 17, fontWeight: 700, margin: "12px 0 6px" }}>I'm hiring</div>
            <div style={{ fontSize: 13.5, color: k.ink2, lineHeight: 1.55 }}>Set up a walk-in, run the queue, and get a report at the end of the day.</div>
            <div style={{ marginTop: 12, fontSize: 12.5, color: k.coral, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>{driveCount ? "Open console" : "Set up a walk-in"} <ArrowRight size={13} /></div>
          </button>
        </div>
        <div style={{ marginTop: 18, fontSize: 12, color: k.faint }}>First time here? Open "I'm hiring" — there's already a sample drive in progress to explore.</div>
      </div>
    </div>
  );
}

/* ---- candidate side ---- */
function Candidate({ store, back }) {
  const { profile, setProfile, drives, setDrives, left, orgs } = store;
  const [tab, setTab] = useState("profile");
  const [matched, setMatched] = useState(null);
  const [proven, setProven] = useState(false);
  const [result, setResult] = useState(null);
  const [joinErr, setJoinErr] = useState("");

  function bindDevice(driveId) {
    setProfile((p) => ({ ...p, bound: { ...(p.bound || {}), [driveId]: todayStr() } }));
  }

  function consumePass(driveId) {
    setDrives((prev) => prev.map((x) => {
      if (x.id !== driveId) return x;
      const p = livePass(x);
      return p ? { ...x, gatePass: { ...p, used: true } } : x;
    }));
  }

  function showDupSlip(d, dup) {
    const waiting = d.candidates.filter((x) => x.state === "wait").sort((a, b) => a.at - b.at);
    const posInLine = waiting.findIndex((x) => x.id === dup.id);
    const t = tat(d);
    bindDevice(d.id);
    setMatched(null);
    setProven(false);
    setResult({ dup: true, sameAadhaarDiffPhone: dup.phone !== profile.phone, token: dup.token, drive: d, cand: dup, pos: posInLine >= 0 ? posInLine + 1 : null, eta: posInLine >= 0 ? posInLine * t : null, waitingCount: waiting.length, avgTat: t });
  }

  function handleMatch(drive, via) {
    const live = drives.find((x) => x.id === drive.id) || drive;
    const already = dupOf(live, profile);
    const hostOrg = orgs.find((o) => o.id === live.orgId);
    const cap = planLimits(hostOrg).candidates;
    const full = !already && live.candidates.length >= cap;
    setJoinErr(full ? `This walk-in is full (${cap} candidates on this plan).` : "");
    if (via === "desk" || via === "pass") {
      if (via === "pass") consumePass(live.id);
      if (already) { showDupSlip(live, already); return; }
      setMatched(live);
      setProven(true);
      return;
    }
    if (already && boundToday(profile, live.id)) { showDupSlip(live, already); return; }
    setMatched(live);
    setProven(false);
  }

  function tryProve(codeStr) {
    if (!matched) return "No walk-in selected.";
    const live = drives.find((x) => x.id === matched.id) || matched;
    const raw = (codeStr || "").trim().toUpperCase();
    if (raw.startsWith("HOST") || raw.startsWith("GATE")) {
      return "GATE already found this walk-in. Enter DESK from the TV — that one rotates, so a screenshot of GATE isn't enough.";
    }
    const kind = venueProofOf(live, codeStr);
    if (!kind) return "That isn't this room's live DESK code or a current gate pass. Look at the waiting-room TV (it changes every 45 seconds), or ask the desk to admit you.";
    if (kind === "pass") consumePass(live.id);
    const already = dupOf(live, profile);
    if (already) { showDupSlip(live, already); return ""; }
    setProven(true);
    return "";
  }

  function join(d) {
    if (!proven) return;
    const live = drives.find((x) => x.id === d.id) || d;
    const dup = dupOf(live, profile);
    if (dup) { showDupSlip(live, dup); return; }
    const hostOrg = orgs.find((o) => o.id === live.orgId);
    const cap = planLimits(hostOrg).candidates;
    if (live.candidates.length >= cap) {
      setJoinErr(`This walk-in is full (${cap} candidates on this plan).`);
      return;
    }
    setJoinErr("");
    const seq = live.seq + 1, token = `W-${String(seq).padStart(3, "0")}`;
    const q = live.candidates.filter((x) => x.state === "wait").length;
    const cand = { id: token, token, name: profile.name, phone: profile.phone, whatsapp: profile.whatsapp || profile.phone, email: profile.email, exp: profile.exp, linkedin: profile.linkedin, resume: profile.resume, expBand: profile.expBand || "Fresher", qual: profile.qual || "", room: null, aadhaarHash: profile.aadhaarHash || null, aadhaarLast4: profile.aadhaarLast4 || null, state: "wait", at: Date.now(), pinged: false, calledAt: null, decidedAt: null, roundIdx: 0, roundAssigned: false, notes: {} };
    setDrives((prev) => prev.map((x) => x.id === live.id ? { ...x, seq, candidates: [...x.candidates, cand] } : x));
    profile.applications.push(live.id);
    bindDevice(live.id);
    setMatched(null);
    setProven(false);
    setResult({ dup: false, token, pos: q + 1, eta: q * tat(live), drive: live, cand });
  }

  function resetJoin() { setResult(null); setMatched(null); setProven(false); }

  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink }}>
      <TopBar back={back} title="Your walk-in" accent={k.teal} tabs={profile ? [["profile", "My profile"], ["join", "Join a walk-in"], ["history", "My applications"]] : null} tab={tab} setTab={setTab} />
      <div className="pagepad" style={{ maxWidth: 720, margin: "0 auto", padding: 26 }}>
        {!profile ? <BuildProfile onDone={setProfile} />
          : result ? <Slip r={result} drives={drives} onAgain={resetJoin} />
            : matched ? <ReviewJoin matched={drives.find((x) => x.id === matched.id) || matched} p={profile} setP={setProfile} proven={proven} left={left} onProve={tryProve} onBack={() => { setMatched(null); setProven(false); setJoinErr(""); }} onConfirm={() => join(matched)} joinErr={joinErr} nudges={planLimits(orgs.find((o) => o.id === matched.orgId)).notify !== false} />
              : tab === "profile" ? <MyProfile p={profile} setP={setProfile} />
                : tab === "join" ? <JoinDrive drives={drives} left={left} onMatch={handleMatch} />
                  : <History p={profile} drives={drives} />}
      </div>
    </div>
  );
}

function ReviewJoin({ matched, p, setP, onBack, onConfirm, proven, onProve, left, joinErr, nudges }) {
  const [deskIn, setDeskIn] = useState("");
  const [proveErr, setProveErr] = useState("");
  function uploadResume(e) {
    const file = e.target.files?.[0];
    if (file) setP({ ...p, resume: file.name });
  }
  function submitProof() {
    const err = onProve(deskIn);
    if (err) setProveErr(err);
  }
  return (
    <div style={{ maxWidth: 480 }}>
      <button onClick={onBack} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 18 }}><ArrowLeft size={14} /> Back</button>
      <div style={{ marginBottom: 16 }}><HallBrand name={hallName(matched)} color={orgColor(null, matched)} logo={hallLogo(matched)} sub={clientOf(matched) || null} size={32} /></div>
      <h1 style={{ fontFamily: dsp, fontSize: 21, fontWeight: 700, letterSpacing: -0.4, margin: "0 0 4px" }}>{matched.role}</h1>
      <p style={{ fontSize: 13, color: k.mid, margin: "0 0 16px" }}>{listingPlace(matched)}</p>
      {(matched.jd || (matched.docs || []).length > 0) && (
        <div style={{ ...box, padding: 16, marginBottom: 16 }}>
          <DrivePosting d={matched} flush />
        </div>
      )}

      {joinErr && <div style={{ fontSize: 13.5, color: k.red, margin: "0 0 16px", lineHeight: 1.5 }}>{joinErr}</div>}
      {!proven && !joinErr && (
        <div style={{ ...box, padding: 18, marginBottom: 18, borderLeft: `3px solid ${k.coral}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase", color: k.coral, marginBottom: 8 }}>You're at the right walk-in</div>
          <p style={{ fontSize: 13.5, color: k.ink, lineHeight: 1.55, margin: "0 0 12px" }}>
            GATE finds the walk-in. The rotating DESK code on the TV proves you're in the building. A forwarded GATE QR can't check you in.
          </p>
          <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Enter DESK from the waiting-room TV</div>
          <div style={{ display: "flex", gap: 9 }}>
            <input value={deskIn} onChange={(e) => { setDeskIn(e.target.value.toUpperCase()); setProveErr(""); }} onKeyDown={(e) => e.key === "Enter" && submitProof()} placeholder="DESK-XXXXXX" style={{ ...input, fontFamily: typ, letterSpacing: 2, flex: 1, textTransform: "uppercase" }} maxLength={11} />
            <button onClick={submitProof} style={solidTeal}>Prove I'm here</button>
          </div>
          {proveErr ? <div style={{ fontSize: 12.5, color: k.red, marginTop: 10, lineHeight: 1.5 }}>{proveErr}</div>
            : <div style={{ fontSize: 11.5, color: k.faint, marginTop: 9, lineHeight: 1.5 }}>That code rotates in {left}s. Front desk can also admit you with a one-time PASS.</div>}
        </div>
      )}

      {proven && (
        <>
          <div style={{ ...box, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, background: k.tealDim }}>
            <ShieldCheck size={16} color={k.teal} />
            <div style={{ fontSize: 12.5, color: k.teal, fontWeight: 600 }}>Venue confirmed — you're in the building.</div>
          </div>
          <div style={{ ...box, overflow: "hidden", marginBottom: 18 }}>
            <div style={{ padding: "10px 16px", borderBottom: `2px solid ${k.ink}`, fontFamily: typ, fontSize: 10.5, letterSpacing: 1.2, color: k.ink2 }}>THIS IS WHAT WE'LL SEND</div>
            <DataRow label="Name" value={p.name} />
            <DataRow label="Phone" value={p.phone} mono />
            <DataRow label="Email" value={p.email || "—"} />
            <DataRow label="Experience" value={p.exp || "—"} />
            <DataRow label="LinkedIn" value={p.linkedin || "Not provided"} link={p.linkedin} />
            <DataRow label="Resume" value={p.resume || "Not attached"} tone={p.resume ? "teal" : "gold"}
              action={p.resume ? (
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: k.teal, fontWeight: 600 }}>{p.resume}</span>
                  <label style={{ fontSize: 12, color: k.mid, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
                    Replace<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={uploadResume} />
                  </label>
                </span>
              ) : (
                <label style={{ ...ghostSm, cursor: "pointer" }}>
                  Attach<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={uploadResume} />
                </label>
              )} last />
          </div>
          {joinErr && <div style={{ fontSize: 13, color: k.red, margin: "0 0 10px", textAlign: "center" }}>{joinErr}</div>}
          <button onClick={onConfirm} disabled={!!joinErr} style={{ ...solidTeal, width: "100%", justifyContent: "center", padding: 12, fontSize: 14, opacity: joinErr ? 0.5 : 1 }}>{joinErr ? "Walk-in is full" : <>Confirm & join queue <ArrowRight size={15} /></>}</button>
          {nudges !== false && <div style={{ fontSize: 11.5, color: k.faint, marginTop: 10, textAlign: "center" }}>Check-in does not send a message. You'll get one WhatsApp ~15 minutes before your turn.</div>}
        </>
      )}
    </div>
  );
}

function OtpChannel({ icon: I, title, dest, code, verified, onVerified }) {
  const [sent, setSent] = useState(false);
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  if (verified) {
    return (
      <div style={{ ...box, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <I size={18} color={k.teal} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 12, color: k.mid, fontFamily: typ, marginTop: 2 }}>{dest}</div>
        </div>
        <Pill tone="teal">Verified</Pill>
      </div>
    );
  }
  return (
    <div style={{ ...box, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: sent ? 12 : 0 }}>
        <I size={18} color={k.coral} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 12, color: k.mid, marginTop: 2 }}>{dest}</div>
        </div>
        {!sent && <button type="button" onClick={() => { setSent(true); setErr(""); }} style={ghostSm}>Send OTP</button>}
      </div>
      {sent && (
        <>
          <div style={{ fontSize: 12, color: k.ink2, lineHeight: 1.5, marginBottom: 8 }}>
            Code sent. In this demo, enter <b style={{ fontFamily: typ }}>{code}</b>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={val} onChange={(e) => { setVal(e.target.value.replace(/\D/g, "").slice(0, 6)); setErr(""); }} placeholder="6-digit OTP" inputMode="numeric" style={{ ...input, fontFamily: typ, letterSpacing: 3, flex: 1 }} />
            <button type="button" onClick={() => { if (val === code) onVerified(); else setErr("That code doesn't match."); }} style={solidTeal}>Verify</button>
          </div>
          {err && <div style={{ fontSize: 12, color: k.red, marginTop: 8 }}>{err}</div>}
        </>
      )}
    </div>
  );
}

function BuildProfile({ onDone }) {
  const [step, setStep] = useState("details");
  const [f, setF] = useState({ name: "", phone: "", email: "", whatsapp: "", exp: "", expBand: "", linkedin: "", aadhaar: "", qual: "", consent: false });
  const [ok, setOk] = useState({ sms: false, wa: false, email: false });
  const [busy, setBusy] = useState(false);
  const fillSample = () => onDone({
    name: "Ananya Rao", phone: "9959001122", email: "ananya.rao@gmail.com", whatsapp: "9959001122",
    exp: "1–3 yrs", expBand: "1–3 yrs", linkedin: "https://linkedin.com/in/ananyarao", qual: "Graduate", consent: true,
    verified: { phone: true, whatsapp: true, email: true },
    aadhaarHash: null, aadhaarLast4: null, id: `c_${Date.now()}`, resume: null, applications: [], bound: {},
  });

  function goVerify(e) {
    e.preventDefault();
    if (!f.name.trim() || f.phone.trim().length !== 10) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return;
    setF((p) => ({ ...p, whatsapp: p.whatsapp || p.phone }));
    setStep("verify");
  }

  async function submit(e) {
    e.preventDefault();
    if (!f.consent) return;
    if (f.aadhaar && f.aadhaar.length !== 12) return;
    setBusy(true);
    const aadhaarHash = f.aadhaar ? await hashAadhaar(f.aadhaar) : null;
    const aadhaarLast4 = f.aadhaar ? f.aadhaar.slice(-4) : null;
    const { aadhaar, ...rest } = f;
    onDone({
      ...rest, whatsapp: rest.whatsapp || rest.phone, aadhaarHash, aadhaarLast4,
      verified: { phone: true, whatsapp: true, email: true },
      id: `c_${Date.now()}`, resume: null, applications: [], bound: {},
    });
  }

  const allVerified = ok.sms && ok.wa && ok.email;

  return (
    <div style={{ maxWidth: 460 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 24, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 5px" }}>Create your profile</h1>
      <p style={{ fontSize: 14, color: k.mid, margin: "0 0 18px", lineHeight: 1.55 }}>
        {step === "details" && "First we confirm it's you — phone, WhatsApp, and email. Then you fill the rest once."}
        {step === "verify" && "Three one-time codes. After this, every walk-in is scan GATE, prove you're in the room, and confirm."}
        {step === "about" && "Experience and documents. Recruiters see this at the desk."}
      </p>
      <button type="button" onClick={fillSample} style={{ ...ghostSm, marginBottom: 16 }}>Fill sample data — skip OTP, just to look around</button>

      {step === "details" && (
        <form onSubmit={goVerify} style={{ ...box, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Full name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={input} required /></Field>
          <Field label="Mobile number">
            <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} style={input} placeholder="10 digits" inputMode="numeric" required />
          </Field>
          <Field label="WhatsApp number (if different)">
            <input value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) })} style={input} placeholder="Same as mobile unless you change it" inputMode="numeric" />
          </Field>
          <Field label="Email"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} style={input} required /></Field>
          <button type="submit" style={{ ...solidTeal, justifyContent: "center", padding: 12, fontSize: 14.5, marginTop: 4 }}>Send verification codes <ArrowRight size={15} /></button>
        </form>
      )}

      {step === "verify" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <OtpChannel key={`sms-${f.phone}`} icon={Phone} title="SMS to your phone" dest={f.phone} code={DEMO_OTP.sms} verified={ok.sms} onVerified={() => setOk({ ...ok, sms: true })} />
          <OtpChannel key={`wa-${f.whatsapp || f.phone}`} icon={MessageCircle} title="WhatsApp OTP" dest={f.whatsapp || f.phone} code={DEMO_OTP.wa} verified={ok.wa} onVerified={() => setOk({ ...ok, wa: true })} />
          <OtpChannel key={`em-${f.email}`} icon={Mail} title="Email OTP" dest={f.email} code={DEMO_OTP.email} verified={ok.email} onVerified={() => setOk({ ...ok, email: true })} />
          <button type="button" disabled={!allVerified} onClick={() => setStep("about")} style={{ ...solidTeal, justifyContent: "center", padding: 12, fontSize: 14.5, marginTop: 6, opacity: allVerified ? 1 : .45 }}>
            Continue {allVerified ? "" : "— verify all three first"}
          </button>
          <button type="button" onClick={() => { setStep("details"); setOk({ sms: false, wa: false, email: false }); }} style={{ ...ghostSm, alignSelf: "flex-start" }}>Change number or email</button>
        </div>
      )}

      {step === "about" && (
        <form onSubmit={submit} style={{ ...box, padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Aadhaar number (optional)">
            <input
              value={f.aadhaar}
              onChange={(e) => setF({ ...f, aadhaar: e.target.value.replace(/\D/g, "").slice(0, 12) })}
              style={{ ...input, fontFamily: typ, letterSpacing: 1.5 }}
              placeholder="12 digits"
              inputMode="numeric"
            />
            <div style={{ fontSize: 11.5, color: k.faint, marginTop: 6, lineHeight: 1.5 }}>
              Only used to stop the same person re-registering to a drive under a different phone. We never store the number — only an irreversible one-way hash of it, plus the last 4 digits for your own reference.
            </div>
          </Field>
          <Field label="Experience">
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {EXP_BANDS.map((b) => (
                <button type="button" key={b} onClick={() => setF({ ...f, expBand: b, exp: b })} style={{
                  padding: "8px 14px", borderRadius: R.pill, cursor: "pointer", fontFamily: bdy, fontSize: 13,
                  border: `1.5px solid ${f.expBand === b ? k.coral : k.line}`,
                  background: f.expBand === b ? k.coralDim : "#fff", color: f.expBand === b ? k.coral : k.ink2, fontWeight: f.expBand === b ? 600 : 500,
                }}>{b}</button>
              ))}
            </div>
          </Field>
          <Field label="Highest qualification">
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {QUALIFICATIONS.map((q) => (
                <button type="button" key={q} onClick={() => setF({ ...f, qual: q })} style={{
                  padding: "8px 14px", borderRadius: R.pill, cursor: "pointer", fontFamily: bdy, fontSize: 13,
                  border: `1.5px solid ${f.qual === q ? k.coral : k.line}`,
                  background: f.qual === q ? k.coralDim : "#fff", color: f.qual === q ? k.coral : k.ink2, fontWeight: f.qual === q ? 600 : 500,
                }}>{q}</button>
              ))}
            </div>
          </Field>
          <Field label="LinkedIn (optional)"><input value={f.linkedin} onChange={(e) => setF({ ...f, linkedin: e.target.value })} style={input} /></Field>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", padding: "12px 14px", background: k.cream2, borderRadius: 10 }}>
            <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} style={{ marginTop: 2, width: 16, height: 16, accentColor: k.coral, cursor: "pointer" }} />
            <span style={{ fontSize: 12.5, color: k.ink2, lineHeight: 1.55 }}>I agree to share these details with the company running this walk-in, and to receive one WhatsApp message about 15 minutes before my turn. No other texts.</span>
          </label>
          <button type="submit" disabled={busy || !f.consent} style={{ ...solidTeal, justifyContent: "center", padding: 12, fontSize: 14.5, marginTop: 4, opacity: busy || !f.consent ? .7 : 1 }}>{busy ? "Securing your details…" : "Create profile"}</button>
        </form>
      )}
    </div>
  );
}

function MyProfile({ p, setP }) {
  const done = [p.resume].filter(Boolean).length;
  const v = p.verified || {};
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div><h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 3px" }}>{p.name}</h1><div style={{ fontSize: 13, color: k.mid, fontFamily: typ }}>{p.phone}{p.email ? ` · ${p.email}` : ""}</div></div>
        <Pill tone={done === 1 ? "teal" : "gold"}>{done}/1 COMPLETE</Pill>
      </div>
      <SectionLabel>Verified contacts</SectionLabel>
      <div style={{ ...box, overflow: "hidden", marginBottom: 24 }}>
        {[
          ["Phone (SMS)", p.phone, v.phone],
          ["WhatsApp", p.whatsapp || p.phone, v.whatsapp],
          ["Email", p.email, v.email],
        ].map(([label, dest, yes], i, arr) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${k.line}` }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 12, color: k.mid, fontFamily: typ, marginTop: 2 }}>{dest || "—"}</div>
            </div>
            <Pill tone={yes ? "teal" : "gold"}>{yes ? "Verified" : "Needed"}</Pill>
          </div>
        ))}
      </div>
      <SectionLabel>Documents</SectionLabel>
      <div style={{ ...box, overflow: "hidden", marginBottom: 24 }}>
        <DocRow icon={FileText} title="Resume" sub={p.resume ? p.resume : "Recruiters download this instead of you carrying printouts"} done={!!p.resume} last
          action={p.resume ? <label style={ghostSm}>Replace<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && setP({ ...p, resume: e.target.files[0].name })} /></label>
            : <label style={{ ...solidTeal, padding: "7px 13px", fontSize: 12.5, cursor: "pointer" }}>Upload<input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && setP({ ...p, resume: e.target.files[0].name })} /></label>} />
      </div>
      <div style={{ ...box, padding: 16, borderLeft: `3px solid ${k.teal}`, fontSize: 13, color: k.ink2, lineHeight: 1.6 }}>
        {p.aadhaarLast4
          ? <>Aadhaar on file: <b style={{ fontFamily: typ }}>XXXX XXXX {p.aadhaarLast4}</b> — only a one-way hash and these last 4 digits are stored, never the full number.</>
          : "No Aadhaar on file. It's optional — only used to stop the same person re-registering to a drive under a different phone number."}
      </div>
    </div>
  );
}

function DataRow({ label, value, mono, link, tone, last, action }) {
  const toneColor = tone === "teal" ? k.teal : tone === "gold" ? k.gold : k.ink;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: last ? "none" : `1px solid ${k.line}`, gap: 12 }}>
      <span style={{ fontSize: 12.5, color: k.mid, flexShrink: 0 }}>{label}</span>
      {action ? action : link ? (
        <a href={link} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: k.teal, textDecoration: "none", fontWeight: 600 }}>View profile</a>
      ) : (
        <span style={{ fontSize: 13, color: toneColor, fontWeight: 600, fontFamily: mono ? typ : bdy, textAlign: "right" }}>{value}</span>
      )}
    </div>
  );
}

function DocRow({ icon: I, title, sub, done, action, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderBottom: last ? "none" : `1px solid ${k.line}` }}>
      <I size={18} color={done ? k.teal : k.faint} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}>{title}{done && <BadgeCheck size={14} color={k.teal} />}</div>
        <div style={{ fontSize: 12.5, color: done ? k.teal : k.mid, marginTop: 2 }}>{sub}</div>
      </div>
      {action}
    </div>
  );
}

function JoinDrive({ drives, left, onMatch }) {
  const [entered, setEntered] = useState("");
  const [err, setErr] = useState("");
  const [scan, setScan] = useState("idle"); // idle | starting | scanning | unsupported
  const videoRef = useRef(null);
  const scanningRef = useRef(false);

  function resolve(codeStr) {
    setErr("");
    const raw = codeStr.trim().toUpperCase();
    if (raw.startsWith("HOST")) {
      setErr("That's a staff HOST code — it's for recruiters opening the drive on another laptop, not for check-in. Scan the GATE QR at security instead.");
      return;
    }
    const kind = raw.startsWith("PASS") ? "pass" : raw.startsWith("DESK") ? "desk" : raw.startsWith("GATE") ? "gate" : null;
    const v = bare6(raw);
    const live = drives.filter((d) => d.status === "live");
    const byGate = live.find((d) => bare6(d.gate) === v);
    const byDesk = live.find((d) => liveDesk(d) === v);
    const byPass = live.find((d) => livePass(d)?.code === v);

    if (kind === "desk") {
      if (v.length < 6) { setErr("Enter the full DESK-XXXXXX from the waiting-room TV. It changes every 45 seconds."); return; }
      if (!byDesk) { setErr("That DESK code isn't on a live TV right now. DESK codes change every 45 seconds — look at the waiting-room screen."); return; }
      onMatch(byDesk, "desk");
      return;
    }
    if (kind === "pass") {
      if (!byPass) { setErr("That gate pass isn't live. Ask the desk to issue a new one — they expire in a couple of minutes and work once."); return; }
      onMatch(byPass, "pass");
      return;
    }
    if (kind === "gate") {
      if (v.length < 6) { setErr("Enter the full GATE-XXXXXX from the printed poster."); return; }
      if (byGate) { onMatch(byGate, "gate"); return; }
      const later = drives.find((d) => d.status === "upcoming" && bare6(d.gate) === v);
      if (later) { setErr("This walk-in is listed but isn't accepting check-ins yet. Ask the desk to open it."); return; }
      setErr("No live walk-in matches that GATE code. Check you're at the right venue.");
      return;
    }
    if (v.length <= 4 && byPass) { onMatch(byPass, "pass"); return; }
    if (v.length < 6) { setErr("Enter GATE-XXXXXX from the poster, DESK-XXXXXX from the TV, or a one-time PASS from the desk."); return; }
    if (byGate) { onMatch(byGate, "gate"); return; }
    if (byDesk) { onMatch(byDesk, "desk"); return; }
    const later = drives.find((d) => d.status === "upcoming" && bare6(d.gate) === v);
    if (later) { setErr("This walk-in is listed but isn't accepting check-ins yet. Ask the desk to open it."); return; }
    setErr("No live walk-in matches that code. GATE finds the drive; DESK on the TV is what checks you in.");
  }

  async function startScan() {
    setErr("");
    setScan("starting");
    try {
      if (!("BarcodeDetector" in window)) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      scanningRef.current = true;
      setScan("scanning");
      const tick = async () => {
        if (!scanningRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length) {
            const raw = codes[0].rawValue;
            const g = new URL(raw).searchParams.get("g") || new URL(raw).searchParams.get("c");
            if (g) { stopScan(); setEntered(`GATE-${g.toUpperCase()}`); resolve(`GATE-${g}`); return; }
          }
        } catch { /* keep trying */ }
        requestAnimationFrame(tick);
      };
      tick();
    } catch {
      setScan("unsupported");
    }
  }
  function stopScan() {
    scanningRef.current = false;
    const stream = videoRef.current?.srcObject;
    stream?.getTracks?.().forEach((t) => t.stop());
    setScan("idle");
  }
  useEffect(() => () => stopScan(), []);

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 5px" }}>Join a walk-in</h1>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 20px", lineHeight: 1.55 }}>Scan the GATE poster to find the drive. Then enter the DESK code from the waiting-room TV so a forwarded poster can’t check someone else in.</p>

      <div style={{ ...box, padding: 20, marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 9 }}>Scan the printed GATE poster</div>
        <div style={{ position: "relative", borderRadius: 6, overflow: "hidden", background: scan === "scanning" ? "#000" : "transparent", display: scan === "scanning" ? "block" : "none" }}>
          <video ref={videoRef} muted playsInline style={{ width: "100%", display: "block", maxHeight: 260, objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 28, border: `2px solid ${k.teal}`, borderRadius: 8, pointerEvents: "none" }} />
        </div>
        {scan === "scanning" ? (
          <button onClick={stopScan} style={{ ...ghostSm, marginTop: 10 }}>Stop scanning</button>
        ) : (
          <>
            <button onClick={startScan} style={{ ...solidTeal, width: "100%", justifyContent: "center", padding: 11 }}>
              {scan === "starting" ? "Opening camera…" : "Open camera to scan"}
            </button>
            {scan === "unsupported" && <div style={{ fontSize: 12, color: k.gold, marginTop: 9, lineHeight: 1.5 }}>Camera scanning isn't available on this device/browser — enter the code below instead.</div>}
          </>
        )}
      </div>

      <div style={{ ...box, padding: 20 }}>
        <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 9 }}>Or type GATE-XXXXXX, DESK-XXXXXX, or a desk PASS</div>
        <div style={{ display: "flex", gap: 9 }}>
          <input value={entered} onChange={(e) => { setEntered(e.target.value.toUpperCase()); setErr(""); }} onKeyDown={(e) => e.key === "Enter" && resolve(entered)} placeholder="GATE-XXXXXX" style={{ ...input, fontFamily: typ, letterSpacing: 2, flex: 1, textTransform: "uppercase" }} maxLength={11} />
          <button onClick={() => resolve(entered)} style={solidTeal}>Find</button>
        </div>
        {err ? <div style={{ fontSize: 12.5, color: k.red, marginTop: 10, lineHeight: 1.5 }}>{err}</div> : <div style={{ fontSize: 11.5, color: k.faint, marginTop: 9, lineHeight: 1.5 }}>A GATE code only identifies the drive. Typing DESK from the TV (rotates in {left}s) is what checks you in.</div>}
      </div>
    </div>
  );
}

const QUEUE_STATE_COPY = {
  calling: "You're being called right now — head to the desk.",
  interviewing: "You're in with a recruiter right now.",
  selected: "You've been selected to move forward. HR will contact you — offers aren't made at the walk-in.",
  rejected: "This round didn't go through. Thanks for coming in.",
  onhold: "You're on hold after this round. We'll be in touch.",
  absent: "You were marked absent when called. Speak to the desk if that's wrong.",
};
function QueueStatusPill({ state }) {
  const map = {
    wait: [k.mid, "Waiting"], calling: [k.coral, "Being called now"], interviewing: [k.coral, "In interview"],
    selected: [k.teal, "Selected"], rejected: [k.red, "Not selected"], onhold: [k.gold, "On hold"],
    absent: [k.mid, "Marked absent"],
  };
  const [color, label] = map[state] || [k.mid, "Checked in"];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />{label}</span>;
}

function Slip({ r, onAgain, drives }) {
  const live = (drives || []).find((d) => d.id === r.drive.id);
  const rounds = live?.rounds || r.drive.rounds || DEFAULT_ROUNDS;
  const cand = (live?.candidates || []).find((c) => c.token === r.token || c.id === r.token) || r.cand || { state: "wait", roundIdx: 0 };
  const isDup = r.dup;
  const waiting = (live?.candidates || r.drive.candidates || []).filter((x) => x.state === "wait").sort((a, b) => a.at - b.at);
  const pos = cand.state === "wait" ? waiting.findIndex((x) => x.id === cand.id) + 1 : r.pos;
  const eta = cand.state === "wait" && pos > 0 ? (pos - 1) * (live ? tat(live) : r.avgTat || 8) : r.eta;
  return (
    <div style={{ maxWidth: 440 }}>
      <div style={{ border: `1px solid ${k.line}`, borderRadius: 14, overflow: "hidden", background: "#fff", boxShadow: "0 14px 34px -24px rgba(27,24,21,.35)" }}>
        <div style={{ background: isDup ? k.gold : k.ink, color: "#fff", padding: "9px 18px", fontFamily: typ, fontSize: 11, letterSpacing: 1.4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{isDup ? "ALREADY CHECKED IN" : "ADMISSION SLIP"}</span>
          <span style={{ fontSize: 9.5, opacity: .75, letterSpacing: .5 }}>{hallChrome(r.drive)}</span>
        </div>
        <div style={{ padding: "24px 22px 22px" }}>
          {isDup && r.sameAadhaarDiffPhone && (
            <div style={{ background: k.goldDim, borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: k.gold, marginBottom: 16, lineHeight: 1.5 }}>
              This matches an Aadhaar number already checked in to this drive under a different phone number. Showing that existing check-in below.
            </div>
          )}
          <div style={{ fontSize: 12, color: k.mid }}>{hallChrome(r.drive)} · {r.drive.role}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "14px 0 20px" }}>
            <TokenTile token={r.token} size={64} />
            <div style={{ minWidth: 0 }}>
              {cand.name && <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>{cand.name}</div>}
              <div style={{ fontSize: 12, color: k.mid, marginTop: cand.name ? 3 : 0 }}>Walk-in number {r.token}</div>
            </div>
          </div>

          {cand.state === "wait" ? (
            <div style={{ textAlign: "center", background: k.coralDim, borderRadius: 14, padding: "22px 16px", marginBottom: 22 }}>
              <div style={{ fontFamily: dsp, fontSize: 46, fontWeight: 800, color: k.coral, letterSpacing: -1.5, lineHeight: 1 }}>{Math.max(0, (pos || 1) - 1)}</div>
              <div style={{ fontSize: 13.5, color: k.ink2, fontWeight: 600, marginTop: 4 }}>
                {(pos || 1) - 1 === 0 ? "You're next" : `people ahead of you`}
              </div>
              <div style={{ fontSize: 12, color: k.mid, marginTop: 6 }}>~{eta ?? r.eta} min estimated · updates as the queue moves</div>
              {inARound(cand) && <div style={{ fontSize: 12, fontWeight: 700, color: k.coral, marginTop: 8 }}>{roundLabel(rounds, cand)}</div>}
            </div>
          ) : (
            <div style={{ marginBottom: 22 }}>
              <QueueStatusPill state={cand.state} />
              <div style={{ fontSize: 13, color: k.ink2, marginTop: 10, lineHeight: 1.6 }}>{QUEUE_STATE_COPY[cand.state] || "Check back on the desk screen for the latest."}</div>
              {["calling", "interviewing"].includes(cand.state) && (
                <div style={{ fontSize: 12.5, fontWeight: 700, color: k.coral, marginTop: 8 }}>{roundLabel(rounds, cand)}</div>
              )}
              {cand.room && ["calling", "interviewing"].includes(cand.state) && (
                <div style={{ background: k.coralDim, borderRadius: 12, padding: "14px 16px", marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: k.coral, letterSpacing: .7, textTransform: "uppercase", marginBottom: 5 }}>Go to</div>
                  <div style={{ fontFamily: dsp, fontSize: 22, fontWeight: 800, color: k.ink }}>{cand.room.name}</div>
                  <div style={{ fontSize: 13, color: k.ink2, marginTop: 2 }}>Interviewer: {cand.room.interviewer}</div>
                </div>
              )}
            </div>
          )}

          <RoundTracker rounds={rounds} cand={cand} />

          <div style={{ fontSize: 11.5, color: k.faint, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${k.line}`, lineHeight: 1.5 }}>
            {isDup
              ? `Drive average right now: ~${live ? tat(live) : r.avgTat} min per candidate · ${waiting.length} still waiting.`
              : "You can step away. We'll WhatsApp you about 15 minutes before your turn — nothing else."}
          </div>
        </div>
      </div>
      <button onClick={onAgain} style={{ ...ghostSm, marginTop: 16 }}>Back</button>
    </div>
  );
}

function RoundTracker({ rounds, cand, roundIdx, state }) {
  const c = cand || { roundIdx: roundIdx || 0, state: state || "wait" };
  const stages = ["Checked in", ...rounds.map((r) => r.name), "Decision"];
  const terminal = isTerminal(c.state);
  const current = trackerCurrent(rounds, c);
  return (
    <div>
      <div style={{ position: "relative", height: 4, background: k.cream2, borderRadius: 2, margin: "0 8px 12px" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(current / (stages.length - 1)) * 100}%`, background: k.coral, borderRadius: 2, transition: "width .5s ease" }} />
        {stages.map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: `${(i / (stages.length - 1)) * 100}%`, transform: "translate(-50%,-50%)",
            width: i === current ? 15 : 9, height: i === current ? 15 : 9, borderRadius: "50%",
            background: i <= current ? k.coral : "#fff", border: `2px solid ${i <= current ? k.coral : k.line}`,
            transition: "all .4s ease", boxShadow: i === current && !terminal ? `0 0 0 5px ${k.coralDim}` : "none",
            animation: i === current && !terminal ? "blink 1.8s infinite" : "none",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
        {stages.map((s, i) => (
          <div key={i} style={{
            fontSize: 10, textAlign: i === 0 ? "left" : i === stages.length - 1 ? "right" : "center", flex: 1,
            color: i === current ? k.coral : i < current ? k.ink2 : k.faint, fontWeight: i === current ? 700 : 500,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{s}</div>
        ))}
      </div>
    </div>
  );
}

function History({ p, drives }) {
  const mine = drives.flatMap((d) => d.candidates.filter((c) => c.phone === p.phone).map((c) => ({ ...c, drive: d })));
  const label = { wait: ["grey", "Waiting"], calling: ["teal", "Being called"], interviewing: ["teal", "In interview"], selected: ["teal", "Selected"], rejected: ["red", "Rejected"], onhold: ["gold", "On hold"], absent: ["grey", "Missed turn"] };
  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: "0 0 18px" }}>My applications</h1>
      {!mine.length ? <Blank text="You haven't joined a drive yet." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mine.map((c) => (
            <div key={c.drive.id + c.token} style={{ ...box, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{c.drive.role}</div>
                <div style={{ marginTop: 8 }}><TokenChip token={c.token} name={listingHost(c.drive)} size={28} muted /></div>
              </div>
              <Pill tone={label[c.state]?.[0]}>{label[c.state]?.[1]}</Pill>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- employer side ---- */
const TABS = [["today", "Today", LayoutGrid], ["live", "Live queue", ListChecks], ["screen", "Waiting screen", MonitorSmartphone], ["queue", "All candidates", Users2], ["rounds", "Rounds", Building2], ["rooms", "Rooms", Building], ["branding", "Branding", ShieldCheck], ["msgs", "Messages", Send], ["result", "Reports", PieChart]];
const DESK_TABS = [["live", "Live queue", ListChecks], ["screen", "Waiting screen", MonitorSmartphone]];
function staffTabs(org) {
  const lim = planLimits(org);
  return TABS.filter(([id]) => {
    if (id === "result" && lim.reports === false) return false;
    if (id === "rooms" && lim.rooms === false) return false;
    if (id === "msgs" && lim.notify === false) return false;
    return true;
  });
}
const PRIMARY_TAB_IDS = new Set(["today", "live", "queue", "screen"]);

function AppTabs({ tabs, tab, setTab, accent, msgCount, layout }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = tabs.filter(([id]) => PRIMARY_TAB_IDS.has(id));
  const extra = tabs.filter(([id]) => !PRIMARY_TAB_IDS.has(id));
  const extraOn = extra.some(([id]) => id === tab);
  function pick(id) { setTab(id); setMoreOpen(false); }
  const short = (lab) => (lab === "Live queue" ? "Live" : lab === "Waiting screen" ? "TV" : lab === "All candidates" ? "Queue" : lab);

  if (layout === "side") {
    return (
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px 16px" }}>
        {tabs.map(([tid, lab, I]) => {
          const on = tab === tid;
          return (
            <button key={tid} type="button" onClick={() => pick(tid)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
              border: "none", borderRadius: 10, cursor: "pointer", textAlign: "left",
              background: on ? `${accent}18` : "transparent", color: on ? accent : k.ink2,
              fontWeight: on ? 700 : 500, fontSize: 13.5, fontFamily: bdy,
            }}>
              <I size={16} />
              <span style={{ flex: 1 }}>{lab}</span>
              {tid === "msgs" && msgCount > 0 && <Pill tone="grey">{msgCount}</Pill>}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      {moreOpen && extra.length > 0 && (
        <div onClick={() => setMoreOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,.4)", zIndex: 90, display: "flex", alignItems: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", borderRadius: "18px 18px 0 0", padding: "10px 12px calc(16px + env(safe-area-inset-bottom))" }}>
            <div style={{ width: 36, height: 4, borderRadius: 4, background: k.line, margin: "4px auto 14px" }} />
            {extra.map(([tid, lab, I]) => (
              <button key={tid} type="button" onClick={() => pick(tid)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 12px", border: "none", background: tab === tid ? k.cream2 : "none", borderRadius: 12, fontFamily: bdy, fontSize: 16, fontWeight: 600, color: k.ink, cursor: "pointer" }}>
                <I size={18} color={accent} /> {lab}{tid === "msgs" && msgCount > 0 ? ` (${msgCount})` : ""}
              </button>
            ))}
          </div>
        </div>
      )}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 80, background: "#fff",
        borderTop: `1px solid ${k.line}`, padding: "4px 4px calc(6px + env(safe-area-inset-bottom))",
        display: "flex", justifyContent: "space-around", alignItems: "stretch",
      }}>
        {(primary.length ? primary : tabs).map(([tid, lab, I]) => {
          const on = tab === tid;
          return (
            <button key={tid} type="button" onClick={() => pick(tid)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 4, padding: "8px 4px 6px", minHeight: 56, border: "none", background: "none", cursor: "pointer", flex: 1,
              fontSize: 10.5, fontWeight: on ? 700 : 500, color: on ? accent : k.mid, fontFamily: bdy,
            }}>
              <I size={20} />{short(lab)}
            </button>
          );
        })}
        {extra.length > 0 && (
          <button type="button" onClick={() => setMoreOpen(true)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
            padding: "8px 4px 6px", minHeight: 56, border: "none", background: "none", cursor: "pointer", flex: 1,
            fontSize: 10.5, fontWeight: extraOn ? 700 : 500, color: extraOn ? accent : k.mid, fontFamily: bdy,
          }}>
            <MoreHorizontal size={20} /> More
          </button>
        )}
      </nav>
    </>
  );
}

function Employer({ store, back }) {
  const { drives, setDrives, left, beat, orgs, setOrgs, activeOrgId, setActiveOrgId, staffRole, setStaffRole } = store;
  const phone = useNarrow();
  const desk = staffRole === "frontdesk";
  const tabs = desk ? DESK_TABS : staffTabs(orgs.find((o) => o.id === activeOrgId) || orgs[0]);
  const [id, setId] = useState(null);
  const [tab, setTab] = useState(desk ? "live" : "today");
  useEffect(() => {
    const ids = tabs.map(([tid]) => tid);
    if (ids.length && !ids.includes(tab)) setTab(ids[0]);
  }, [desk, activeOrgId, tab]);
  const drive = drives.find((d) => d.id === id && (!activeOrgId || d.orgId === activeOrgId));
  const upd = useCallback((did, fn) => setDrives((p) => p.map((d) => (d.id === did ? fn(d) : d))), [setDrives]);
  const say = useCallback((did, ch, to, name, text) => upd(did, (d) => ({ ...d, msgs: [{ id: Math.random(), at: Date.now(), ch, to, name, text }, ...d.msgs] })), [upd]);

  // Call a specific candidate into a specific room — the recruiter's core action
  function callTo(cid, roomId) {
    if (!drive) return;
    const cand = drive.candidates.find((x) => x.id === cid);
    const room = (drive.rooms || []).find((r) => r.id === roomId);
    if (!cand) return;
    const startFirst = !inARound(cand);
    upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === cid ? {
      ...x,
      state: "calling",
      calledAt: Date.now(),
      room: room || null,
      roundAssigned: true,
      roundIdx: startFirst ? 0 : (x.roundIdx || 0),
    } : x)) }));
  }

  // Send someone to the back of the line without losing them (they stepped out, missed the call)
  function skip(cid) {
    if (!drive) return;
    upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === cid ? { ...x, state: "wait", at: Date.now(), calledAt: null, room: null, skipped: (x.skipped || 0) + 1 } : x)) }));
  }

  // Bring a skipped/absent candidate back to the front
  function recall(cid) {
    if (!drive) return;
    const wait = drive.candidates.filter((x) => x.state === "wait");
    const earliest = wait.length ? Math.min(...wait.map((x) => x.at)) : Date.now();
    upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === cid ? { ...x, state: "wait", at: earliest - 1000 } : x)) }));
  }

  function move(cid, state) {
    if (!drive) return;
    upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => {
      if (x.id !== cid) return x;
      const next = { ...x, state };
      if (state === "calling" && !x.calledAt) next.calledAt = Date.now();
      if (state === "calling" || state === "interviewing") {
        next.roundAssigned = true;
        if (!inARound(x)) next.roundIdx = 0;
      }
      if (state === "wait" || state === "absent") { next.room = null; next.calledAt = state === "wait" ? null : x.calledAt; }
      return next;
    }) }));
  }

  function decide(cid, outcome) {
    if (!drive) return;
    const c = drive.candidates.find((x) => x.id === cid);
    if (!c) return;
    const rid = drive.rounds[c.roundIdx]?.id;
    const last = c.roundIdx >= drive.rounds.length - 1;
    upd(drive.id, (d) => ({
      ...d,
      candidates: d.candidates.map((x) => {
        if (x.id !== cid) return x;
        const roundOutcomes = { ...(x.roundOutcomes || {}), [rid]: outcome };
        if (outcome === "rejected") return { ...x, state: "rejected", decidedAt: Date.now(), roundOutcomes, room: null };
        if (outcome === "onhold") return { ...x, state: "onhold", decidedAt: Date.now(), roundOutcomes, room: null };
        if (last) return { ...x, state: "selected", decidedAt: Date.now(), roundOutcomes, room: null };
        return { ...x, roundIdx: x.roundIdx + 1, state: "wait", calledAt: null, at: Date.now(), pinged: false, roundOutcomes, decidedAt: Date.now(), room: null, roundAssigned: true };
      }),
    }));
  }

  function sendToRound(cid, roundIdx) {
    if (!drive) return;
    const idx = Number(roundIdx);
    if (!Number.isInteger(idx) || idx < 0 || idx >= (drive.rounds || []).length) return;
    upd(drive.id, (d) => ({
      ...d,
      candidates: d.candidates.map((x) => {
        if (x.id !== cid) return x;
        const roundOutcomes = { ...(x.roundOutcomes || {}) };
        if (idx > x.roundIdx) {
          for (let i = x.roundIdx; i < idx; i++) {
            const rid = d.rounds[i]?.id;
            if (rid && !roundOutcomes[rid]) roundOutcomes[rid] = "selected";
          }
        }
        const wasInRoom = ["calling", "interviewing"].includes(x.state);
        return {
          ...x,
          roundIdx: idx,
          roundAssigned: true,
          roundOutcomes,
          state: isTerminal(x.state) || wasInRoom ? "wait" : x.state,
          calledAt: wasInRoom ? null : x.calledAt,
          room: null,
          at: wasInRoom || x.state !== "wait" ? Date.now() : x.at,
          pinged: false,
        };
      }),
    }));
  }

  function advance(cid) { decide(cid, "selected"); }

  function saveNote(cid, roundId, text) {
    if (!drive) return;
    upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => (x.id === cid ? { ...x, notes: { ...x.notes, [roundId]: text } } : x)) }));
  }

  function setRounds(rounds) {
    if (!drive) return;
    upd(drive.id, (d) => ({ ...d, rounds }));
  }

  function setRooms(rooms) {
    if (!drive) return;
    upd(drive.id, (d) => ({
      ...d,
      rooms,
      candidates: d.candidates.map((c) => {
        if (!c.room) return c;
        const next = rooms.find((r) => r.id === c.room.id);
        return next ? { ...c, room: next } : c;
      }),
    }));
  }

  function setBrand(brand) {
    if (!drive || !org) return;
    setDrives((p) => p.map((d) => (d.orgId === org.id ? { ...d, brand: { ...(d.brand || {}), ...brand } } : d)));
    setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, short: brand.name || o.short, color: brand.color || o.color, logo: brand.logo || o.logo, wash: o.wash } : o)));
  }

  useEffect(() => {
    if (!drive) return;
    const o = orgs.find((x) => x.id === drive.orgId);
    if (!o || planLimits(o).notify === false || planLimits(o).wa <= 0) return;
    const wait = drive.candidates.filter((x) => x.state === "wait").sort((a, b) => a.at - b.at);
    const t = tat(drive);
    wait.forEach((c, i) => {
      const etaMin = i * t;
      if (inNudgeWindow(etaMin) && !c.pinged) {
        upd(drive.id, (d) => ({ ...d, candidates: d.candidates.map((x) => x.id === c.id ? { ...x, pinged: true } : x) }));
        say(drive.id, "WhatsApp", c.whatsapp || c.phone, c.name, nudgeText(c));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat, drive?.candidates.length]);

  const org = orgs.find((o) => o.id === activeOrgId);
  if (!org) return <OrgAuth orgs={orgs} setOrgs={setOrgs} onSignedIn={(oid, role) => { setActiveOrgId(oid); setStaffRole(role || "recruiter"); }} back={back} />;

  const mine = drives.filter((d) => d.orgId === org.id);
  const face = { name: hallName(drive, org), color: orgColor(org, drive), logo: hallLogo(drive, org) };

  if (!drive) return <Lobby drives={mine} org={org} desk={desk} setOrgs={setOrgs} setDrives={setDrives} onSignOut={() => { setId(null); setActiveOrgId(null); setStaffRole("recruiter"); }}
    open={(did) => { setId(did); setTab(desk ? "live" : "today"); }}
    create={desk ? null : (f) => {
      if (driveSlotsLeft(org, drives) <= 0) return;
      const nid = `d_${Date.now()}`;
      const client = (org.clients || []).find((c) => c.id === f.clientId);
      const br = (org.branches || []).find((b) => b.id === f.branchId);
      const agency = isAgencyOrg(org) && planLimits(org).clients;
      const clientName = agency ? (client?.name || f.clientName || "") : "";
      const lim = planLimits(org);
      setDrives((p) => [...p, {
        id: nid, orgId: org.id, host: newHost(), gate: newGate(), desk: code(6), visibility: f.visibility || "public",
        company: org.name, role: f.role, venue: f.venue, city: f.city, date: f.date, endDate: f.endDate, status: f.status,
        jd: f.jd, expNeeded: f.expNeeded, docs: f.docs,
        clientId: f.clientId || "", clientName, branchId: f.branchId || "", branch: br?.name || f.branch || "",
        candidates: [], msgs: [], seq: 0, rounds: DEFAULT_ROUNDS.map((r) => ({ ...r })),
        brand: { name: org.short || org.name, color: org.color || BRAND_COLORS[0].hex, logo: org.logo || "letter" },
        rooms: lim.rooms === false ? [{ ...DEFAULT_ROOMS[0] }] : DEFAULT_ROOMS.map((r) => ({ ...r })),
      }]);
      setId(nid); setTab("today");
    }}
    back={back} />;

  const wait = drive.candidates.filter((x) => x.state === "wait").sort((a, b) => a.at - b.at);
  const callingNow = drive.candidates.filter((x) => x.state === "calling");
  const interviewing = drive.candidates.filter((x) => x.state === "interviewing");
  const active = [...callingNow, ...interviewing];
  const t = tat(drive);
  const eta = (c) => { const i = wait.findIndex((x) => x.id === c.id); return i < 0 ? 0 : i * t; };
  const s = {
    all: drive.candidates.length, wait: wait.length, active: active.length,
    seen: drive.candidates.filter((x) => ["interviewing", "selected", "rejected", "onhold"].includes(x.state) || x.decidedAt).length,
    selected: drive.candidates.filter((x) => x.state === "selected").length,
    rejected: drive.candidates.filter((x) => x.state === "rejected").length,
    onhold: drive.candidates.filter((x) => x.state === "onhold").length,
    absent: drive.candidates.filter((x) => x.state === "absent").length,
  };

  const panel = (
    <>
      {tab === "today" && !desk && <Today s={s} wait={wait} active={active} msgs={drive.msgs} setTab={setTab} drive={drive} lim={planLimits(org)} />}
      {tab === "live" && <LiveQueue drive={drive} wait={wait} active={active} s={s} eta={eta} callTo={callTo} skip={skip} recall={recall} move={move} decide={decide} sendToRound={sendToRound} deskMode={desk} issuePass={() => upd(drive.id, (d) => ({ ...d, gatePass: { code: newPass(), exp: Date.now() + PASS_TTL, used: false } }))} />}
      {tab === "screen" && <Screen gate={drive.gate} desk={drive.desk || drive.code} left={left} active={callingNow} wait={wait} eta={eta} brand={face} clientName={clientOf(drive)} branch={siteOf(drive)} role={drive.role} credit={planLimits(org).credit} />}
      {tab === "queue" && !desk && <Queue rows={drive.candidates} eta={eta} move={move} decide={decide} rounds={drive.rounds} rooms={drive.rooms || []} saveNote={saveNote} callTo={callTo} sendToRound={sendToRound} />}
      {tab === "rounds" && !desk && <RoundsTab rounds={drive.rounds} setRounds={setRounds} />}
      {tab === "rooms" && !desk && <RoomsTab rooms={drive.rooms || []} setRooms={setRooms} org={org} setOrgs={setOrgs} drive={drive} />}
      {tab === "branding" && !desk && <BrandingTab brand={drive.brand || { name: org.short || org.name, color: org.color, logo: org.logo }} setBrand={setBrand} drive={drive} org={org} />}
      {tab === "msgs" && !desk && <Msgs msgs={drive.msgs} />}
      {tab === "result" && !desk && <Result s={s} drive={drive} />}
    </>
  );

  if (!phone) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", background: orgWash(org), fontFamily: bdy, color: k.ink }}>
        <aside style={{ width: 232, flexShrink: 0, background: "#fff", borderRight: `1px solid ${k.line}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 14px 10px", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setId(null)} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}><ArrowLeft size={15} /> {isAgencyOrg(org) ? "HQ" : "Campus"}</button>
          </div>
          <div style={{ padding: "4px 14px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <OrgLogo name={face.name} color={face.color} logo={face.logo} size={36} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: dsp, fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{hallChrome(drive, org)}</div>
              <div style={{ fontSize: 12, color: k.mid, marginTop: 2 }}>{drive.role}</div>
            </div>
          </div>
          <AppTabs tabs={tabs} tab={tab} setTab={setTab} accent={face.color} msgCount={drive.msgs.length} layout="side" />
        </aside>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 22px", background: "#fff", borderBottom: `1px solid ${k.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <StatusPill status={drive.status} />
              {desk && <Pill tone="grey">FRONT DESK</Pill>}
              {!desk && <button onClick={() => upd(drive.id, (d) => ({ ...d, visibility: d.visibility === "private" ? "public" : "private" }))} style={{ ...ghostSm, padding: "4px 10px", fontSize: 11 }}>{drive.visibility === "private" ? "Private" : "Public"}</button>}
              <span style={{ fontSize: 13, color: k.mid }}>{listingPlace(drive)} · {fmtDate(drive.date)}</span>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 12.5, color: k.mid, fontFamily: typ, flexWrap: "wrap" }}>
              <span style={{ color: k.ink }}>HOST {bare6(drive.host)}</span>
              <span style={{ color: k.coral }}>GATE {bare6(drive.gate)}</span>
              <span>DESK {drive.desk || drive.code} · {left}s</span>
              <span><b style={{ color: k.ink }}>{s.all}</b> in · <b style={{ color: k.coral }}>{t}m</b> avg</span>
            </div>
          </div>
          {drive.status === "upcoming" && (
            <div style={{ background: k.goldDim, padding: "10px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: k.gold }}>Listed for candidates but not accepting check-ins yet.</span>
              <button onClick={() => upd(drive.id, (d) => ({ ...d, status: "live" }))} style={solidSm}>Open for check-in now</button>
            </div>
          )}
          <div style={{ flex: 1, overflow: "auto", padding: 26, maxWidth: 1120 }}>{panel}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: orgWash(org), fontFamily: bdy, color: k.ink }}>
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: face.color, color: "#fff", padding: "10px 14px calc(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setId(null)} style={{ background: "none", border: "none", color: "#fff", padding: 4, cursor: "pointer" }}><ArrowLeft size={20} /></button>
          <OrgLogo name={face.name} color={face.color} logo={face.logo} size={28} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: dsp, fontWeight: 800, fontSize: 16, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hallChrome(drive, org)}</div>
            <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>{drive.role} · {s.all} in</div>
          </div>
          {desk && <Pill tone="grey">DESK</Pill>}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto", fontFamily: typ, fontSize: 11, opacity: .9 }}>
          <span>GATE {bare6(drive.gate)}</span>
          <span>DESK {drive.desk || drive.code}</span>
          <span>{left}s</span>
        </div>
      </div>
      {drive.status === "upcoming" && (
        <div style={{ background: k.goldDim, padding: "10px 14px" }}>
          <span style={{ fontSize: 12.5, color: k.gold }}>Not accepting check-ins yet. </span>
          <button onClick={() => upd(drive.id, (d) => ({ ...d, status: "live" }))} style={{ ...solidSm, marginTop: 8 }}>Open now</button>
        </div>
      )}
      <div style={{ padding: "16px 14px 96px" }}>{panel}</div>
      <AppTabs tabs={tabs} tab={tab} setTab={setTab} accent={face.color} msgCount={drive.msgs.length} layout="bottom" />
    </div>
  );
}

function OrgAuth({ orgs, setOrgs, onSignedIn, back }) {
  const [mode, setMode] = useState("signin"); // signin | create
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [kind, setKind] = useState("captive");
  const [err, setErr] = useState("");

  function signIn(e) {
    e.preventDefault();
    setErr("");
    const em = email.trim().toLowerCase();
    const org = orgs.find((o) => o.email.toLowerCase() === em || o.members.some((m) => memberEmail(m).toLowerCase() === em));
    if (!org) { setErr("No company account found with that email."); return; }
    if (org.password !== password) { setErr("Incorrect password."); return; }
    const mem = org.members.find((m) => memberEmail(m).toLowerCase() === em);
    onSignedIn(org.id, mem ? memberRole(mem) : "recruiter");
  }

  function createOrg(e) {
    e.preventDefault();
    setErr("");
    if (!companyName.trim() || !email.trim() || !password.trim()) { setErr("Fill in all fields."); return; }
    if (orgs.some((o) => o.email.toLowerCase() === email.trim().toLowerCase())) { setErr("An account with that email already exists — sign in instead."); return; }
    const id = `org_${Date.now()}`;
    const agency = kind === "agency";
    const name = companyName.trim();
    setOrgs((p) => [...p, {
      id, name, short: name.split(" ")[0], kind, color: agency ? "#0F8A6B" : "#341C8A",
      logo: agency ? "bars" : "ring", wash: agency ? "#E6F5F0" : "#EEE8F8",
      email: email.trim(), password, plan: "trial",
      members: [{ email: email.trim(), role: "recruiter" }],
      clients: agency ? [] : [{ id: "cl_own", name: "Own hiring" }],
      branches: [],
    }]);
    onSignedIn(id, "recruiter");
  }

  return (
    <div style={{ minHeight: "100vh", background: k.cream2, fontFamily: bdy, color: k.ink, display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <button onClick={back} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 22 }}><ArrowLeft size={14} /> Back to site</button>
        <div style={{ marginBottom: 8 }}><Wordmark size={20} /></div>
        <p style={{ color: k.mid, fontSize: 14, margin: "0 0 24px" }}>Marketing is TokenHire. After sign-in you land in your company or agency space — only that org’s drives.</p>

        <div style={{ display: "flex", gap: 4, background: k.cream2, borderRadius: R.pill, padding: 4, marginBottom: 20 }}>
          <button onClick={() => { setMode("signin"); setErr(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: R.pill, border: "none", cursor: "pointer", fontFamily: bdy, fontSize: 13.5, fontWeight: 600, background: mode === "signin" ? "#fff" : "transparent", color: mode === "signin" ? k.ink : k.mid }}>Sign in</button>
          <button onClick={() => { setMode("create"); setErr(""); }} style={{ flex: 1, padding: "9px 0", borderRadius: R.pill, border: "none", cursor: "pointer", fontFamily: bdy, fontSize: 13.5, fontWeight: 600, background: mode === "create" ? "#fff" : "transparent", color: mode === "create" ? k.ink : k.mid }}>New company</button>
        </div>

        {mode === "signin" ? (
          <form onSubmit={signIn} style={{ ...box, padding: 24, display: "flex", flexDirection: "column", gap: 13 }}>
            <Field label="Work email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder="hr@yourcompany.com" /></Field>
            <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} /></Field>
            {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
            <button type="submit" style={{ ...solid, justifyContent: "center", padding: 12, marginTop: 4 }}>Sign in</button>
            <div style={{ fontSize: 11.5, color: k.faint, lineHeight: 1.7, marginTop: 4 }}>
              Password for every demo: <b style={{ fontFamily: typ }}>demo1234</b><br />
              Plans — <b style={{ fontFamily: typ }}>trial@tokenhire.demo</b> (free) · <b style={{ fontFamily: typ }}>single@tokenhire.demo</b> (₹7,500) · <b style={{ fontFamily: typ }}>monthly@tokenhire.demo</b> (₹15k) · <b style={{ fontFamily: typ }}>pack10@tokenhire.demo</b> · <b style={{ fontFamily: typ }}>pack25@tokenhire.demo</b> · <b style={{ fontFamily: typ }}>enterprise@tokenhire.demo</b><br />
              Agency floor: <b style={{ fontFamily: typ }}>demo@vistaar.com</b> / <b style={{ fontFamily: typ }}>hr@quesscorp.com</b>. Campus: <b style={{ fontFamily: typ }}>hr@wipro.com</b>. Front desk: <b style={{ fontFamily: typ }}>desk@vistaar.com</b>.
            </div>
          </form>
        ) : (
          <form onSubmit={createOrg} style={{ ...box, padding: 24, display: "flex", flexDirection: "column", gap: 13 }}>
            <Field label="Company or agency name"><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={input} placeholder="Vistaar Services, or Quess Corp" /></Field>
            <div>
              <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>How you hire</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setKind("captive")} style={{ flex: 1, textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer", fontFamily: bdy, border: `1px solid ${kind === "captive" ? k.coral : k.line}`, background: kind === "captive" ? k.coralDim : "#fff" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Enterprise / captive</div>
                  <div style={{ fontSize: 11.5, color: k.mid, marginTop: 3 }}>Wipro or Genpact — hire for yourselves. No client layer.</div>
                </button>
                <button type="button" onClick={() => setKind("agency")} style={{ flex: 1, textAlign: "left", padding: 12, borderRadius: 10, cursor: "pointer", fontFamily: bdy, border: `1px solid ${kind === "agency" ? k.coral : k.line}`, background: kind === "agency" ? k.coralDim : "#fff" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Staffing agency</div>
                  <div style={{ fontSize: 11.5, color: k.mid, marginTop: 3 }}>Quess or Vistaar — walk-ins for clients, branded as you.</div>
                </button>
              </div>
            </div>
            <Field label="Work email"><input value={email} onChange={(e) => setEmail(e.target.value)} style={input} placeholder="hr@yourcompany.com" /></Field>
            <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} /></Field>
            {err && <div style={{ fontSize: 12.5, color: k.red }}>{err}</div>}
            <button type="submit" style={{ ...solid, justifyContent: "center", padding: 12, marginTop: 4 }}>Create company account</button>
            <div style={{ fontSize: 11.5, color: k.faint, lineHeight: 1.5, marginTop: 4 }}>This becomes your company's account — invite teammates from Team settings once you're in.</div>
          </form>
        )}
      </div>
    </div>
  );
}

function Lobby({ drives, org, onSignOut, open, create, back, desk, setOrgs, setDrives }) {
  const agency = isAgencyOrg(org);
  const clients = org.clients || [];
  const branches = org.branches || [];
  const accent = org.color || k.coral;
  const [making, setMaking] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
  const [filterClient, setFilterClient] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [f, setF] = useState({
    company: org.name, role: "", venue: branches[0]?.name || "", city: branches[0]?.city || (CITIES.includes("Hyderabad") ? "Hyderabad" : CITIES[0]),
    date: todayStr(), status: "live", visibility: "public", jd: "", expNeeded: [], docs: DOC_OPTIONS.slice(0, 4),
    clientId: agency ? (clients[0]?.id || "") : "", branchId: branches[0]?.id || "",
  });
  const [host, setHost] = useState("");
  const [hostErr, setHostErr] = useState("");
  function openByHost() {
    setHostErr("");
    const v = host.trim().toUpperCase();
    if (!v) return;
    if (v.startsWith("GATE") || v.startsWith("DESK")) { setHostErr("That's a candidate GATE or DESK code. Staff use HOST-XXXXXX."); return; }
    const hit = drives.find((d) => d.host.toUpperCase() === v || d.host.toUpperCase() === `HOST-${v}` || (v.startsWith("HOST") && bare6(d.host) === bare6(v)));
    if (!hit) { setHostErr("No walk-in in this space has that HOST code."); return; }
    open(hit.id);
  }
  const cities = Array.from(new Set([...(org.branches || []).map((b) => b.city), ...drives.map((d) => d.city)])).filter(Boolean);
  const spec = planOf(org);
  const lim = spec.limits;
  const multiDay = spec.multiDay;
  const slots = driveSlotsLeft(org, drives);
  const canClients = agency && lim.clients;
  const lockedCity = lim.cities === 1 ? (orgCities(org)[0] || null) : null;
  const shown = drives.filter((d) => (filterClient === "all" || d.clientId === filterClient) && (filterCity === "all" || d.city === filterCity));
  const grouped = cities.filter((c) => shown.some((d) => d.city === c));
  function pickBranch(branchId) {
    const br = branches.find((b) => b.id === branchId);
    setF({ ...f, branchId, city: br?.city || f.city, venue: br?.name || f.venue, branch: br?.name || "" });
  }
  return (
    <div style={{ minHeight: "100vh", background: orgWash(org), fontFamily: bdy, color: k.ink }}>
      <div style={{ background: accent, color: "#fff", padding: "22px 26px 26px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={back} style={{ background: "none", border: "none", color: "rgba(255,255,255,.85)", display: "flex", gap: 7, alignItems: "center", fontSize: 13, cursor: "pointer", fontFamily: bdy }}><ArrowLeft size={15} /> Back</button>
            <button onClick={onSignOut} style={{ background: "none", border: "none", color: "rgba(255,255,255,.75)", fontSize: 12.5, cursor: "pointer", fontFamily: bdy }}>Sign out</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 6, display: "flex" }}>
              <OrgLogo name={org.short || org.name} color={accent} logo={org.logo} size={52} />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 11, letterSpacing: 1.2, fontWeight: 700, textTransform: "uppercase", opacity: .75, marginBottom: 4 }}>{agency ? "Staffing HQ" : "Campus hiring"}</div>
              <div style={{ fontFamily: dsp, fontWeight: 800, fontSize: 28, letterSpacing: -0.6, lineHeight: 1.1 }}>{org.name}</div>
              <div style={{ fontSize: 13, opacity: .85, marginTop: 6 }}>{agency ? "Hire for clients. This hall is yours." : "You hire for yourselves — no staffing clients."}</div>
            </div>
            {!desk && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => setShowClients(true)} style={{ ...ghostSm, background: "rgba(255,255,255,.12)", color: "#fff", borderColor: "rgba(255,255,255,.25)" }}><HeartHandshake size={13} /> {agency && planLimits(org).clients ? "Clients & sites" : "Sites"}</button>
                <button onClick={() => setShowBrand(true)} style={{ ...ghostSm, background: "rgba(255,255,255,.12)", color: "#fff", borderColor: "rgba(255,255,255,.25)" }}><Palette size={13} /> Brand</button>
                <button onClick={() => setShowTeam(true)} style={{ ...ghostSm, background: "rgba(255,255,255,.12)", color: "#fff", borderColor: "rgba(255,255,255,.25)" }}><Users2 size={13} /> Team</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pagepad" style={{ maxWidth: 920, margin: "0 auto", padding: "22px 26px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: canClients ? "1.1fr 1fr" : "1fr", gap: 12, marginBottom: 20 }} className={canClients ? "g2" : undefined}>
          {canClients && (
            <div style={{ ...box, padding: 16 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 10 }}>Clients</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {clients.map((c) => {
                  const n = drives.filter((d) => d.clientId === c.id).length;
                  const on = filterClient === c.id;
                  return (
                    <button key={c.id} type="button" onClick={() => setFilterClient(on ? "all" : c.id)} style={{
                      padding: "8px 12px", borderRadius: 12, cursor: "pointer", fontFamily: bdy, textAlign: "left",
                      border: `1px solid ${on ? accent : k.line}`, background: on ? `${accent}18` : "#fff",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: on ? accent : k.ink }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: k.mid, marginTop: 2 }}>{n} {n === 1 ? "drive" : "drives"}</div>
                    </button>
                  );
                })}
                {!clients.length && <div style={{ fontSize: 13, color: k.mid }}>Add clients to tag drives.</div>}
              </div>
            </div>
          )}
          <div style={{ ...box, padding: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", marginBottom: 10 }}>{canClients ? "Branches / cities" : "Sites"}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(branches.length ? branches : cities.map((c) => ({ id: c, name: c, city: c }))).map((b) => {
                const on = filterCity === b.city;
                return (
                  <button key={b.id} type="button" onClick={() => setFilterCity(on ? "all" : b.city)} style={{
                    padding: "8px 12px", borderRadius: 12, cursor: "pointer", fontFamily: bdy,
                    border: `1px solid ${on ? k.ink : k.line}`, background: on ? k.ink : "#fff", color: on ? "#fff" : k.ink,
                    fontSize: 13, fontWeight: 600,
                  }}>{b.city}{b.name && b.name !== b.city ? ` · ${b.name}` : ""}</button>
                );
              })}
            </div>
          </div>
        </div>

        {!making ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>{desk ? "Walk-ins today" : "Walk-ins"}</h1>
              {!desk && lim.drives < 999 && slots > 0 && <div style={{ fontSize: 12.5, color: k.mid, marginTop: 4 }}>{slots} left{multiDay ? " this month" : ""}</div>}
            </div>
              {!desk && create && slots > 0 && <button onClick={() => setMaking(true)} style={{ ...solid, background: accent }}><Plus size={15} /> New walk-in</button>}
            </div>
            {!desk && create && slots <= 0 && <div style={{ ...box, padding: 14, marginBottom: 14, fontSize: 13.5, color: k.ink2, lineHeight: 1.5 }}>{driveCapCopy(org)} Contact us if you need more.</div>}
            <div style={{ ...box, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 9 }}>A teammate started a walk-in on another laptop? Open it with the staff HOST code — never the GATE QR.</div>
              <div style={{ display: "flex", gap: 9 }}>
                <input value={host} onChange={(e) => { setHost(e.target.value.toUpperCase()); setHostErr(""); }} onKeyDown={(e) => e.key === "Enter" && openByHost()} placeholder="HOST-XXXXXX" style={{ ...input, fontFamily: typ, letterSpacing: 1.5, flex: 1 }} />
                <button onClick={openByHost} style={outline}>Open</button>
              </div>
              {hostErr && <div style={{ fontSize: 12.5, color: k.red, marginTop: 9 }}>{hostErr}</div>}
            </div>
            {!shown.length && <Blank text={drives.length ? "No drives match that filter." : (slots <= 0 ? driveCapCopy(org) : `No walk-ins yet for ${org.name}. Create your first one.`)} />}
            {(grouped.length ? grouped : [""]).map((city) => (
              <div key={city || "all"} style={{ marginBottom: 16 }}>
                {city ? <div style={{ fontSize: 11.5, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase", margin: "4px 0 8px" }}>{city} {branches.filter((b) => b.city === city).map((b) => b.name).join(" · ")}</div> : null}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {shown.filter((d) => !city || d.city === city).map((d) => (
                    <div key={d.id} style={{ ...box, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: dsp, fontWeight: 700, fontSize: 15 }}>{d.role}</span>
                          <StatusPill status={d.status} />
                          {d.visibility === "private" ? <Pill tone="grey">PRIVATE</Pill> : <Pill tone="teal">PUBLIC</Pill>}
                          {clientOf(d) ? <Pill tone="coral">{d.clientName}</Pill> : null}
                        </div>
                        <div style={{ fontSize: 12.5, color: k.mid, marginTop: 3 }}>{listingPlace(d)} · {d.endDate && d.endDate !== d.date ? `${fmtDate(d.date)} – ${fmtDate(d.endDate)}` : fmtDate(d.date)} — {d.candidates.length} checked in</div>
                        <div style={{ fontFamily: typ, fontSize: 11.5, color: k.faint, marginTop: 4 }}>{d.host} · {d.gate}</div>
                      </div>
                      <button onClick={() => open(d.id)} style={outline}>Open <ArrowRight size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ ...box, padding: 26, maxWidth: 540 }}>
            <h2 style={{ fontFamily: dsp, fontSize: 19, fontWeight: 700, margin: "0 0 5px" }}>Set up a walk-in</h2>
            <p style={{ fontSize: 13, color: k.mid, margin: "0 0 20px" }}>
              {canClients
                ? `Tag the client and location. Candidates see ${org.short || org.name} for that client.`
                : multiDay
                  ? `Owned by ${org.name}. You can run this across several days.`
                  : `Owned by ${org.name}. One event — one day, one location.`}
            </p>
            <form onSubmit={(e) => { e.preventDefault(); if (driveSlotsLeft(org, drives) <= 0) return; if (!f.role.trim() || !f.venue.trim() || !(lockedCity || f.city.trim())) return; create({ ...f, city: lockedCity || f.city }); setMaking(false); }} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {canClients && (
                <Field label="Client company">
                  <select value={f.clientId || ""} onChange={(e) => setF({ ...f, clientId: e.target.value })} style={{ ...input, appearance: "auto" }}>
                    <option value="">Select client…</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div style={{ fontSize: 11.5, color: k.faint, marginTop: 6 }}>Walk-in for this client. Use Associate bench when you are hiring onto your own payroll.</div>
                </Field>
              )}
              {!!branches.length && (
                <Field label="Branch / site">
                  <select value={f.branchId || ""} onChange={(e) => pickBranch(e.target.value)} style={{ ...input, appearance: "auto" }}>
                    <option value="">City + venue below</option>
                    {branches.map((b) => <option key={b.id} value={b.id}>{b.city} · {b.name}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Role"><input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} style={input} placeholder="Customer Support Executive" /></Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="City">{lockedCity ? <div style={{ ...input }}>{lockedCity}</div> : <CitySelect value={f.city} onChange={(city) => setF({ ...f, city })} />}</Field>
                <Field label={multiDay ? "Start date" : "Date"}><input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} style={input} /></Field>
              </div>
              {multiDay ? (
                <Field label="End date">
                  <input type="date" value={f.endDate || f.date} min={f.date} onChange={(e) => setF({ ...f, endDate: e.target.value })} style={input} />
                  <div style={{ fontSize: 11.5, color: k.faint, marginTop: 6 }}>Runs across multiple days — the same queue and candidate list carries over each morning.</div>
                </Field>
              ) : null}
              <Field label="Venue"><input value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} style={input} placeholder="Gachibowli campus, Gate 1" /></Field>

              <Field label="Job description">
                <textarea value={f.jd} onChange={(e) => setF({ ...f, jd: e.target.value })} rows={4} placeholder="What they'll do, shift, language, anything a candidate should know before they show up." style={{ ...input, resize: "vertical", fontFamily: bdy, lineHeight: 1.55 }} />
              </Field>

              <div>
                <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Experience needed</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {EXP_BANDS.map((b) => {
                    const on = f.expNeeded.includes(b);
                    return (
                      <button type="button" key={b} onClick={() => setF({ ...f, expNeeded: on ? f.expNeeded.filter((x) => x !== b) : [...f.expNeeded, b] })} style={{
                        padding: "7px 12px", borderRadius: R.pill, cursor: "pointer", fontFamily: bdy, fontSize: 12.5, fontWeight: 600,
                        border: `1px solid ${on ? k.coral : k.line}`, background: on ? k.coralDim : "#fff", color: on ? k.coral : k.ink2,
                      }}>{b}</button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11.5, color: k.faint, marginTop: 6 }}>Leave all unselected to list as open to every experience level.</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Required documents</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {DOC_OPTIONS.map((doc) => {
                    const on = f.docs.includes(doc);
                    return (
                      <label key={doc} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, color: k.ink2, cursor: "pointer" }}>
                        <input type="checkbox" checked={on} onChange={() => setF({ ...f, docs: on ? f.docs.filter((x) => x !== doc) : [...f.docs, doc] })} style={{ marginTop: 2 }} />
                        {doc}
                      </label>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11.5, color: k.faint, marginTop: 6 }}>Candidates see this on Upcoming walk-ins so they know what to carry.</div>
              </div>

              <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginTop: 4 }}>When should candidates be able to check in?</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setF({ ...f, status: "live" })} style={{
                  flex: 1, textAlign: "left", padding: 12, borderRadius: 6, cursor: "pointer", fontFamily: bdy,
                  border: `1px solid ${f.status === "live" ? k.coral : k.line}`, background: f.status === "live" ? k.coralDim : "#fff", color: k.ink,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Right now</div>
                  <div style={{ fontSize: 11.5, color: k.mid, marginTop: 2 }}>Opens GATE and the rotating DESK code immediately</div>
                </button>
                <button type="button" onClick={() => setF({ ...f, status: "upcoming" })} style={{
                  flex: 1, textAlign: "left", padding: 12, borderRadius: 6, cursor: "pointer", fontFamily: bdy,
                  border: `1px solid ${f.status === "upcoming" ? k.coral : k.line}`, background: f.status === "upcoming" ? k.coralDim : "#fff", color: k.ink,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>Publish for later</div>
                  <div style={{ fontSize: 11.5, color: k.mid, marginTop: 2 }}>Listed for candidates to browse if this drive is public; open check-in when ready</div>
                </button>
              </div>

              <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginTop: 4 }}>Listing</div>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 10, border: `1px solid ${k.line}`, background: f.visibility === "public" ? k.coralDim : "#fff", cursor: "pointer" }}>
                <input type="checkbox" checked={f.visibility === "public"} onChange={(e) => setF({ ...f, visibility: e.target.checked ? "public" : "private" })} style={{ marginTop: 3 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{f.visibility === "public" ? <Globe size={14} /> : <Lock size={14} />} {f.visibility === "public" ? "Public — listed on Upcoming walk-ins" : "Private — unlisted"}</div>
                  <div style={{ fontSize: 12, color: k.mid, marginTop: 4, lineHeight: 1.5 }}>
                    Default is public so people can find this weekend's drive. Uncheck only for referral-only or internal days — candidates still check in at the venue: GATE finds the walk-in, the rotating DESK code on the TV proves they're there.
                  </div>
                </div>
              </label>

              <div style={{ display: "flex", gap: 9, marginTop: 6 }}>
                <button type="button" onClick={() => setMaking(false)} style={outline}>Cancel</button>
                <button type="submit" style={{ ...solid, flex: 1, justifyContent: "center", padding: 11 }}>Create drive</button>
              </div>
            </form>
          </div>
        )}
      </div>
      {showTeam && <TeamPanel org={org} setOrgs={setOrgs} onClose={() => setShowTeam(false)} />}
      {showClients && <ClientsPanel org={org} setOrgs={setOrgs} onClose={() => setShowClients(false)} />}
      {showBrand && <BrandPanel org={org} setOrgs={setOrgs} setDrives={setDrives} onClose={() => setShowBrand(false)} />}
    </div>
  );
}

function ClientsPanel({ org, setOrgs, onClose }) {
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [city, setCity] = useState((org.branches || [])[0]?.city || (CITIES.includes("Hyderabad") ? "Hyderabad" : CITIES[0]));
  const [err, setErr] = useState("");
  const clients = org.clients || [];
  const branches = org.branches || [];
  const lim = planLimits(org);
  const canClients = isAgencyOrg(org) && lim.clients;
  const lockedCity = lim.cities === 1 ? (orgCities(org)[0] || city) : null;
  function patch(next) {
    setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, ...next } : o)));
  }
  function addClient() {
    if (!canClients) return;
    const v = name.trim();
    if (!v || clients.some((c) => c.name.toLowerCase() === v.toLowerCase())) return;
    patch({ clients: [...clients, { id: `cl_${Date.now()}`, name: v }] });
    setName("");
  }
  function addBranch() {
    setErr("");
    const v = branch.trim();
    if (!v) return;
    if (branches.length >= lim.sites) { setErr(`This plan includes ${lim.sites} site${lim.sites === 1 ? "" : "s"}.`); return; }
    const nextCity = lockedCity || city;
    const nextCities = new Set([...orgCities(org), nextCity]);
    if (nextCities.size > lim.cities) { setErr(`This plan includes ${lim.cities} ${lim.cities === 1 ? "city" : "cities"}.`); return; }
    patch({ branches: [...branches, { id: `br_${Date.now()}`, name: v, city: nextCity }] });
    setBranch("");
  }
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 28, maxWidth: 480, width: "100%", maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontFamily: dsp, fontSize: 19, fontWeight: 700 }}>{org.name} — {canClients ? "Clients & sites" : "Sites"}</div>
            <div style={{ fontSize: 12.5, color: k.mid, marginTop: 3, lineHeight: 1.5 }}>
              {canClients
                ? "Clients are companies you staff (HDFC, Amazon) or your own bench. Sites are branches. Other agencies never see this list."
                : "Sites are campuses or branches for this company. Other orgs never see this list."}
            </div>
          </div>
          <button onClick={onClose} style={{ ...ghostSm, padding: "6px 12px" }}>Close</button>
        </div>
        {canClients && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .5, textTransform: "uppercase", margin: "16px 0 8px" }}>Clients</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {clients.map((c) => (
                <div key={c.id} style={{ padding: "9px 12px", background: k.cream2, borderRadius: 10, fontSize: 13.5, fontWeight: 600 }}>{c.name}</div>
              ))}
              {!clients.length && <div style={{ fontSize: 13, color: k.mid }}>No clients yet.</div>}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addClient()} placeholder="e.g. HDFC sales" style={{ ...input, flex: 1 }} />
              <button onClick={addClient} style={solidSm}>Add client</button>
            </div>
          </>
        )}
        <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .5, textTransform: "uppercase", margin: "16px 0 8px" }}>Sites</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {branches.map((b) => (
            <div key={b.id} style={{ padding: "9px 12px", background: k.cream2, borderRadius: 10, fontSize: 13.5 }}><b>{b.name}</b><span style={{ color: k.mid }}> · {b.city}</span></div>
          ))}
          {!branches.length && <div style={{ fontSize: 13, color: k.mid }}>No sites yet — city + venue on each drive still works.</div>}
        </div>
        {err && <div style={{ fontSize: 12.5, color: k.red, marginBottom: 10 }}>{err}</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={branch} onChange={(e) => setBranch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBranch()} placeholder="Site name — e.g. HITEC Tower B" style={{ ...input, flex: "1 1 160px" }} />
          {lockedCity ? <div style={{ ...input, width: "auto", display: "flex", alignItems: "center" }}>{lockedCity}</div> : <CitySelect value={city} onChange={setCity} />}
          <button onClick={addBranch} style={outlineSm} disabled={branches.length >= lim.sites}>Add site</button>
        </div>
      </div>
    </div>
  );
}

function BrandPanel({ org, setOrgs, setDrives, onClose }) {
  const [name, setName] = useState(org.short || org.name);
  const [color, setColor] = useState(org.color || k.coral);
  const [logo, setLogo] = useState(org.logo || "letter");
  function save() {
    const short = name.trim() || org.short;
    setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, short, color, logo } : o)));
    if (setDrives) setDrives((p) => p.map((d) => (d.orgId === org.id ? { ...d, brand: { ...(d.brand || {}), name: short, color, logo } } : d)));
    onClose();
  }
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 28, maxWidth: 460, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: dsp, fontSize: 19, fontWeight: 700 }}>Location brand</div>
          <button onClick={onClose} style={{ ...ghostSm, padding: "6px 12px" }}>Close</button>
        </div>
        <p style={{ fontSize: 13, color: k.mid, margin: "0 0 16px", lineHeight: 1.5 }}>
          GATE, TV, and check-in carry this mark.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <OrgLogo name={name} color={color} logo={logo} size={48} />
          <HallBrand name={name} color={color} logo={logo} credit={planLimits(org).credit} sub={isAgencyOrg(org) && planLimits(org).clients ? ((org.clients || [])[0]?.name || "Client") : null} />
        </div>
        <Field label="Display name"><input value={name} onChange={(e) => setName(e.target.value)} style={input} /></Field>
        <div style={{ height: 12 }} />
        <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Logo</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {LOGO_PRESETS.map((p) => (
            <button key={p.id} type="button" onClick={() => setLogo(p.id)} style={{ padding: 6, borderRadius: 10, border: `2px solid ${logo === p.id ? color : k.line}`, background: "#fff", cursor: "pointer" }}>
              <OrgLogo name={name} color={color} logo={p.id} size={32} />
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Primary color</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {BRAND_COLORS.map((c) => (
            <button key={c.hex} type="button" onClick={() => setColor(c.hex)} title={c.name} style={{
              width: 30, height: 30, borderRadius: "50%", background: c.hex, cursor: "pointer",
              border: color === c.hex ? `3px solid ${k.ink}` : "3px solid transparent",
            }} />
          ))}
        </div>
        <button onClick={save} style={{ ...solid, background: color, width: "100%", justifyContent: "center" }}>Apply to this space</button>
      </div>
    </div>
  );
}

function TeamPanel({ org, setOrgs, onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("recruiter");
  const members = org.members || [];
  function commit(next) {
    if (setOrgs) setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, members: next } : o)));
    else org.members = next;
  }
  function invite() {
    const v = email.trim();
    if (!v || members.some((m) => memberEmail(m).toLowerCase() === v.toLowerCase())) return;
    if (members.length >= planLimits(org).seats) return;
    commit([...members, { email: v, role }]);
    setEmail("");
  }
  function setMemberRole(em, r) {
    commit(members.map((m) => (memberEmail(m) === em ? { ...(typeof m === "string" ? { email: em } : m), email: em, role: r } : m)));
  }
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 28, maxWidth: 460, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: dsp, fontSize: 19, fontWeight: 700 }}>{org.name} — Team</div>
            <div style={{ fontSize: 12.5, color: k.mid, marginTop: 3 }}>Add recruiters, then map them to rooms on a drive. Front desk only runs the live queue and waiting screen.</div>
          </div>
          <button onClick={onClose} style={{ ...ghostSm, padding: "6px 12px" }}>Close</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "18px 0" }}>
          {members.map((m) => (
            <div key={memberEmail(m)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: k.cream2, borderRadius: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: k.coral, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>{memberName(m)[0].toUpperCase()}</div>
              <span style={{ fontSize: 13.5, flex: 1, minWidth: 0 }}>
                <div>{memberName(m)}</div>
                <div style={{ fontSize: 11.5, color: k.faint, overflow: "hidden", textOverflow: "ellipsis" }}>{memberEmail(m)}</div>
              </span>
              <select value={memberRole(m)} onChange={(e) => setMemberRole(memberEmail(m), e.target.value)} style={{ ...input, width: "auto", padding: "6px 10px", fontSize: 12 }}>
                <option value="recruiter">Recruiter</option>
                <option value="frontdesk">Front desk</option>
              </select>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && invite()} placeholder="colleague@yourcompany.com" style={{ ...input, flex: 1, minWidth: 160 }} />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...input, width: 130, padding: "11px 10px" }}>
            <option value="recruiter">Recruiter</option>
            <option value="frontdesk">Front desk</option>
          </select>
          <button onClick={invite} style={solidSm} disabled={members.length >= planLimits(org).seats}>Invite</button>
        </div>
        <div style={{ fontSize: 11, color: k.faint, marginTop: 10, lineHeight: 1.5 }}>
          {members.length >= planLimits(org).seats
            ? `This plan includes ${planLimits(org).seats} team seat${planLimits(org).seats === 1 ? "" : "s"}.`
            : "Front desk never sees who is in an interview room, resumes, or round decisions. Map recruiters to rooms on the drive’s Rooms tab."}
        </div>
      </div>
    </div>
  );
}


function OutcomeBtns({ cand, rounds, decide }) {
  return (
    <>
      <Btn onClick={() => decide(cand.id, "selected")}>{passLabel(rounds, cand)}</Btn>
      <Btn q onClick={() => decide(cand.id, "onhold")}>Hold</Btn>
      <Btn q onClick={() => decide(cand.id, "rejected")}>Reject</Btn>
    </>
  );
}

function LiveQueue({ drive, wait, active, s, eta, callTo, skip, recall, move, decide, sendToRound, deskMode, issuePass }) {
  const rooms = drive.rooms || [];
  const rounds = drive.rounds || [];
  const next = wait[0];
  const [pickFor, setPickFor] = useState(null);
  const absent = drive.candidates.filter((x) => x.state === "absent");
  const pass = livePass(drive);
  const passLeft = pass ? Math.max(0, Math.ceil((pass.exp - Date.now()) / 1000)) : 0;

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
        <BigStat n={s.all} label="Checked in" />
        <BigStat n={s.wait} label="Waiting" color={k.coral} />
        {!deskMode && <BigStat n={s.active} label="In interview" color="#5C7DE0" />}
        {!deskMode && <BigStat n={s.selected} label="Selected" color={k.teal} />}
        {deskMode && <BigStat n={active.filter((x) => x.state === "calling").length} label="Being called" color="#5C7DE0" />}
      </div>

      {!!rooms.length && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .8, textTransform: "uppercase", marginBottom: 10 }}>Rooms · interviewers</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {rooms.map((r) => {
              const who = occupantOf(drive, r.id);
              return (
                <div key={r.id} style={{ ...box, padding: "12px 14px", background: who ? k.coralDim : "#fff" }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: k.ink2, marginTop: 2 }}>{r.interviewer || "Unassigned"}</div>
                  <div style={{ fontSize: 11.5, color: who ? k.coral : k.faint, marginTop: 6, fontWeight: 600 }}>
                    {who ? `${who.token} · ${roundLabel(rounds, who)} · ${who.state === "calling" ? "Calling" : "In interview"}` : "Free"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ ...box, padding: 18, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .8, textTransform: "uppercase" }}>Admit at the door</div>
          <div style={{ fontSize: 13, color: k.ink2, marginTop: 4, lineHeight: 1.5, maxWidth: 420 }}>Someone scanned GATE but isn't at the TV yet? Issue a one-time pass — it expires in 2 minutes and works once.</div>
        </div>
        {pass && passLeft > 0 ? (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: typ, fontSize: 22, fontWeight: 700, letterSpacing: 2, color: k.coral }}>PASS-{pass.code}</div>
            <div style={{ fontSize: 11.5, color: k.faint, fontFamily: typ, marginTop: 4 }}>EXPIRES IN {passLeft}s · one use</div>
            {issuePass && <button onClick={issuePass} style={{ ...ghostSm, marginTop: 8 }}>Issue a new one</button>}
          </div>
        ) : (
          issuePass && <button onClick={issuePass} style={solidSm}>Issue gate pass</button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: deskMode ? "1fr" : "1.1fr 1fr", gap: 18 }} className="g2">
        {!deskMode && (
        <div style={{ ...box, padding: 22 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .8, textTransform: "uppercase", marginBottom: 14 }}>In interview now</div>
          {!active.length ? <Blank text="Nobody is with a recruiter yet." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {active.map((x) => (
                <div key={x.id} style={{ background: k.coralDim, borderRadius: 14, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <TokenChip token={x.token} name={x.name} size={44} pulse={x.state === "calling"} />
                      <div style={{ fontSize: 12.5, color: k.ink2, marginTop: 8 }}>
                        {x.room ? `${x.room.name} · ${x.room.interviewer}` : "No room assigned"}
                        {" · "}{roundLabel(rounds, x)}
                        {x.calledAt && <> · <Elapsed since={x.calledAt} /></>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {x.state === "calling" && <Btn onClick={() => move(x.id, "interviewing")}>Started</Btn>}
                      {["calling", "interviewing"].includes(x.state) && <OutcomeBtns cand={x} rounds={rounds} decide={decide} />}
                      <ActionSelect label="Send to round" options={rounds.map((r, i) => ({ value: String(i), label: r.name }))} onPick={(v) => sendToRound(x.id, Number(v))} />
                      <Btn q onClick={() => skip(x.id)}>Skip</Btn>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* UP NEXT */}
        <div style={{ ...box, padding: 22 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .8, textTransform: "uppercase", marginBottom: 14 }}>Up next</div>
          {!next ? <Blank text="Queue is empty." /> : (
            <>
              <TokenChip token={next.token} name={next.name} size={52} />
              <div style={{ fontSize: 12.5, color: k.mid, marginTop: 10 }}>{next.expBand}{next.qual ? ` · ${next.qual}` : ""} · {roundLabel(rounds, next)} · waiting {Math.round((Date.now() - next.at) / 60000)} min</div>
              {pickFor === next.id ? (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Call into which room?</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {rooms.map((r) => (
                      <button key={r.id} onClick={() => { callTo(next.id, r.id); setPickFor(null); }} style={{
                        padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontFamily: bdy, textAlign: "left",
                        border: `1px solid ${k.line}`, background: "#fff",
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                        <div style={{ fontSize: 11.5, color: k.mid }}>{r.interviewer || "Unassigned"}</div>
                      </button>
                    ))}
                    {!rooms.length && <div style={{ fontSize: 12.5, color: k.faint }}>Add rooms on the Rooms tab first.</div>}
                  </div>
                  <button onClick={() => setPickFor(null)} style={{ ...ghostSm, marginTop: 10 }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
                  <button onClick={() => setPickFor(next.id)} style={{ ...solid, flex: 1, justifyContent: "center", padding: 13, fontSize: 15 }}>
                    Call {next.token} to a room <ArrowRight size={16} />
                  </button>
                  {!deskMode && <ActionSelect label="Send to round" options={rounds.map((r, i) => ({ value: String(i), label: r.name }))} onPick={(v) => sendToRound(next.id, Number(v))} />}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* THE LINE */}
      <div style={{ ...box, marginTop: 18, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${k.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .8, textTransform: "uppercase" }}>The line — {wait.length} waiting</span>
        </div>
        {!wait.length ? <Blank text="Nobody waiting." /> : wait.map((x, i) => (
          <div key={x.id} style={{ display: "grid", gridTemplateColumns: deskMode ? "minmax(180px,1.4fr) 90px 1fr" : "minmax(160px,1.2fr) 90px 110px 1fr", gap: 12, alignItems: "center", padding: "13px 20px", borderTop: i ? `1px solid ${k.line}` : "none", background: i === 0 ? k.cream2 : "transparent" }} className="driverow">
            <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <TokenChip token={x.token} name={x.name} size={34} />
              {x.skipped ? <Pill tone="gold">SKIPPED {x.skipped}×</Pill> : null}
            </span>
            <span style={{ fontSize: 12.5, color: k.mid, fontFamily: typ }}>~{eta(x)}m</span>
            {!deskMode && (
              <span style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                {clientOf(drive) ? <Pill tone="coral">{clientOf(drive)}</Pill> : null}
                <span style={{ fontSize: 12.5, color: k.ink2, fontWeight: 600 }}>{roundLabel(rounds, x)}</span>
                <Pill tone="grey">Waiting</Pill>
              </span>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
              {pickFor === x.id ? (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {rooms.map((r) => (
                    <button key={r.id} onClick={() => { callTo(x.id, r.id); setPickFor(null); }} style={{
                      padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontFamily: bdy, textAlign: "left",
                      border: `1px solid ${k.line}`, background: "#fff", fontSize: 11.5,
                    }}>
                      <b>{r.name}</b> · {r.interviewer || "—"}
                    </button>
                  ))}
                  <button onClick={() => setPickFor(null)} style={{ ...ghostSm, padding: "6px 10px" }}>Cancel</button>
                </div>
              ) : (
                <>
                  <Btn onClick={() => setPickFor(x.id)}>Call to room</Btn>
                  {!deskMode && <ActionSelect label="Send to round" options={rounds.map((r, i) => ({ value: String(i), label: r.name }))} onPick={(v) => sendToRound(x.id, Number(v))} />}
                  <Btn q onClick={() => move(x.id, "absent")}>Absent</Btn>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* RECALL ABSENT */}
      {absent.length > 0 && (
        <div style={{ ...box, marginTop: 18, padding: 20 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: k.mid, letterSpacing: .8, textTransform: "uppercase", marginBottom: 12 }}>Marked absent — {absent.length}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {absent.map((x) => (
              <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 10, background: k.cream2, borderRadius: 10, padding: "9px 13px" }}>
                <TokenChip token={x.token} name={x.name} size={28} />
                <Btn q onClick={() => recall(x.id)}>Recall</Btn>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BigStat({ n, label, color }) {
  return (
    <div style={{ ...box, padding: "18px 22px", flex: 1, minWidth: 130 }}>
      <div style={{ fontFamily: dsp, fontSize: 32, fontWeight: 800, color: color || k.ink, letterSpacing: -1.2 }}>{n}</div>
      <div style={{ fontSize: 12.5, color: k.mid, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Elapsed({ since }) {
  const [, tick] = useState(0);
  useEffect(() => { const iv = setInterval(() => tick((t) => t + 1), 10000); return () => clearInterval(iv); }, []);
  const m = Math.floor((Date.now() - since) / 60000);
  return <span style={{ fontFamily: typ }}>{m}m elapsed</span>;
}

function Today({ s, wait, active, msgs, setTab, drive, lim }) {
  const rooms = drive?.rooms || [];
  const canRooms = lim?.rooms !== false;
  const canMsgs = lim?.notify !== false;
  return (
    <div>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 26 }}>
        <TallyStat label="Waiting" v={s.wait} color={k.mid} />
        <TallyStat label="With a recruiter" v={s.active} color={k.coral} />
        <TallyStat label="Selected" v={s.selected} color={k.teal} />
        <TallyStat label="On hold" v={s.onhold} color={k.gold} />
        <TallyStat label="Rejected" v={s.rejected} color={k.red} />
      </div>
      {!!rooms.length && (
        <div style={{ marginBottom: 18 }}>
          <Head title="Rooms today" action={canRooms ? <button onClick={() => setTab("rooms")} style={link}>Manage rooms <ArrowRight size={12} /></button> : null} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
            {rooms.map((r) => {
              const who = occupantOf(drive, r.id);
              return (
                <div key={r.id} style={{ ...box, padding: "14px 16px", background: who ? k.coralDim : "#fff" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: k.faint, letterSpacing: .6, textTransform: "uppercase" }}>{r.name}</div>
                  <div style={{ fontFamily: dsp, fontSize: 16, fontWeight: 700, marginTop: 4 }}>{r.interviewer || "Unassigned"}</div>
                  <div style={{ fontSize: 12, color: who ? k.coral : k.mid, marginTop: 8, fontWeight: 600 }}>
                    {who ? `${who.token} · ${roundLabel(drive.rounds || [], who)}` : "Free"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: canMsgs ? "1.35fr 1fr" : "1fr", gap: 18 }} className="g2">
        <div style={{ ...box, padding: 20 }}>
          <Head title="The queue right now" action={<button onClick={() => setTab("queue")} style={link}>Open queue <ArrowRight size={12} /></button>} />
          {!active.length && !wait.length ? <Blank text="Nobody has checked in. Switch to the candidate side and join this drive." /> : (
            <div>
              {active.map((x) => (
                <div key={x.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: k.coralDim, borderRadius: 10, marginBottom: 6, gap: 10 }}>
                  <div>
                    <TokenChip token={x.token} name={x.name} size={32} pulse={x.state === "calling"} />
                    <div style={{ fontSize: 11.5, color: k.ink2, marginTop: 4 }}>{x.room ? `${x.room.name} · ${x.room.interviewer}` : "No room"} · {roundLabel(drive.rounds || [], x)}</div>
                  </div>
                  <Pill tone="coral">{x.state === "calling" ? "Calling" : "In interview"}</Pill>
                </div>
              ))}
              {wait.slice(0, 5).map((x, i) => (
                <div key={x.id} style={{ display: "flex", alignItems: "center", padding: "9px 12px", borderTop: i || active.length ? `1px solid ${k.line}` : "none" }}>
                  <TokenChip token={x.token} name={x.name} size={28} />
                </div>
              ))}
            </div>
          )}
        </div>
        {canMsgs && (
        <div style={{ ...box, padding: 20 }}>
          <Head title="Messages sent" action={<button onClick={() => setTab("msgs")} style={link}>All <ArrowRight size={12} /></button>} />
          {!msgs.length ? <Blank text="Messages go out as candidates move." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {msgs.slice(0, 4).map((m) => (
                <div key={m.id} style={{ fontSize: 12.5 }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 3 }}><Pill tone={m.ch === "WhatsApp" ? "teal" : "grey"}>{m.ch}</Pill><span style={{ color: k.mid }}>{m.name}</span></div>
                  <div style={{ color: k.ink2, lineHeight: 1.45 }}>{m.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

function TallyStat({ label, v, color }) {
  return (
    <div style={{ ...box, padding: "14px 18px", minWidth: 130 }}>
      <div style={{ fontSize: 11.5, color: k.mid, fontWeight: 600, marginBottom: 7 }}>{label}</div>
      <div style={{ fontFamily: typ, fontSize: 24, fontWeight: 700, color, letterSpacing: -0.5 }}>{v}</div>
    </div>
  );
}

function Screen({ gate, desk, left, active, wait, eta, brand, clientName, branch, role, credit = "on" }) {
  const name = (brand?.name || "").trim() || "Walk-in";
  const accent = brand?.color || k.coral;
  const logo = brand?.logo || "letter";
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <HallBrand name={name} color={accent} logo={logo} sub={clientName || null} size={32} credit={credit} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 30 }} className="g2">
        <div>
          <div style={{ ...box, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, border: `2px solid ${accent}` }}>
            <OrgLogo name={name} color={accent} logo={logo} size={40} />
            <div style={{ fontFamily: dsp, fontWeight: 800, fontSize: 16, textAlign: "center", lineHeight: 1.25 }}>{clientName ? `${name} · ${clientName}` : name}</div>
            {role ? <div style={{ fontSize: 12, color: k.mid, textAlign: "center" }}>{role}</div> : null}
            {branch ? <div style={{ fontSize: 11.5, color: k.faint }}>{branch}</div> : null}
            <div style={{ fontSize: 10.5, color: accent, fontFamily: typ, letterSpacing: 1, fontWeight: 700, marginTop: 4 }}>GATE · PRINT THIS</div>
            <img src={gateQr(gate, 165)} width={165} height={165} alt="Printed GATE QR — identifies the walk-in" />
            <div style={{ fontFamily: typ, fontSize: 16, fontWeight: 700, letterSpacing: 1.5 }}>{gate}</div>
            <div style={{ fontSize: 11, color: k.mid, textAlign: "center", lineHeight: 1.45 }}>Never expires. Finds the walk-in — does not check anyone in.</div>
            {credit === "on" && <div style={{ fontSize: 11, fontWeight: 700, color: k.coral }}>Powered by TokenHire</div>}
            {credit === "tiny" && <div style={{ fontSize: 9, color: k.faint }}>TokenHire</div>}
          </div>
          <div style={{ ...box, marginTop: 10, padding: "12px 10px", textAlign: "center", background: `${accent}14` }}>
            <div style={{ fontSize: 10.5, color: k.mid, fontFamily: typ, letterSpacing: 1, marginBottom: 4 }}>DESK · TV ONLY</div>
            <div style={{ fontFamily: typ, fontSize: 22, fontWeight: 700, letterSpacing: 3, color: k.ink }}>DESK-{desk}</div>
            <div style={{ fontSize: 11, color: k.faint, fontFamily: typ, marginTop: 4 }}>ROTATES IN {left}s · proves you're in the room</div>
          </div>
          <div style={{ fontSize: 11.5, color: k.faint, marginTop: 14, lineHeight: 1.5, textAlign: "center" }}>Names hidden here. Recruiters see full profiles.</div>
        </div>
        <div style={{ ...box, overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", borderBottom: `2px solid ${accent}`, fontFamily: typ, fontSize: 11, letterSpacing: 1.2, color: accent, fontWeight: 700 }}>NOW CALLING</div>
          {!active.length ? <Blank text="Nobody is being called yet." /> : active.map((x) => (
            <div key={x.id} style={{ padding: 18, display: "flex", alignItems: "center", gap: 16, background: `${accent}18`, borderBottom: `1px solid ${k.line}` }}>
              <TokenChip token={x.token} name={mask(x.name)} size={52} color={accent} pulse />
            </div>
          ))}
          <div style={{ padding: "12px 18px", borderTop: `1px solid ${k.line}`, borderBottom: `1px solid ${k.line}`, fontFamily: typ, fontSize: 11, letterSpacing: 1.2, color: k.ink2, background: k.cream2 }}>UP NEXT — {wait.length} WAITING</div>
          {wait.slice(0, 9).map((x, i) => (
            <div key={x.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px", padding: "11px 18px", borderBottom: `1px solid ${k.line}`, alignItems: "center" }}>
              <TokenChip token={x.token} name={mask(x.name)} size={32} color={accent} muted />
              <span style={{ fontFamily: typ, fontSize: 12.5, color: i === 0 ? accent : k.faint, textAlign: "right" }}>~{eta(x)}m</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Queue({ rows, eta, move, decide, rounds, saveNote, rooms = [], callTo, sendToRound }) {
  const phone = useNarrow();
  const [q, setQ] = useState("");
  const [fExp, setFExp] = useState("All");
  const [fRound, setFRound] = useState("All");
  const [fState, setFState] = useState("All");
  const [noteFor, setNoteFor] = useState(null);
  const label = { wait: ["grey", "Waiting"], calling: ["coral", "Calling"], interviewing: ["coral", "In interview"], selected: ["teal", "Selected"], rejected: ["red", "Rejected"], onhold: ["gold", "On hold"], absent: ["grey", "Absent"] };
  const stateName = (v) => ({ All: "All", wait: "Waiting", calling: "Calling", interviewing: "In interview", selected: "Selected", rejected: "Rejected", onhold: "On hold", absent: "Absent" }[v] || v);
  const needle = q.trim().toLowerCase();
  const list = rows.slice()
    .filter((x) => !needle || [x.name, x.token, x.phone, x.email].some((v) => String(v || "").toLowerCase().includes(needle)))
    .filter((x) => fExp === "All" || x.expBand === fExp)
    .filter((x) => fRound === "All" || String(x.roundIdx) === fRound)
    .filter((x) => fState === "All" || x.state === fState)
    .sort((a, b) => a.at - b.at);
  const filtered = !!needle || fExp !== "All" || fRound !== "All" || fState !== "All";
  const quickStates = [["All", "All"], ["wait", "Waiting"], ["interviewing", "In interview"], ["selected", "Selected"]];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10, alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 5, flex: "1 1 220px", minWidth: 200, maxWidth: 340 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: k.faint, textTransform: "uppercase", letterSpacing: .5 }}>Search</span>
          <span style={{ position: "relative", display: "block" }}>
            <Search size={15} color={k.faint} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Name, token, or phone"
              style={{ ...input, padding: "9px 12px 9px 36px" }}
            />
          </span>
        </label>
        <FilterSelect label="Experience" value={fExp} setValue={setFExp} options={["All", ...EXP_BANDS]} />
        <FilterSelect label="Round" value={fRound} setValue={setFRound} options={["All", ...rounds.map((r, i) => String(i))]} render={(v) => (v === "All" ? "All" : rounds[Number(v)]?.name)} />
        <FilterSelect label="Status" value={fState} setValue={setFState} options={["All", "wait", "calling", "interviewing", "selected", "rejected", "onhold", "absent"]} render={stateName} />
        <span style={{ fontSize: 13, color: k.mid, marginLeft: "auto", paddingBottom: 10, whiteSpace: "nowrap" }}>
          {list.length} of {rows.length} shown
          {filtered && <button type="button" onClick={() => { setQ(""); setFExp("All"); setFRound("All"); setFState("All"); }} style={{ ...textLink, marginLeft: 10 }}>Clear</button>}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        {quickStates.map(([v, lab]) => (
          <button key={v} type="button" onClick={() => setFState(v)} style={{
            padding: "6px 13px", borderRadius: R.pill, cursor: "pointer", fontFamily: bdy, fontSize: 12.5,
            border: `1px solid ${fState === v ? k.coral : k.line}`,
            background: fState === v ? k.coralDim : "#fff", color: fState === v ? k.coral : k.ink2, fontWeight: fState === v ? 600 : 500,
          }}>{lab}</button>
        ))}
      </div>

      {phone ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!list.length && <Blank text="Nobody matches these filters." />}
          {list.map((x) => {
            const noteCount = Object.values(x.notes || {}).filter(Boolean).length;
            return (
              <div key={x.id} style={{ ...box, padding: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <TokenTile token={x.token} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{x.name}</div>
                    <div style={{ fontSize: 12, color: k.mid, marginTop: 2, fontFamily: typ }}>{x.phone}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      <Pill tone={label[x.state]?.[0]}>{label[x.state]?.[1]}</Pill>
                      <Pill tone="grey">{roundLabel(rounds, x)}</Pill>
                      {x.expBand && <Pill tone={x.expBand === "Fresher" ? "grey" : "coral"}>{x.expBand}</Pill>}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                  {x.state === "wait" && <ActionSelect label="Call to room" options={(rooms || []).map((r) => ({ value: r.id, label: `${r.name} · ${r.interviewer || "—"}` }))} onPick={(id) => callTo(x.id, id)} />}
                  {x.state === "calling" && <><Btn onClick={() => move(x.id, "interviewing")}>Start</Btn><Btn q onClick={() => move(x.id, "absent")}>Absent</Btn></>}
                  {["calling", "interviewing"].includes(x.state) && <OutcomeBtns cand={x} rounds={rounds} decide={decide} />}
                  {x.state === "onhold" && <Btn onClick={() => move(x.id, "wait")}>Back to queue</Btn>}
                  {!isTerminal(x.state) && <ActionSelect label="Send to round" options={rounds.map((r, i) => ({ value: String(i), label: r.name }))} onPick={(v) => sendToRound(x.id, Number(v))} />}
                  <Btn q onClick={() => setNoteFor(x)}>Notes{noteCount ? ` (${noteCount})` : ""}</Btn>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
      <div style={{ ...box, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 1000 }}>
          <thead><tr style={{ background: k.cream2 }}>{["No.", "Candidate", "Experience", "Round", "Status", "Actions"].map((h) => <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, letterSpacing: .6, color: k.mid, fontWeight: 700, textTransform: "uppercase", borderBottom: `1px solid ${k.line}` }}>{h}</th>)}</tr></thead>
          <tbody>
            {!list.length && <tr><td colSpan={7}><Blank text="Nobody matches these filters." /></td></tr>}
            {list.map((x) => {
              const noteCount = Object.values(x.notes || {}).filter(Boolean).length;
              return (
                <tr key={x.id} style={{ borderBottom: `1px solid ${k.line}` }}>
                  <td style={cell}><TokenTile token={x.token} size={32} /></td>
                  <td style={cell}>
                    <div style={{ fontWeight: 600 }}>{x.name}</div>
                    <div style={{ fontSize: 12, color: k.faint, display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: typ }}>{x.phone}</span>
                      {x.linkedin && <a href={x.linkedin} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, color: k.coral, textDecoration: "none" }}><Linkedin size={11} />Profile</a>}
                    </div>
                    {x.resume && <button onClick={() => alert(`In production: downloads ${x.name}'s resume from encrypted storage. The download is logged.`)} style={{ ...ghostSm, marginTop: 7, fontSize: 11.5, padding: "5px 10px" }}><Download size={11} />{x.resume}</button>}
                  </td>
                  <td style={cell}><Pill tone={x.expBand === "Fresher" ? "grey" : "coral"}>{x.expBand || "—"}</Pill></td>
                  <td style={cell}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{roundLabel(rounds, x)}</div>
                    <div style={{ fontSize: 11.5, color: k.faint, marginTop: 2 }}>{inARound(x) ? `${x.roundIdx + 1} of ${rounds.length}` : "After check-in"}</div>
                  </td>
                  <td style={cell}><Pill tone={label[x.state]?.[0]}>{label[x.state]?.[1]}</Pill></td>
                  <td style={{ ...cell }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                      {x.state === "wait" && <ActionSelect label="Call to room" options={(rooms || []).map((r) => ({ value: r.id, label: `${r.name} · ${r.interviewer || "—"}` }))} onPick={(id) => callTo(x.id, id)} />}
                      {x.state === "calling" && <><Btn onClick={() => move(x.id, "interviewing")}>Start</Btn><Btn q onClick={() => move(x.id, "absent")}>Absent</Btn></>}
                      {["calling", "interviewing"].includes(x.state) && <OutcomeBtns cand={x} rounds={rounds} decide={decide} />}
                      {x.state === "onhold" && <Btn onClick={() => move(x.id, "wait")}>Back to queue</Btn>}
                      {!isTerminal(x.state) && <ActionSelect label="Send to round" options={rounds.map((r, i) => ({ value: String(i), label: r.name }))} onPick={(v) => sendToRound(x.id, Number(v))} />}
                      <Btn q onClick={() => setNoteFor(x)}>Notes{noteCount ? ` (${noteCount})` : ""}</Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {noteFor && <NotesPanel cand={rows.find((r) => r.id === noteFor.id) || noteFor} rounds={rounds} onClose={() => setNoteFor(null)} saveNote={saveNote} />}
    </div>
  );
}

function FilterSelect({ label, value, setValue, options, render }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 148 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: k.faint, textTransform: "uppercase", letterSpacing: .5 }}>{label}</span>
      <select value={value} onChange={(e) => setValue(e.target.value)} style={{ ...input, padding: "9px 12px", appearance: "auto", fontSize: 13, width: "auto", minWidth: 148 }}>
        {options.map((o) => <option key={o} value={o}>{render ? render(o) : o}</option>)}
      </select>
    </label>
  );
}

function NotesPanel({ cand, rounds, onClose, saveNote }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(11,16,32,.45)", zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, maxWidth: "100%", background: "#fff", height: "100%", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: dsp, fontSize: 21, fontWeight: 700 }}>{cand.name}</div>
            <div style={{ marginTop: 8 }}><TokenChip token={cand.token} name={`${cand.expBand || ""} · ${cand.phone}`} size={28} muted /></div>
          </div>
          <button onClick={onClose} style={{ ...ghostSm, padding: "6px 12px" }}>Close</button>
        </div>
        <div style={{ background: k.coralDim, borderRadius: 12, padding: "10px 14px", fontSize: 12.5, color: k.coral, margin: "18px 0 22px" }}>
          Private to your team. Candidates never see these notes.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {rounds.map((r, i) => {
            const assigned = inARound(cand);
            const done = assigned && i < cand.roundIdx, current = assigned && i === cand.roundIdx;
            return (
              <div key={r.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? k.coral : current ? "#fff" : k.cream2, border: `2px solid ${done || current ? k.coral : k.line}`,
                  }}>
                    {done && <Check size={12} color="#fff" />}
                  </div>
                  <span style={{ fontFamily: dsp, fontSize: 15.5, fontWeight: 700, color: done || current ? k.ink : k.faint }}>{r.name}</span>
                  {current && <Pill tone="coral">CURRENT</Pill>}
                </div>
                <textarea
                  value={cand.notes?.[r.id] || ""}
                  onChange={(e) => saveNote(cand.id, r.id, e.target.value)}
                  placeholder={`Notes from ${r.name.toLowerCase()}…`}
                  rows={3}
                  style={{ ...input, resize: "vertical", fontFamily: bdy, fontSize: 13.5, background: i > cand.roundIdx ? k.cream2 : "#fff" }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BrandingTab({ brand, setBrand, drive, org }) {
  const hall = (brand.name || "").trim() || org?.short || org?.name || drive.company;
  const accent = brand.color || org?.color || k.coral;
  const logo = brand.logo || org?.logo || "letter";
  const patch = (partial) => setBrand({ name: hall, color: accent, logo, ...brand, ...partial });
  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, margin: "0 0 5px" }}>Location branding</h1>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 22px", lineHeight: 1.6 }}>
        Applies across this {isAgencyOrg(org) ? "agency" : "campus"} — GATE, waiting TV, and check-in.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }} className="g2">
        <div>
          <div style={{ ...box, padding: 22, marginBottom: 18 }}>
            <Field label="Display name">
              <input value={brand.name || ""} onChange={(e) => patch({ name: e.target.value })} style={input} placeholder={org?.short || org?.name} />
            </Field>
            <div style={{ height: 14 }} />
            <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 8 }}>Logo</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {LOGO_PRESETS.map((p) => (
                <button key={p.id} type="button" onClick={() => patch({ logo: p.id })} style={{ padding: 6, borderRadius: 10, border: `2px solid ${logo === p.id ? accent : k.line}`, background: "#fff", cursor: "pointer" }}>
                  <OrgLogo name={hall} color={accent} logo={p.id} size={32} />
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: k.mid, fontWeight: 600, marginBottom: 9 }}>Primary color</div>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              {BRAND_COLORS.map((c) => (
                <button key={c.hex} onClick={() => patch({ color: c.hex })} title={c.name} style={{
                  width: 34, height: 34, borderRadius: "50%", background: c.hex, cursor: "pointer",
                  border: accent === c.hex ? `3px solid ${k.ink}` : "3px solid transparent",
                }} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: k.faint, letterSpacing: .5, textTransform: "uppercase", marginBottom: 10 }}>Waiting TV</div>
          <div style={{ background: "#0F1116", borderRadius: 14, padding: 22 }}>
            <HallBrand name={hall} color={accent} logo={logo} light sub={clientOf(drive) || null} credit={planLimits(org).credit} />
            <div style={{ background: "#fff", borderRadius: 10, padding: 16, marginTop: 16 }}>
              <TokenChip token="W-014" name="R···l" size={40} color={accent} />
              <div style={{ fontSize: 11.5, color: k.mid, marginTop: 8 }}>{drive.role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoundsTab({ rounds, setRounds }) {
  const [name, setName] = useState("");
  const add = () => { if (!name.trim()) return; setRounds([...rounds, { id: `r${Date.now()}`, name: name.trim() }]); setName(""); };
  const remove = (id) => setRounds(rounds.filter((r) => r.id !== id));
  const rename = (id, v) => setRounds(rounds.map((r) => (r.id === id ? { ...r, name: v } : r)));
  const swap = (i, j) => { if (j < 0 || j >= rounds.length) return; const n = [...rounds]; [n[i], n[j]] = [n[j], n[i]]; setRounds(n); };
  return (
    <div style={{ maxWidth: 620 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, margin: "0 0 5px" }}>Interview rounds</h1>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 22px", lineHeight: 1.55 }}>Calling someone to a room starts the first round. Pass moves them to the next; Select on the last round is the same-day selected outcome. Reject ends them immediately. On hold stays available. Each round has its own private notes.</p>
      <div style={{ ...box, overflow: "hidden", marginBottom: 18 }}>
        {rounds.map((r, i) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderTop: i ? `1px solid ${k.line}` : "none" }}>
            <span style={{ fontFamily: typ, fontSize: 13, color: k.faint, width: 22 }}>{i + 1}</span>
            <input value={r.name} onChange={(e) => rename(r.id, e.target.value)} style={{ ...input, flex: 1 }} />
            <button onClick={() => swap(i, i - 1)} disabled={i === 0} style={{ ...ghostSm, opacity: i === 0 ? .35 : 1, padding: "7px 11px" }}>↑</button>
            <button onClick={() => swap(i, i + 1)} disabled={i === rounds.length - 1} style={{ ...ghostSm, opacity: i === rounds.length - 1 ? .35 : 1, padding: "7px 11px" }}>↓</button>
            <button onClick={() => remove(r.id)} disabled={rounds.length <= 1} style={{ ...ghostSm, opacity: rounds.length <= 1 ? .35 : 1, padding: "7px 11px", color: k.red }}>Remove</button>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 9 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add a round — e.g. Versant test" style={{ ...input, flex: 1 }} />
        <button onClick={add} style={solidSm}><Plus size={15} /> Add</button>
      </div>
    </div>
  );
}

function RoomsTab({ rooms, setRooms, org, setOrgs, drive }) {
  const [name, setName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [invite, setInvite] = useState("");
  const recruiters = recruitersOf(org);
  const pickName = (email) => {
    const m = (org.members || []).find((x) => memberEmail(x).toLowerCase() === email.toLowerCase());
    return m ? memberName(m) : email.split("@")[0];
  };
  const add = () => {
    if (!name.trim() || planLimits(org).rooms === false) return;
    const email = recruiterEmail;
    setRooms([...rooms, { id: `rm${Date.now()}`, name: name.trim(), interviewer: email ? pickName(email) : "", recruiterEmail: email || null }]);
    setName("");
  };
  const remove = (id) => setRooms(rooms.filter((r) => r.id !== id));
  const rename = (id, v) => setRooms(rooms.map((r) => (r.id === id ? { ...r, name: v } : r)));
  const assign = (id, email) => setRooms(rooms.map((r) => (r.id === id ? { ...r, recruiterEmail: email || null, interviewer: email ? pickName(email) : "" } : r)));
  function inviteRecruiter() {
    const v = invite.trim();
    if (!v || !setOrgs) return;
    if ((org.members || []).length >= planLimits(org).seats) { setInvite(""); return; }
    if ((org.members || []).some((m) => memberEmail(m).toLowerCase() === v.toLowerCase())) { setInvite(""); return; }
    setOrgs((p) => p.map((o) => (o.id === org.id ? { ...o, members: [...(o.members || []), { email: v, role: "recruiter" }] } : o)));
    setInvite("");
    setRecruiterEmail(v);
  }
  const busy = (roomId) => occupantOf(drive, roomId);
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontFamily: dsp, fontSize: 23, fontWeight: 700, margin: "0 0 5px" }}>Rooms and interviewers</h1>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 22px", lineHeight: 1.55 }}>Each desk is a room plus a recruiter from your company team. Call to room assigns that desk and starts round 1 on the slip. Pass moves them to the next round; reject takes them out immediately.</p>
      <div style={{ ...box, overflow: "hidden", marginBottom: 18 }}>
        {!rooms.length && <Blank text="No rooms yet. Add one below." />}
        {rooms.map((r, i) => {
          const who = busy(r.id);
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderTop: i ? `1px solid ${k.line}` : "none", flexWrap: "wrap" }}>
              <span style={{ fontFamily: typ, fontSize: 13, color: k.faint, width: 22 }}>{i + 1}</span>
              <input value={r.name} onChange={(e) => rename(r.id, e.target.value)} style={{ ...input, flex: "1 1 140px", minWidth: 120 }} />
              <select value={r.recruiterEmail || ""} onChange={(e) => assign(r.id, e.target.value)} style={{ ...input, flex: "1 1 180px", minWidth: 160, appearance: "auto" }}>
                <option value="">Unassigned</option>
                {recruiters.map((m) => <option key={memberEmail(m)} value={memberEmail(m)}>{memberName(m)} · {memberEmail(m)}</option>)}
              </select>
              {who ? <Pill tone="coral">{who.token}</Pill> : <Pill tone="grey">FREE</Pill>}
              <button onClick={() => remove(r.id)} style={{ ...ghostSm, padding: "7px 11px", color: k.red }}>Remove</button>
            </div>
          );
        })}
      </div>
      {planLimits(org).rooms !== false && (
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 18 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Room name — e.g. Room 6" style={{ ...input, flex: "1 1 160px" }} />
        <select value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} style={{ ...input, flex: "1 1 180px", appearance: "auto" }}>
          <option value="">Assign recruiter…</option>
          {recruiters.map((m) => <option key={memberEmail(m)} value={memberEmail(m)}>{memberName(m)}</option>)}
        </select>
        <button onClick={add} style={solidSm}><Plus size={15} /> Add room</button>
      </div>
      )}
      <div style={{ ...box, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Add a recruiter to the team</div>
        <div style={{ fontSize: 12.5, color: k.mid, marginBottom: 10, lineHeight: 1.5 }}>They can sign in with this email (same company password) and appear in the room assignment list.</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={invite} onChange={(e) => setInvite(e.target.value)} onKeyDown={(e) => e.key === "Enter" && inviteRecruiter()} placeholder="recruiter@yourcompany.com" style={{ ...input, flex: 1, minWidth: 180 }} />
          <button onClick={inviteRecruiter} style={outlineSm}>Add recruiter</button>
        </div>
      </div>
    </div>
  );
}

function Msgs({ msgs }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 13.5, color: k.mid, margin: "0 0 16px" }}>Only the 15-minute “you’re up soon” WhatsApp. No extra message types — not called, selected, or rejected.</p>
      {!msgs.length && <Blank text="No 15-minute nudges sent yet." />}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m) => (
          <div key={m.id} style={{ ...box, padding: 14, borderLeft: `3px solid ${m.ch === "WhatsApp" ? k.teal : k.mid}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5 }}><Pill tone={m.ch === "WhatsApp" ? "teal" : "grey"}>{m.ch}</Pill><span style={{ color: k.ink2 }}>{m.name}</span><span style={{ fontFamily: typ, color: k.faint, fontSize: 11.5 }}>{m.to}</span></span>
              <span style={{ fontFamily: typ, fontSize: 11.5, color: k.faint }}>{new Date(m.at).toLocaleTimeString()}</span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Result({ s, drive }) {
  const cs = drive?.candidates || [];
  const waited = cs.filter((x) => x.calledAt && x.at).map((x) => (x.calledAt - x.at) / 60000);
  const interviewed = cs.filter((x) => x.calledAt && x.decidedAt).map((x) => (x.decidedAt - x.calledAt) / 60000);
  const avg = (a) => (a.length ? Math.round(a.reduce((p, n) => p + n, 0) / a.length) : 0);
  const avgWait = avg(waited), avgInt = avg(interviewed);
  const data = [{ n: "Walked in", v: s.all }, { n: "Interviewed", v: s.seen }, { n: "Selected", v: s.selected }, { n: "On hold", v: s.onhold }, { n: "Rejected", v: s.rejected }];
  const cols = [k.faint, k.mid, k.teal, k.gold, k.red];

  function extractCsv() {
    const rounds = drive.rounds || [];
    const header = ["token", "name", "phone", "email", "experience", "current_round", "status", ...rounds.map((r) => `round_${r.name.replace(/\s+/g, "_")}`), "notes"];
    const lines = cs.map((x) => {
      const outcomes = rounds.map((r) => x.roundOutcomes?.[r.id] || "");
      const notes = Object.values(x.notes || {}).filter(Boolean).join(" | ");
      return [x.token, x.name, x.phone, x.email || "", x.expBand || x.exp || "", roundLabel(rounds, x), x.state, ...outcomes, notes].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });
    downloadFile(`${drive.company.replace(/\s+/g, "_")}_walkin_extract.csv`, [header.join(","), ...lines].join("\n"), "text/csv");
  }
  function sendAts() {
    const payload = {
      drive: { id: drive.id, company: drive.company, role: drive.role, city: drive.city, venue: drive.venue, date: drive.date },
      exportedAt: new Date().toISOString(),
      candidates: cs.map((x) => ({
        token: x.token, name: x.name, phone: x.phone, email: x.email || "", experience: x.expBand || x.exp, linkedin: x.linkedin || "", resume: x.resume || "",
        status: x.state,
        rounds: (drive.rounds || []).map((r, i) => ({ name: r.name, outcome: x.roundOutcomes?.[r.id] || (i < x.roundIdx ? "selected" : ""), notes: x.notes?.[r.id] || "" })),
      })),
    };
    downloadFile(`${drive.company.replace(/\s+/g, "_")}_ats_handoff.json`, JSON.stringify(payload, null, 2), "application/json");
    alert("Extract ready. In production this posts to Greenhouse, Lever, or your ATS — round-by-round selected / rejected / on hold, with notes. Offers stay in the ATS, not at the walk-in desk.");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        <div>
          <h1 style={{ fontFamily: dsp, fontSize: 22, fontWeight: 700, letterSpacing: -0.4, margin: "0 0 5px" }}>Day-end report</h1>
          <p style={{ color: k.mid, fontSize: 13.5, margin: 0 }}>Offers and joining happen in your ATS later. This extract is who walked in, which rounds they cleared, and who is selected, rejected, or on hold.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={extractCsv} style={outline}><Download size={14} /> CSV extract</button>
          <button onClick={sendAts} style={solid}><Send size={14} /> Send to ATS</button>
        </div>
      </div>
      <div style={{ ...box, padding: 22, margin: "18px 0" }}>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 4, right: 22 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="n" width={92} tick={{ fill: k.ink2, fontSize: 12.5, fontFamily: bdy }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(20,23,28,.03)" }} contentStyle={{ border: `1px solid ${k.line}`, borderRadius: 6, fontSize: 12.5, fontFamily: bdy }} />
              <Bar dataKey="v" radius={[0, 3, 3, 0]} barSize={20}>{data.map((_, i) => <Cell key={i} fill={cols[i]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <RateCard label="Walked in → interviewed" v={`${pc(s.seen, s.all)}%`} />
        <RateCard label="Interviewed → selected" v={`${pc(s.selected, s.seen)}%`} />
        <RateCard label="On hold" v={`${pc(s.onhold, s.all)}%`} />
        <RateCard label="Rejected" v={`${pc(s.rejected, s.all)}%`} />
        <RateCard label="Absent when called" v={`${pc(s.absent, s.all)}%`} />
        <RateCard label="Average wait" v={`${avgWait} min`} />
        <RateCard label="Average interview" v={`${avgInt} min`} />
      </div>
    </div>
  );
}
function RateCard({ label, v, color }) {
  return (
    <div style={{ ...box, padding: "14px 18px", flex: 1, minWidth: 150 }}>
      <div style={{ fontSize: 11.5, color: k.mid, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 700, color: color || k.ink, fontFamily: typ }}>{v}</div>
    </div>
  );
}

/* ---- shared primitives ---- */
function TopBar({ back, title, accent, tabs, tab, setTab }) {
  return (
    <div className="chrome-wrap" style={{ ...chromeStrip, padding: "10px 16px 12px" }}>
      <div className="chrome-inner" style={{ maxWidth: 720, margin: "0 auto", ...chromeBox, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={back} style={{ ...iconBtn, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}><ArrowLeft size={15} /> Back</button>
          <span style={{ width: 1, height: 16, background: k.line }} />
          <Wordmark size={15} />
          <Pill tone={accent === k.teal ? "teal" : "coral"}>{title}</Pill>
        </div>
        {tabs && (
          <div className="tabscroll" style={{ padding: "0 10px", display: "flex", gap: 2, background: k.cream2, borderTop: `1px solid ${k.line}` }}>
            {tabs.map(([id, label]) => { const on = tab === id; return <button key={id} onClick={() => setTab(id)} style={{ padding: "12px 14px", minHeight: 44, border: "none", background: "none", cursor: "pointer", fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? accent : k.mid, borderBottom: `2px solid ${on ? accent : "transparent"}`, fontFamily: bdy, whiteSpace: "nowrap" }}>{label}</button>; })}
          </div>
        )}
      </div>
    </div>
  );
}
const box = { background: "#fff", border: `1px solid ${k.line}`, borderRadius: R.inner };
const input = { padding: "11px 14px", borderRadius: 10, border: `1px solid ${k.line}`, background: "#fff", color: k.ink, fontSize: 13.5, outline: "none", fontFamily: bdy, width: "100%" };
const cell = { padding: "12px 16px", verticalAlign: "top" };
const link = { display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: k.teal, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: bdy };
const solid = { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: R.pill, border: "none", background: k.coral, color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: bdy, whiteSpace: "nowrap" };
const solidTeal = { ...solid, background: k.teal };
const solidSm = { ...solid, padding: "9px 18px", fontSize: 13.5 };
const outlineSm = { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: R.pill, border: `1.5px solid ${k.coral}`, background: "#fff", color: k.coral, fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: bdy, whiteSpace: "nowrap" };
const textLink = { background: "none", border: "none", color: k.mid, fontWeight: 500, fontSize: 12.5, cursor: "pointer", fontFamily: bdy, padding: 0, textDecoration: "underline", textUnderlineOffset: 3 };
const outline = { display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: R.pill, border: `1.5px solid ${k.line}`, background: "#fff", color: k.ink, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: bdy, whiteSpace: "nowrap" };
const ghostSm = { display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 15px", borderRadius: R.pill, border: `1px solid ${k.line}`, background: "#fff", color: k.ink2, fontWeight: 600, fontSize: 12.5, cursor: "pointer", fontFamily: bdy };
const iconBtn = { background: "none", border: "none", cursor: "pointer", color: k.mid, padding: 0, fontFamily: bdy };
function Field({ label, children }) { return <label style={{ display: "flex", flexDirection: "column", gap: 5 }}><span style={{ fontSize: 12, color: k.mid, fontWeight: 600 }}>{label}</span>{children}</label>; }
function CitySelect({ value, onChange, allowAll, placeholder = "Select a city" }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...input, appearance: "auto" }}>
      {allowAll && <option value="">All cities</option>}
      {!allowAll && !value && <option value="">{placeholder}</option>}
      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}
function SectionLabel({ children }) { return <div style={{ fontFamily: typ, fontSize: 10.5, letterSpacing: 1.2, color: k.mid, marginBottom: 9, fontWeight: 700 }}>{children.toString().toUpperCase()}</div>; }
function Blank({ text }) { return <div style={{ color: k.faint, fontSize: 13.5, padding: "30px 16px", textAlign: "center", lineHeight: 1.5 }}>{text}</div>; }
function Head({ title, action }) { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><span style={{ fontFamily: dsp, fontSize: 15, fontWeight: 700 }}>{title}</span>{action}</div>; }
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function StatusPill({ status }) {
  if (status === "live") return <Pill tone="teal">LIVE NOW</Pill>;
  if (status === "upcoming") return <Pill tone="gold">UPCOMING</Pill>;
  return <Pill tone="grey">CLOSED</Pill>;
}
function Pill({ children, tone }) {
  const m = { grey: [k.cream2, k.mid], teal: [k.tealDim, k.teal], coral: [k.coralDim, k.coral], red: [k.redDim, k.red], gold: [k.goldDim, k.gold] }[tone] || [k.cream2, k.mid];
  return <span style={{ background: m[0], color: m[1], fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 3, fontFamily: typ, letterSpacing: .3, whiteSpace: "nowrap" }}>{children}</span>;
}
function Btn({ children, onClick, q }) {
  return <button onClick={onClick} style={{ padding: "6px 11px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: bdy, border: q ? `1px solid ${k.line}` : "none", background: q ? "#fff" : k.coral, color: q ? k.ink2 : "#fff", whiteSpace: "nowrap" }}>{children}</button>;
}
function ActionSelect({ label, options, onPick }) {
  return (
    <select
      value=""
      onChange={(e) => { const v = e.target.value; if (v) onPick(v); }}
      style={{ padding: "6px 10px", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: bdy, border: `1px solid ${k.line}`, background: "#fff", color: k.ink2, maxWidth: 160 }}
    >
      <option value="" disabled>{label}</option>
      {(options || []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
