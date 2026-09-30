import express from "express";
import { isWorkEmail } from "../src/lib/helpers.js";
import { makeHourLimiter, lookupDelayMs } from "../src/lib/email-limit.js";
import { passwordIssue } from "../src/lib/password.js";
import { decodeDataUrl, resumeName } from "../src/lib/resume.js";
import {
  addPilot, candidateByPhone, checkOrgPassword, consumeMagic, consumeReset, consumeVerify, createSession, DEMO_RESET, dropSession, dropSessionsForOrg, findOrgByEmail,
  confirmListing, consumeDeskPass, deskPassValid, driveWithResumes, findDriveForDeskPass, flushWrites, getState, issueDeskPass, issueMagic, issueVerify, publicSnapshot, publishListing, ready, roleFor, saveCandidate, sessionOf, setOrgPassword, setReset,
  setSnapshot, storageMode, storedResume, upsertOrg, normalPhone, startReminder, stopReminder,
} from "./db.js";
import { lobbyPayload, locationResult, logLobbyFail, validateLobbyCode, findDriveForCode } from "./lobby.js";
import { lobbyCooling, lobbyFail, lobbyRateKeys } from "./lobby-limit.js";
import { normalizeLobbyInput } from "../src/lib/lobby.js";
import { computeLiveStats } from "../src/lib/live-stats.js";
import { exportFile, exportStatus, readResumeSign, startExport } from "./export.js";

const app = express();
app.use(express.json({ limit: "12mb" }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
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

function isProdEnv() {
  return process.env.NODE_ENV === "production";
}

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.trim()) return xf.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function cookieOf(req, name) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(i + 1).trim()); } catch { return part.slice(i + 1).trim(); }
  }
  return "";
}

function bearer(req) {
  const h = req.headers.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  return req.query.token || req.body?.token || cookieOf(req, "th_session") || "";
}

const COOKIE_MAX = 30 * 24 * 60 * 60;
const emailLookupLimited = makeHourLimiter(10);

function attachSessionCookie(res, token) {
  const secure = isProdEnv() ? "; Secure" : "";
  res.append("Set-Cookie", `th_session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX}; SameSite=Lax${secure}`);
}

