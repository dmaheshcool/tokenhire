import express from "express";
import { isWorkEmail } from "../src/lib/helpers.js";
import { decodeDataUrl, resumeName } from "../src/lib/resume.js";
import {
  addPilot, candidateByPhone, checkOrgPassword, consumeReset, createSession, DEMO_RESET, dropSession, findOrgByEmail,
  confirmListing, driveWithResumes, flushWrites, getState, publicSnapshot, publishListing, ready, roleFor, saveCandidate, sessionOf, setOrgPassword, setReset,
  setSnapshot, startCheckin, storageMode, storedResume, upsertOrg, normalPhone, startReminder, stopReminder, verifyCheckin, verifyReminder,
} from "./db.js";
import { exportFile, exportStatus, readResumeSign, startExport } from "./export.js";

const app = express();
app.use(express.json({ limit: "12mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

// A cold serverless instance holds only seed data until this resolves.
app.use(async (_req, res, next) => {
  try {
    await ready();
    next();
  } catch {
    res.status(503).json({ ok: false, error: "Store unavailable." });
  }
});

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

// Small in-memory throttle. Per-instance only, but enough to stop a password guessing
// loop from a single client; a real edge rate limit belongs in front of this.
const attempts = new Map();
function throttled(keyStr) {
  const now = Date.now();
  const rec = attempts.get(keyStr);
  if (!rec || now - rec.first > 10 * 60 * 1000) {
    attempts.set(keyStr, { first: now, n: 1 });
    return false;
  }
  rec.n += 1;
  return rec.n > 10;
}
function clearThrottle(keyStr) {
  attempts.delete(keyStr);
}
function looseThrottle(keyStr, max) {
  const now = Date.now();
  const rec = attempts.get(keyStr);
  if (!rec || now - rec.first > 10 * 60 * 1000) {
    attempts.set(keyStr, { first: now, n: 1 });
    return false;
  }
  rec.n += 1;
  return rec.n > max;
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
    deskLeft: publicSnapshot().deskLeft,
    storage: storageMode,
  });
});

app.get("/api/snapshot", (req, res) => {
  const snap = publicSnapshot();
  const only = req.query.drive;
  if (!only) return res.json(snap);
  // A candidate's phone needs one drive, not every org's entire queue.
  const drive = snap.drives.find((d) => d.id === only);
  res.json({ ...snap, drives: drive ? [drive] : [], orgs: snap.orgs.filter((o) => o.id === drive?.orgId) });
});

app.put("/api/snapshot", async (req, res) => {
  const staff = sessionOf(bearer(req));
  const snap = setSnapshot(req.body || {}, { scope: staff ? "all" : "queue" });
  await flushWrites();
  res.json(snap);
});

app.post("/api/listings", async (req, res) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "local";
  if (looseThrottle(`list:${ip}`, 40)) return res.status(429).json({ ok: false, error: "Too many listings from this network. Wait a few minutes." });
  const result = publishListing(req.body || {}, sessionOf(bearer(req)));
  if (!result.ok) return res.status(400).json(result);
  await flushWrites();
  res.json(result);
});

app.post("/api/pilot", async (req, res) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "local";
  if (looseThrottle(`pilot:${ip}`, 10)) return res.status(429).json({ ok: false, error: "Too many requests from this network. Try again in a few minutes." });
  const result = addPilot(req.body || {});
  if (!result.ok) return res.status(400).json(result);
  await flushWrites();
  res.json(result);
});

app.post("/api/reminders/start", async (req, res) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "local";
  const phone = normalPhone(req.body?.phone);
  if (looseThrottle(`remind-ip:${ip}`, 20) || (phone && looseThrottle(`remind:${phone}`, 3))) {
    return res.status(429).json({ ok: false, error: "Too many codes sent. Wait 10 minutes and try again." });
  }
  const result = startReminder(req.body || {});
  if (!result.ok) return res.status(400).json(result);
  await flushWrites();
  res.json(result);
});

app.post("/api/reminders/verify", async (req, res) => {
  const result = verifyReminder(req.body || {});
  if (!result.ok) return res.status(400).json(result);
  await flushWrites();
  res.json(result);
});

app.post("/api/reminders/stop", async (req, res) => {
  const result = stopReminder(req.body || {});
  await flushWrites();
  res.json(result);
});

app.post("/api/checkin/start", async (req, res) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "local";
  const phone = normalPhone(req.body?.phone);
  if (looseThrottle(`checkin-ip:${ip}`, 20) || (phone && looseThrottle(`checkin:${phone}`, 5))) {
    return res.status(429).json({ ok: false, error: "Too many codes sent. Wait 10 minutes and try again." });
  }
  const result = startCheckin(req.body || {});
  if (!result.ok) return res.status(400).json(result);
  await flushWrites();
  res.json(result);
});

