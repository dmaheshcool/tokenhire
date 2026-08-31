import { DEFAULT_ROOMS, DEFAULT_ROUNDS, DOC_OPTIONS, EXP_BANDS, MIN, QUALIFICATIONS, code, inNudgeWindow, newGate, newHost, nudgeText, todayStr } from "../lib/helpers.js";

export function seedDrive() {
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

export function seedOrgs() {
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
      email: "monthly@tokenhire.demo", password: "demo1234", plan: "pack5", billingCycle: "month",
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

/* Showcase drive: 50 people at one Vistaar walk-in, mid-morning snapshot */
export function seedMegaDrive() {
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
    { id: "rm1", name: "Room 1", interviewer: "Priya", recruiterEmail: "priya@vistaar.com", roundId: "r1" },
    { id: "rm2", name: "Room 2", interviewer: "Arun", recruiterEmail: "arun@vistaar.com", roundId: "r1" },
    { id: "rm3", name: "Room 3", interviewer: "Neha", recruiterEmail: "neha@vistaar.com", roundId: "r1" },
    { id: "rm4", name: "Room 4", interviewer: "Kavya", recruiterEmail: "kavya@vistaar.com", roundId: "r2" },
    { id: "rm5", name: "Room 5", interviewer: "Rohit", recruiterEmail: "rohit@vistaar.com", roundId: "r3" },
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
    ...[
      { state: "interviewing", roundIdx: 0, room: rooms[0] },
      { state: "interviewing", roundIdx: 0, room: rooms[1] },
      { state: "interviewing", roundIdx: 1, room: rooms[3] },
      { state: "interviewing", roundIdx: 2, room: rooms[4] },
      { state: "interviewing", roundIdx: 0, room: rooms[2] },
    ],
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
export function demoWaiters(n = 3) {
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

export function blankSeed(extra) {
  return {
    host: newHost(), gate: newGate(), desk: code(6), visibility: "public", status: "upcoming",
    candidates: [], msgs: [], seq: 0, rounds: DEFAULT_ROUNDS.map((r) => ({ ...r })),
    rooms: DEFAULT_ROOMS.map((r) => ({ ...r })),
    ...extra,
  };
}
export function seedExtraDrives() {
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

export function seedPlanDemoDrives() {
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

