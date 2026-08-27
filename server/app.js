import express from "express";
import {
  candidateByPhone, consumeReset, createSession, DEMO_RESET, dropSession, findOrgByEmail,
  getState, publicSnapshot, roleFor, saveCandidate, sessionOf, setReset, setSnapshot, tickDesk, upsertOrg,
} from "./db.js";

const app = express();
app.use(express.json({ limit: "4mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

setInterval(tickDesk, 1000);

function bearer(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : (req.query.token || req.body?.token || "");
}

function requireStaff(req, res, next) {
  const s = sessionOf(bearer(req));
  if (!s) return res.status(401).json({ ok: false, error: "Sign in required." });
  req.staff = s;
  next();
}

app.get("/api/health", (_req, res) => {
  const s = getState();
  res.json({
    ok: true,
    service: "tokenhire-api",
    version: s.version,
    uptimeSec: Math.round((Date.now() - s.startedAt) / 1000),
    orgs: s.orgs.length,
    drives: s.drives.length,
    sessions: Object.keys(s.sessions).length,
    deskLeft: s.deskLeft,
  });
});

app.get("/api/snapshot", (_req, res) => res.json(publicSnapshot()));

app.put("/api/snapshot", (req, res) => {
  const s = sessionOf(bearer(req));
  if (!s && req.body?.requireAuth) return res.status(401).json({ ok: false, error: "Sign in required." });
  res.json(setSnapshot(req.body || {}));
});

app.post("/api/auth/login", (req, res) => {
  const email = (req.body?.email || "").trim();
  const password = req.body?.password || "";
  const org = findOrgByEmail(email);
  if (!org) return res.status(401).json({ ok: false, error: "No company account found with that email." });
  if (org.password !== password) return res.status(401).json({ ok: false, error: "Incorrect password." });
  const role = roleFor(org, email);
  const token = createSession(org, email, role);
  res.json({ ok: true, token, orgId: org.id, role, email, org: publicOrg(org) });
});

app.post("/api/auth/signup", (req, res) => {
  const { companyName, email, password, kind } = req.body || {};
  if (!companyName?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ ok: false, error: "Fill in all fields." });
  }
  if (findOrgByEmail(email)) {
    return res.status(409).json({ ok: false, error: "An account with that email already exists — sign in instead." });
  }
  const agency = kind === "agency";
  const name = companyName.trim();
  const org = {
    id: `org_${Date.now()}`,
    name,
    short: name.split(" ")[0],
    kind: agency ? "agency" : "captive",
    color: agency ? "#0F8A6B" : "#341C8A",
    logo: agency ? "bars" : "ring",
    wash: agency ? "#E6F5F0" : "#EEE8F8",
    email: email.trim(),
    password,
    plan: "trial",
    verified: false,
    members: [{ email: email.trim(), role: "recruiter" }],
    clients: agency ? [] : [{ id: "cl_own", name: "Own hiring" }],
    branches: [],
  };
  upsertOrg(org);
  const token = createSession(org, email.trim(), "recruiter");
  res.json({ ok: true, token, orgId: org.id, role: "recruiter", email: email.trim(), org: publicOrg(org), verify: true });
});

app.post("/api/auth/forgot", (req, res) => {
  const email = (req.body?.email || "").trim();
  const org = findOrgByEmail(email);
  if (!org) return res.status(404).json({ ok: false, error: "No company account found with that email." });
  const reset = setReset(email, DEMO_RESET);
  res.json({ ok: true, demoCode: reset.code, hint: "Demo reset code (would be emailed)." });
});

app.post("/api/auth/reset", (req, res) => {
  const { email, code: c, password } = req.body || {};
  if (!consumeReset(email, c)) return res.status(400).json({ ok: false, error: "Invalid or expired reset code." });
  const org = findOrgByEmail(email);
  if (!org) return res.status(404).json({ ok: false, error: "No company account found." });
  org.password = password;
  upsertOrg(org);
  res.json({ ok: true });
});

app.post("/api/auth/verify", requireStaff, (req, res) => {
  const c = (req.body?.code || "").trim();
  if (c !== "618204") return res.status(400).json({ ok: false, error: "That email code is not valid. Demo code is 618204." });
  req.staff.org.verified = true;
  upsertOrg(req.staff.org);
  res.json({ ok: true, org: publicOrg(req.staff.org) });
});

app.get("/api/auth/me", requireStaff, (req, res) => {
  const { org, email, role, orgId } = req.staff;
  res.json({ ok: true, email, role, orgId, org: publicOrg(org) });
});

app.post("/api/auth/logout", (req, res) => {
  dropSession(bearer(req));
  res.json({ ok: true });
});

app.post("/api/auth/invite/accept", (req, res) => {
  const email = (req.body?.email || "").trim();
  const password = req.body?.password || "";
  const org = findOrgByEmail(email);
  if (!org) return res.status(404).json({ ok: false, error: "No invite found for that email. Ask your admin to add you under Team." });
  if (password && org.password !== password && !(org.members || []).some((m) => memberEmailSafe(m) === email.toLowerCase())) {
    /* invited members share org password in this demo */
  }
  if (org.password !== password && password !== "demo1234") {
    return res.status(401).json({ ok: false, error: "Use the org demo password, or demo1234 for invited seats." });
  }
  const role = roleFor(org, email);
  const token = createSession(org, email, role);
  res.json({ ok: true, token, orgId: org.id, role, email, org: publicOrg(org) });
});

app.get("/api/org", requireStaff, (req, res) => res.json({ ok: true, org: publicOrg(req.staff.org) }));

app.patch("/api/org", requireStaff, (req, res) => {
  const patch = req.body || {};
  const org = req.staff.org;
  const next = {
    ...org,
    name: patch.name ?? org.name,
    short: patch.short ?? org.short,
    color: patch.color ?? org.color,
    logo: patch.logo ?? org.logo,
    kind: patch.kind ?? org.kind,
    email: patch.email ?? org.email,
    password: patch.password || org.password,
    members: patch.members ?? org.members,
    clients: patch.clients ?? org.clients,
    branches: patch.branches ?? org.branches,
    plan: patch.plan ?? org.plan,
  };
  upsertOrg(next);
  res.json({ ok: true, org: publicOrg(next) });
});

app.get("/api/candidate/:phone", (req, res) => {
  const p = candidateByPhone(req.params.phone);
  if (!p) return res.status(404).json({ ok: false, error: "No candidate profile for that phone." });
  res.json({ ok: true, profile: p });
});

app.put("/api/candidate", (req, res) => {
  const profile = saveCandidate(req.body || {});
  res.json({ ok: true, profile });
});

app.get("/api/routes", (_req, res) => {
  res.json({
    ok: true,
    pages: [
      "/login", "/signup", "/forgot-password", "/reset-password", "/verify", "/invite",
      "/app", "/app/join", "/app/hiring",
      "/org", "/org/team", "/org/sites", "/org/brand", "/org/billing", "/org/settings", "/org/security",
      "/status", "/developers",
    ],
    api: [
      "GET /api/health", "GET /api/snapshot", "PUT /api/snapshot",
      "POST /api/auth/login", "POST /api/auth/signup", "POST /api/auth/forgot", "POST /api/auth/reset",
      "POST /api/auth/verify", "GET /api/auth/me", "POST /api/auth/logout", "POST /api/auth/invite/accept",
      "GET /api/org", "PATCH /api/org", "GET /api/candidate/:phone", "PUT /api/candidate",
    ],
  });
});

function publicOrg(org) {
  if (!org) return null;
  const { password, ...rest } = org;
  return { ...rest, hasPassword: !!password };
}

function memberEmailSafe(m) {
  return (typeof m === "string" ? m : m.email || "").toLowerCase();
}

export default app;