app.post("/api/checkin/verify", async (req, res) => {
  const result = verifyCheckin(req.body || {});
  if (!result.ok) return res.status(400).json(result);
  await flushWrites();
  res.json(result);
});

function apiOrigin(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:5173";
  const proto = req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http");
  return `${proto}://${String(host).split(",")[0].trim()}`;
}

function sendResumeFile(res, rec, filename) {
  const decoded = decodeDataUrl(rec?.data);
  if (!decoded) return false;
  const name = String(filename || rec.name || "resume.pdf").replace(/[\r\n"]/g, "");
  res.setHeader("Content-Type", rec.type || decoded.type || "application/octet-stream");
  res.setHeader("Content-Disposition", `inline; filename="${name}"`);
  res.setHeader("Cache-Control", "private, max-age=300");
  res.send(Buffer.from(decoded.bytes));
  return true;
}

app.post("/api/exports", requireStaff, (req, res) => {
  const result = startExport({
    driveId: req.body?.driveId,
    template: req.body?.template,
    format: req.body?.format,
    origin: apiOrigin(req),
    orgId: req.staff.org.id,
  });
  if (!result.ok) return res.status(400).json(result);
  res.json(result);
});

app.get("/api/exports/:id", requireStaff, (req, res) => {
  const job = exportStatus(req.params.id, req.staff.org.id);
  if (!job) return res.status(404).json({ ok: false, error: "No export with that id." });
  res.json({ ok: true, ...job });
});

app.get("/api/exports/:id/file", requireStaff, (req, res) => {
  const job = exportFile(req.params.id, req.staff.org.id);
  if (!job) return res.status(404).json({ ok: false, error: "No export with that id." });
  if (job.pending) return res.status(409).json({ ok: false, error: "Still building." });
  res.setHeader("Content-Type", job.mime);
  res.setHeader("Content-Disposition", `attachment; filename="${job.filename}"`);
  res.send(Buffer.from(job.bytes));
});

app.get("/api/resumes/:driveId/:cid", requireStaff, (req, res) => {
  const drive = driveWithResumes((getState().drives || []).find((d) => d.id === req.params.driveId && d.orgId === req.staff.org.id));
  const cand = drive?.candidates?.find((c) => c.id === req.params.cid);
  const rec = cand ? storedResume(drive.id, cand) || cand.resume : null;
  if (!sendResumeFile(res, rec, resumeName(rec) || "resume.pdf")) return res.status(404).json({ ok: false, error: "No resume on file." });
});

app.get("/api/files/:token", (req, res) => {
  const parsed = readResumeSign(req.params.token);
  if (!parsed) return res.status(404).json({ ok: false, error: "That link has expired." });
  const drive = driveWithResumes((getState().drives || []).find((d) => d.id === parsed.driveId));
  const cand = drive?.candidates?.find((c) => c.id === parsed.candId);
  const rec = cand ? storedResume(drive.id, cand) || cand.resume : null;
  if (!sendResumeFile(res, rec, resumeName(rec) || "resume.pdf")) return res.status(404).json({ ok: false, error: "That link has expired." });
});

app.post("/api/listings/confirm", async (req, res) => {
  const result = confirmListing(req.body?.token);
  if (!result.ok) return res.status(400).json(result);
  await flushWrites();
  res.json(result);
});

app.post("/api/auth/login", async (req, res) => {
  const email = (req.body?.email || "").trim();
  const password = req.body?.password || "";
  const key = `login:${email.toLowerCase()}`;
  if (throttled(key)) return res.status(429).json({ ok: false, error: "Too many attempts. Wait a few minutes and try again." });
  const org = findOrgByEmail(email);
  if (!org) return res.status(401).json({ ok: false, error: "No company account found with that email." });
  if (!(await checkOrgPassword(org, password))) return res.status(401).json({ ok: false, error: "Incorrect password." });
  clearThrottle(key);
  const role = roleFor(org, email);
  const token = createSession(org, email, role);
  await flushWrites();
  res.json({ ok: true, token, orgId: org.id, role, email, org: publicOrg(org) });
});

app.post("/api/auth/signup", async (req, res) => {
  const { companyName, email, password, kind } = req.body || {};
  if (!companyName?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ ok: false, error: "Fill in all fields." });
  }
  if (!isWorkEmail(email)) {
    return res.status(400).json({ ok: false, error: "Use a work email." });
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
    plan: "setup",
    verified: false,
    members: [{ email: email.trim(), role: "recruiter" }],
    clients: agency ? [] : [{ id: "cl_own", name: "Own hiring" }],
    branches: [],
  };
  await setOrgPassword(org, password);
  const token = createSession(org, email.trim(), "recruiter");
  await flushWrites();
  res.json({ ok: true, token, orgId: org.id, role: "recruiter", email: email.trim(), org: publicOrg(org), verify: true });
});