function clearSessionCookie(res) {
  res.append("Set-Cookie", "th_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
}

function delayLookup() {
  return new Promise((r) => setTimeout(r, lookupDelayMs()));
}

function sessionReply(res, org, email, role) {
  const token = createSession(org, email, role);
  attachSessionCookie(res, token);
  const body = { ok: true, orgId: org.id, role, email, org: publicOrg(org) };
  if (!isProdEnv()) body.token = token;
  return body;
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

let liveStatsCache = null;

app.get("/api/stats/live", (_req, res) => {
  const now = Date.now();
  if (liveStatsCache && now - liveStatsCache.at < 10_000) return res.json(liveStatsCache.body);
  const body = { ok: true, ...computeLiveStats(getState().drives, now) };
  liveStatsCache = { at: now, body };
  res.json(body);
});

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

app.post("/api/reminders/stop", async (req, res) => {
  const result = stopReminder(req.body || {});
  await flushWrites();
  res.json(result);
});

function siteOrigin(req) {
  const pinned = (process.env.VITE_PUBLIC_URL || "").replace(/\/+$/, "");
  if (pinned) return pinned;
  const ref = req.headers.origin || req.headers.referer;
  if (ref) {
    try { return new URL(ref).origin; } catch { /* ignore */ }
  }
  return apiOrigin(req);
}

app.get("/api/lobby/:driveId", (req, res) => {
  const drive = getState().drives.find((d) => d.id === req.params.driveId);
  if (!drive || drive.listingOnly) return res.status(404).json({ ok: false, error: "No walk-in on this screen." });
  const payload = lobbyPayload(drive, siteOrigin(req));
  res.json({ ok: true, display: payload.display, expiresAt: payload.expiresAt, secondsLeft: payload.secondsLeft, qrUrl: payload.qrUrl, serverNow: payload.serverNow });
});

app.post("/api/lobby/check", (req, res) => {
  const ip = String(req.ip || req.headers["x-forwarded-for"] || "local");
  const deviceId = String(req.body?.deviceId || "anon").slice(0, 80);
  const keys = lobbyRateKeys(ip, deviceId);
  if (keys.some((k) => lobbyCooling(k))) {
    return res.status(429).json({ ok: false, reason: "rate", error: "Too many wrong codes. Wait 60 seconds and try the code on the screen now." });
  }
  const raw = req.body?.code || req.body?.k || "";
  const methodHint = req.body?.method;
  let drive = getState().drives.find((d) => d.id === req.body?.driveId);
  if (!drive && methodHint === "desk_pass" && raw) {
    drive = findDriveForDeskPass(raw);
  }
  if (!drive && raw) {
    const six = normalizeLobbyInput(raw);
    const all = getState().drives;
    drive = findDriveForCode(all, six, Date.now(), undefined, { openOnly: true })?.drive
      || findDriveForCode(all, six, Date.now(), undefined, { openOnly: false })?.drive;
  }
  if (!drive) {
    keys.forEach(lobbyFail);
    logLobbyFail({ driveId: "", reason: "missing", windowOffset: null });
    return res.status(404).json({ ok: false, reason: "missing", error: "We couldn't find that walk-in. Try the code on the lobby screen, or ask the front desk for a pass." });
  }
  if (methodHint === "desk_pass") {
    if (!deskPassValid(drive.id, raw)) {
    keys.forEach(lobbyFail);
    logLobbyFail({ driveId: drive.id, reason: "expired", windowOffset: null });
      return res.status(400).json({ ok: false, reason: "expired", error: "That code has expired. Enter the code on the screen now." });
    }
    consumeDeskPass(drive.id, raw);
    const loc = locationResult(drive, req.body?.geo);
    if (drive.requireLocation && loc.location_verified !== true) {
      return res.status(400).json({ ok: false, reason: "location", error: "Ask the front desk for a pass.", location_verified: loc.location_verified });
    }
    return res.json({ ok: true, driveId: drive.id, method: "desk_pass", ...loc });
  }
  const result = validateLobbyCode({ drive, drives: getState().drives, input: raw });
  if (!result.ok) {
    keys.forEach(lobbyFail);
    logLobbyFail({ driveId: drive.id, reason: result.reason, windowOffset: result.windowOffset });
    return res.status(400).json({ ok: false, ...result });
  }
  const loc = locationResult(drive, req.body?.geo);
  if (drive.requireLocation && loc.location_verified !== true) {
    return res.status(400).json({ ok: false, reason: "location", error: "Ask the front desk for a pass.", location_verified: loc.location_verified });
  }
  const method = methodHint === "lobby_qr" ? "lobby_qr" : "typed_code";
  res.json({ ok: true, driveId: drive.id, method, windowOffset: result.windowOffset, ...loc });
});

app.post("/api/desk-pass", async (req, res) => {
  const drive = getState().drives.find((d) => d.id === req.body?.driveId);
  if (!drive) return res.status(404).json({ ok: false, error: "No drive." });
  const s = sessionOf(bearer(req));
  const pin = String(req.body?.pin || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const host = String(drive.host || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const staffOk = s && s.org?.id === drive.orgId;
  const pinOk = pin && host && pin === host;
  if (!staffOk && !pinOk) return res.status(401).json({ ok: false, error: "Sign in or use the Desk PIN." });
  const result = issueDeskPass(drive.id);
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

app.post("/api/auth/lookup", async (req, res) => {
  if (emailLookupLimited(clientIp(req))) {
    return res.status(429).json({ ok: false, error: "Too many tries. Try again later." });
  }
  await delayLookup();
  const email = (req.body?.email || "").trim();
  if (!isWorkEmail(email)) return res.status(400).json({ ok: false, error: "Use a work email." });
  const org = findOrgByEmail(email);
  if (!org) return res.json({ ok: true, status: "new" });
  if (org.verified === false) {
    issueVerify(email);
    return res.json({ ok: true, status: "unverified" });
  }
  res.json({ ok: true, status: "exists" });
});

app.post("/api/auth/login", async (req, res) => {
  const email = (req.body?.email || "").trim();
  const password = req.body?.password || "";
  const key = `login:${email.toLowerCase()}`;
  if (throttled(key)) return res.status(429).json({ ok: false, error: "Too many attempts. Wait a few minutes and try again." });
  const org = findOrgByEmail(email);
  if (org?.verified === false) return res.status(403).json({ ok: false, status: "unverified" });
  if (!org || !(await checkOrgPassword(org, password))) {
    return res.status(401).json({ ok: false, error: "Incorrect email or password." });
  }
  clearThrottle(key);
  const role = roleFor(org, email);
  await flushWrites();
  res.json(sessionReply(res, org, email, role));
});

app.post("/api/auth/signup", async (req, res) => {
  const { companyName, email, password, kind } = req.body || {};
  if (!companyName?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ ok: false, error: "Fill in all fields." });
  }
  if (!isWorkEmail(email)) {
    return res.status(400).json({ ok: false, error: "Use a work email." });
  }
  const issue = passwordIssue(password);
  if (issue === "short") return res.status(400).json({ ok: false, error: "Use 8 or more characters." });
  if (issue === "common") return res.status(400).json({ ok: false, error: "Choose a less common password." });
  if (findOrgByEmail(email)) {
    return res.status(409).json({ ok: false, error: "An account with that email already exists — sign in instead." });
  }
  const name = companyName.trim();
  const agency = kind === "agency";
  const org = {
    id: `org_${Date.now()}`,
    name,
    short: name.split(" ")[0],
    kind: agency ? "agency" : "captive",
    hireForAsked: true,
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
  const verifyToken = issueVerify(email.trim());
  await flushWrites();
  const body = { ok: true, orgId: org.id, role: "recruiter", email: email.trim(), org: publicOrg(org), verify: true };
  if (!isProdEnv()) body.verifyToken = verifyToken;
  res.json(body);
});

app.post("/api/auth/verify-resend", async (req, res) => {
  const email = (req.body?.email || "").trim();
  const org = findOrgByEmail(email);
  const body = { ok: true };
  if (org && org.verified === false) {
    const verifyToken = issueVerify(email);
    if (!isProdEnv()) body.verifyToken = verifyToken;
  }
  res.json(body);
});

app.post("/api/auth/verify-link", async (req, res) => {
  const email = consumeVerify(req.body?.token || "");
  if (!email) return res.status(400).json({ ok: false, error: "That link has expired. Request a new one." });
  const org = findOrgByEmail(email);
  if (!org) return res.status(400).json({ ok: false, error: "That link has expired. Request a new one." });
  org.verified = true;
  upsertOrg(org);
  const role = roleFor(org, email);
  await flushWrites();
  res.json(sessionReply(res, org, email, role));
});

app.post("/api/auth/magic-start", async (req, res) => {
  const email = (req.body?.email || "").trim();
  const org = findOrgByEmail(email);
  const body = { ok: true };
  if (org && org.verified !== false) {
    const magicToken = issueMagic(email);
    if (!isProdEnv()) body.magicToken = magicToken;
  }
  res.json(body);
});

app.post("/api/auth/magic-consume", async (req, res) => {
  const email = consumeMagic(req.body?.token || "");
  if (!email) return res.status(400).json({ ok: false, error: "That link has expired. Request a new one." });
  const org = findOrgByEmail(email);
  if (!org || org.verified === false) return res.status(400).json({ ok: false, error: "That link has expired. Request a new one." });
  const role = roleFor(org, email);
  await flushWrites();
  res.json(sessionReply(res, org, email, role));
});

app.post("/api/auth/forgot", (req, res) => {
  const email = (req.body?.email || "").trim();
  const org = findOrgByEmail(email);
  if (org) setReset(email, DEMO_RESET);
  const body = { ok: true };
  if (org && !isProdEnv()) body.demoCode = DEMO_RESET;
  res.json(body);
});

app.post("/api/auth/reset", async (req, res) => {
  const { email, code: c, password } = req.body || {};
  const issue = passwordIssue(password);
  if (issue === "short") return res.status(400).json({ ok: false, error: "Use at least 8 characters." });
  if (issue === "common") return res.status(400).json({ ok: false, error: "Choose a less common password." });
  if (!consumeReset(email, c)) return res.status(400).json({ ok: false, error: "Invalid or expired reset code." });
  const org = findOrgByEmail(email);
  if (!org) return res.status(400).json({ ok: false, error: "Invalid or expired reset code." });
  await setOrgPassword(org, password);
  await flushWrites();
  res.json({ ok: true });
});

app.post("/api/auth/verify", requireStaff, async (req, res) => {
  const c = (req.body?.code || "").trim();
  if (c !== "618204") return res.status(400).json({ ok: false, error: "That email code is not valid." });
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
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.post("/api/auth/logout-all", requireStaff, (req, res) => {
  dropSessionsForOrg(req.staff.orgId);
  clearSessionCookie(res);
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
  const demoSeat = !isProdEnv() && invited && password === "demo1234";
  const ok = (await checkOrgPassword(org, password)) || demoSeat;
  if (!ok) return res.status(401).json({ ok: false, error: "Incorrect email or password." });
  clearThrottle(key);
  const role = roleFor(org, email);
  await flushWrites();
  res.json(sessionReply(res, org, email, role));
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
    hireForAsked: patch.hireForAsked ?? org.hireForAsked,
    wash: patch.wash ?? org.wash,
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
  if (patch.password) {
    const issue = passwordIssue(patch.password);
    if (issue === "short") return res.status(400).json({ ok: false, error: "Use 8 or more characters." });
    if (issue === "common") return res.status(400).json({ ok: false, error: "Choose a less common password." });
    await setOrgPassword(next, patch.password);
  }
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
      "/company/start", "/company/welcome", "/forgot-password", "/reset-password", "/verify", "/invite",
      "/app/join", "/desk",
      "/app/today", "/app/drives", "/app/drives/new", "/app/venues", "/app/teams", "/app/talent", "/app/team", "/app/settings", "/app/billing",
      "/status", "/developers",
    ],
    api: [
      "GET /api/health", "GET /api/stats/live", "GET /api/snapshot", "PUT /api/snapshot", "POST /api/listings", "POST /api/listings/confirm", "POST /api/pilot",
      "POST /api/auth/lookup", "POST /api/auth/login", "POST /api/auth/signup", "POST /api/auth/forgot", "POST /api/auth/reset",
      "POST /api/auth/verify", "POST /api/auth/verify-link", "POST /api/auth/verify-resend", "POST /api/auth/magic-start", "POST /api/auth/magic-consume",
      "GET /api/auth/me", "POST /api/auth/logout", "POST /api/auth/logout-all", "POST /api/auth/invite/accept",
      "GET /api/org", "PATCH /api/org", "GET /api/candidate/:phone", "PUT /api/candidate",
      "POST /api/exports", "GET /api/exports/:id", "GET /api/exports/:id/file",
      "POST /api/lobby/check", "POST /api/reminders/start", "POST /api/reminders/stop",
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