app.post("/api/auth/forgot", (req, res) => {
  const email = (req.body?.email || "").trim();
  const org = findOrgByEmail(email);
  if (!org) return res.status(404).json({ ok: false, error: "No company account found with that email." });
  const reset = setReset(email, DEMO_RESET);
  res.json({ ok: true, demoCode: reset.code, hint: "Demo reset code (would be emailed)." });
});

app.post("/api/auth/reset", async (req, res) => {
  const { email, code: c, password } = req.body || {};
  if (!password || password.length < 8) return res.status(400).json({ ok: false, error: "Use at least 8 characters." });
  if (!consumeReset(email, c)) return res.status(400).json({ ok: false, error: "Invalid or expired reset code." });
  const org = findOrgByEmail(email);
  if (!org) return res.status(404).json({ ok: false, error: "No company account found." });
  await setOrgPassword(org, password);
  await flushWrites();
  res.json({ ok: true });
});

app.post("/api/auth/verify", requireStaff, async (req, res) => {
  const c = (req.body?.code || "").trim();
  if (c !== "618204") return res.status(400).json({ ok: false, error: "That email code is not valid. Demo code is 618204." });
  req.staff.org.verified = true;
  upsertOrg(req.staff.org);
  await flushWrites();
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

app.post("/api/auth/invite/accept", async (req, res) => {
  const email = (req.body?.email || "").trim();
  const password = req.body?.password || "";
  const key = `invite:${email.toLowerCase()}`;
  if (throttled(key)) return res.status(429).json({ ok: false, error: "Too many attempts. Wait a few minutes and try again." });
  const org = findOrgByEmail(email);
  if (!org) return res.status(404).json({ ok: false, error: "No invite found for that email. Ask your admin to add you under Team." });
  const invited = (org.members || []).some((m) => memberEmailSafe(m) === email.toLowerCase());
  const ok = (await checkOrgPassword(org, password)) || (invited && password === "demo1234");
  if (!ok) return res.status(401).json({ ok: false, error: "Use the org password, or demo1234 for invited demo seats." });
  clearThrottle(key);
  const role = roleFor(org, email);
  const token = createSession(org, email, role);
  await flushWrites();
  res.json({ ok: true, token, orgId: org.id, role, email, org: publicOrg(org) });
});

app.get("/api/org", requireStaff, (req, res) => res.json({ ok: true, org: publicOrg(req.staff.org) }));

app.patch("/api/org", requireStaff, async (req, res) => {
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
    members: patch.members ?? org.members,
    clients: patch.clients ?? org.clients,
    library: patch.library ?? org.library,
    branches: patch.branches ?? org.branches,
    plan: patch.plan ?? org.plan,
    billingCycle: patch.billingCycle ?? org.billingCycle,
    renewsOn: patch.renewsOn ?? org.renewsOn,
  };
  upsertOrg(next);
  if (patch.password) await setOrgPassword(next, patch.password);
  await flushWrites();
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
      "/app/join", "/desk",
      "/app/today", "/app/drives", "/app/drives/new", "/app/venues", "/app/teams", "/app/talent", "/app/team", "/app/settings", "/app/billing",
      "/status", "/developers",
    ],
    api: [
      "GET /api/health", "GET /api/snapshot", "PUT /api/snapshot", "POST /api/listings", "POST /api/listings/confirm", "POST /api/pilot",
      "POST /api/auth/login", "POST /api/auth/signup", "POST /api/auth/forgot", "POST /api/auth/reset",
      "POST /api/auth/verify", "GET /api/auth/me", "POST /api/auth/logout", "POST /api/auth/invite/accept",
      "GET /api/org", "PATCH /api/org", "GET /api/candidate/:phone", "PUT /api/candidate",
      "POST /api/exports", "GET /api/exports/:id", "GET /api/exports/:id/file",
      "POST /api/checkin/start", "POST /api/checkin/verify",
    ],
  });
});

function publicOrg(org) {
  if (!org) return null;
  const { password, passwordHash, ...rest } = org;
  return { ...rest, hasPassword: !!(passwordHash || password) };
}

function memberEmailSafe(m) {
  return (typeof m === "string" ? m : m.email || "").toLowerCase();
}

export default app;
