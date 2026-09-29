import bcrypt from "bcryptjs";
import { EXP_BANDS, ROTATE, cityNameOf, code, docsOf, isWorkEmail, memberEmail, memberRole, scrubDrive, todayStr } from "../src/lib/helpers.js";
import { blankSeed, boardOrgs, seedBoardDrives, seedDrive, seedExtraDrives, seedMegaDrive, seedOrgs, seedPlanDemoDrives } from "../src/data/seed.js";
import { driveStatus } from "../src/lib/status.js";
import { mode, readState, settled, writeState } from "./persist.js";

export const storageMode = mode;

function fresh() {
  return {
    version: 1,
    startedAt: Date.now(),
    deskLeft: ROTATE,
    orgs: [...seedOrgs(), ...boardOrgs()],
    drives: [seedMegaDrive(), seedDrive(), ...seedExtraDrives(), ...seedPlanDemoDrives(), ...seedBoardDrives()],
    sessions: {},
    resets: {},
    candidates: {},
    pilots: [],
  };
}

const SCHEDULE_KEYS = ["date", "endDate", "startTime", "endTime"];

// Seeded demo drives are dated around the moment the server starts. On a restart the
// stored copies would all read as wrapped, so their dates are refreshed. Board listings
// are regenerated whole (keeping anyone who really joined); company demo drives keep
// their queue and only get new hours.
function refreshSeeds(stored, seeds) {
  const seedById = new Map(seeds.map((d) => [d.id, d]));
  const out = stored.map((d) => {
    const seed = seedById.get(d.id);
    if (!seed) return d;
    seedById.delete(d.id);
    if (seed.board) {
      const real = (d.candidates || []).filter((c) => !c.synthetic);
      return { ...seed, candidates: [...seed.candidates, ...real], seq: Math.max(seed.seq, d.seq || 0) };
    }
    if (driveStatus(d) !== "wrapped" || d.wrappedAt) return d;
    const next = { ...d };
    for (const key of SCHEDULE_KEYS) next[key] = seed[key];
    delete next.status;
    return next;
  });
  return [...out, ...seedById.values()];
}

function merge(raw) {
  if (!raw) return fresh();
  const base = fresh();
  const next = { ...base, ...raw, sessions: raw.sessions || {}, resets: raw.resets || {}, candidates: raw.candidates || {}, pilots: raw.pilots || [] };
  const orgIds = new Set((next.orgs || []).map((o) => o.id));
  next.orgs = [...(next.orgs || []), ...base.orgs.filter((o) => !orgIds.has(o.id))];
  const boardIds = new Set(base.drives.filter((d) => d.board).map((d) => d.id));
  const stored = (next.drives || []).filter((d) => !(String(d.id).startsWith("d_board_") && !boardIds.has(d.id)));
  next.drives = refreshSeeds(stored, base.drives).map(scrubDrive);
  return next;
}

let state = fresh();
let hydrated = null;

// Every serverless invocation may start cold, so requests wait on this once before
// touching state. Without it a cold start would serve the seed data and then
// overwrite the real queue.
export function ready() {
  if (!hydrated) {
    hydrated = readState()
      .then((raw) => { state = merge(raw); writeState(state); })
      .catch(() => { state = fresh(); });
  }
  return hydrated;
}

export const flushWrites = settled;

function save() {
  writeState(state);
}

export function getState() {
  return state;
}

/**
 * Staff sessions may replace org and drive configuration. Candidate devices share the
 * same endpoint but are limited to the queue itself, so a phone can check itself in
 * without being able to rewrite another company's drives, plan, or team.
 */
export function setSnapshot({ orgs, drives, candidates }, { scope = "queue" } = {}) {
  if (scope === "all") {
    if (Array.isArray(orgs)) {
      // Clients never receive credentials, so they cannot echo them back — carry the
      // stored hash forward instead of letting a round-trip erase it.
      const creds = new Map(state.orgs.map((o) => [o.id, { password: o.password, passwordHash: o.passwordHash }]));
      state.orgs = orgs.map((o) => {
        const prev = creds.get(o.id) || {};
        const next = { ...o };
        delete next.hasPassword;
        if (prev.passwordHash) next.passwordHash = prev.passwordHash;
        else delete next.passwordHash;
        if (prev.password) next.password = prev.password;
        else delete next.password;
        return next;
      });
    }
    if (Array.isArray(drives)) {
      const prevById = new Map(state.drives.map((d) => [d.id, d]));
      const incomingIds = new Set(drives.map((d) => d.id));
      // A pending company listing is not in the public snapshot, so a staff save
      // must not drop it — or the confirmation link dies before the inbox opens it.
      const kept = state.drives.filter((d) => d.listingOnly && d.listingPending && !incomingIds.has(d.id));
      state.drives = [
        ...drives.map((d) => {
          const prev = prevById.get(d.id);
          const next = scrubDrive(d);
          if (!prev) return next;
          if (prev.listCode) next.listCode = prev.listCode;
          if (prev.listedEmail) next.listedEmail = prev.listedEmail;
          if (prev.confirmToken) next.confirmToken = prev.confirmToken;
          if (prev.listingPending) next.listingPending = true;
          if (prev.listedBy && !next.listedBy) next.listedBy = prev.listedBy;
          if (prev.listingOnly) next.listingOnly = true;
          return next;
        }),
        ...kept,
      ];
    }
  } else if (Array.isArray(drives)) {
    const incoming = new Map(drives.map((d) => [d.id, d]));
    state.drives = state.drives.map((d) => {
      const next = incoming.get(d.id);
      if (!next || !Array.isArray(next.candidates)) return d;
      return { ...d, candidates: next.candidates };
    });
  }
  if (candidates && typeof candidates === "object") state.candidates = candidates;
  state.version += 1;
  save();
  return publicSnapshot();
}

function listingFields(body) {
  const company = String(body.company || "").trim().slice(0, 80);
  const role = String(body.role || "").trim().slice(0, 80);
  const city = String(body.city || "").trim();
  const venue = String(body.venue || "").trim().slice(0, 140);
  const date = String(body.date || "").trim();
  const endDate = String(body.endDate || body.date || "").trim();
  const email = String(body.email || "").trim().slice(0, 120);
  const jd = String(body.jd || "").trim().slice(0, 800);
  const expNeeded = (Array.isArray(body.expNeeded) ? body.expNeeded : []).filter((x) => EXP_BANDS.includes(x));
  const docs = docsOf(body.docs);
  return { company, role, city, venue, date, endDate, email, jd, expNeeded, docs };
}

function ownsListing(drive, staff) {
  if (!drive || !staff?.org) return false;
  if (drive.orgId === staff.org.id) return true;
  const email = String(staff.email || "").trim().toLowerCase();
  return !!email && String(drive.listedEmail || "").trim().toLowerCase() === email;
}

function listingShape(existing, fields, extra) {
  return {
    ...(existing || blankSeed({ id: `d_list_${Date.now().toString(36)}` })),
    listingOnly: true,
    listedEmail: fields.email,
    visibility: extra.listingPending ? "private" : "public",
    status: fields.date <= todayStr() && fields.endDate >= todayStr() ? "live" : "upcoming",
    company: fields.company,
    role: fields.role,
    city: fields.city,
    venue: fields.venue,
    date: fields.date,
    endDate: fields.endDate,
    jd: fields.jd,
    expNeeded: fields.expNeeded,
    docs: fields.docs,
    brand: { name: fields.company, color: "#2F5BFF", logo: "letter" },
    candidates: existing?.candidates || [],
    ...extra,
  };
}

export function addPilot(body = {}) {
  const clip = (v, n) => String(v ?? "").trim().replace(/\s+/g, " ").slice(0, n);
  const pilot = {
    name: clip(body.name, 80),
    email: clip(body.email, 120).toLowerCase(),
    company: clip(body.company, 100),
    phone: clip(body.phone, 20).replace(/[^\d+ ]/g, ""),
    city: clip(body.city, 60),
    size: clip(body.size, 20),
    roles: clip(body.roles, 200),
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(body.date || "")) ? body.date : "",
    notes: String(body.notes ?? "").trim().slice(0, 1000),
  };
  if (!pilot.name || !pilot.email || !pilot.company) return { ok: false, error: "Please fill in your name, work email and company." };
  if (!isWorkEmail(pilot.email)) return { ok: false, error: "Use a work email." };
  state.pilots = [...(state.pilots || []), { id: `pl_${Date.now()}_${code(4)}`, at: Date.now(), ...pilot }].slice(-500);
  save();
  return { ok: true };
}

// Only a signed-in company account can put a walk-in on the board.
// The company name and email come from that account, not from the form.
export function publishListing(body = {}, staff = null) {
  if (!staff?.org || !staff.email) {
    return { ok: false, error: "Sign in to the company account. Only that account can list a walk-in." };
  }
  if (!isWorkEmail(staff.email)) {
    return { ok: false, error: "Use a work email." };
  }
  const codeIn = String(body.listCode || "").trim().toUpperCase();
  if (body.lookup) {
    const drive = state.drives.find((d) => d.listingOnly && d.listCode === codeIn);
    if (!ownsListing(drive, staff)) return { ok: false, error: "No listing with that code on this company account." };
    return {
      ok: true,
      listing: {
        company: drive.company || "",
        role: drive.role || "",
        city: drive.city || "",
        venue: drive.venue || "",
        date: drive.date || "",
        endDate: drive.endDate || drive.date || "",
        email: drive.listedEmail || "",
        jd: drive.jd || "",
        expNeeded: drive.expNeeded || [],
        docs: drive.docs || [],
      },
    };
  }
  const fields = listingFields(body);
  fields.company = staff.org.name;
  fields.email = staff.email;
  if (!fields.role || !fields.venue || !fields.date) {
    return { ok: false, error: "Fill in role, city, venue, and dates." };
  }
  fields.city = cityNameOf(fields.city);
  if (!fields.city) return { ok: false, error: "Enter a city. A name that is not in the list is fine." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date) || !/^\d{4}-\d{2}-\d{2}$/.test(fields.endDate)) {
    return { ok: false, error: "Pick a start date and an end date." };
  }
  if (fields.endDate < fields.date) return { ok: false, error: "The end date is before the start date." };
  if (fields.endDate < todayStr()) return { ok: false, error: "That walk-in has already ended." };

  const existing = codeIn ? state.drives.find((d) => d.listingOnly && d.listCode === codeIn) : null;
  if (codeIn && !existing) return { ok: false, error: "No listing with that code." };
  if (existing && !ownsListing(existing, staff)) return { ok: false, error: "That listing belongs to another company account." };
  const listCode = existing?.listCode || code(6);
  const next = listingShape(existing, fields, {
    listCode,
    orgId: staff.org.id,
    listingPending: false,
    listedBy: "account",
  });
  delete next.confirmToken;
  if (existing) state.drives = state.drives.map((d) => (d.id === existing.id ? next : d));
  else state.drives = [next, ...state.drives];
  state.version += 1;
  save();
  const drive = publicSnapshot().drives.find((d) => d.id === next.id);
  return { ok: true, listCode, drive };
}

export function confirmListing(token) {
  const raw = String(token || "").trim();
  if (!raw) return { ok: false, error: "That confirmation link is not valid." };
  const drive = state.drives.find((d) => d.listingOnly && d.confirmToken === raw);
  if (!drive) return { ok: false, error: "That confirmation link is not valid." };
  const next = { ...drive, listingPending: false, visibility: "public", listedBy: "email" };
  delete next.confirmToken;
  state.drives = state.drives.map((d) => (d.id === drive.id ? next : d));
  state.version += 1;
  save();
  return { ok: true, drive: publicSnapshot().drives.find((d) => d.id === next.id) };
}

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

// Derived from the clock rather than a timer: serverless instances don't share
// setInterval state, so every instance (and the TV, and each phone) must be able to
// compute the same DESK code independently for the current rotation window.
function deriveDesk(seed, window) {
  let h = 2166136261;
  for (const ch of `${seed}:${window}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  let out = "";
  for (let i = 0; i < 6; i++) {
    h = Math.imul(h ^ (h >>> 13), 16777619);
    out += ALPHABET[(h >>> 8) % ALPHABET.length];
  }
  return out;
}

export function deskWindow(at = Date.now()) {
  const period = ROTATE * 1000;
  return { index: Math.floor(at / period), left: Math.ceil((period - (at % period)) / 1000) };
}

function healUnboundDemoRooms() {
  state.drives = (state.drives || []).map((d) => {
    if (d.id !== "d_vistaar_50" || (d.rooms || []).some((r) => r.roundId)) return d;
    const byId = { rm1: "r1", rm2: "r1", rm3: "r1", rm4: "r2", rm5: "r3" };
    return { ...d, rooms: (d.rooms || []).map((r) => ({ ...r, roundId: r.roundId || byId[r.id] || "" })) };
  });
}

export function publicSnapshot() {
  healUnboundDemoRooms();
  const { index, left } = deskWindow();
  return {
    ok: true,
    version: state.version,
    startedAt: state.startedAt,
    deskLeft: left,
    // This endpoint is read by every candidate phone, so credentials never ride along.
    orgs: state.orgs.map(({ password, passwordHash, ...rest }) => ({ ...rest, hasPassword: !!(password || passwordHash) })),
    drives: state.drives.filter((d) => !(d.listingOnly && d.listingPending)).map((d) => {
      const pub = { ...scrubDrive(d), desk: deriveDesk(d.gate || d.id, index) };
      delete pub.listCode;
      delete pub.listedEmail;
      delete pub.confirmToken;
      if (pub.listingOnly) {
        delete pub.gate;
        delete pub.host;
        delete pub.desk;
      }
      return pub;
    }),
    now: Date.now(),
  };
}

export function findOrgByEmail(email) {
  const em = (email || "").trim().toLowerCase();
  if (!em) return null;
  return state.orgs.find((o) => (o.email || "").toLowerCase() === em || (o.members || []).some((m) => memberEmail(m).toLowerCase() === em)) || null;
}

export function roleFor(org, email) {
  const em = (email || "").trim().toLowerCase();
  const mem = (org.members || []).find((m) => memberEmail(m).toLowerCase() === em);
  return mem ? memberRole(mem) : "recruiter";
}

export function createSession(org, email, role) {
  const token = `th_${code(8)}${code(8)}`;
  state.sessions[token] = { orgId: org.id, email, role, at: Date.now() };
  save();
  return token;
}

export const SESSION_TTL = 12 * 60 * 60 * 1000; // one hiring day

export function sessionOf(token) {
  if (!token) return null;
  const s = state.sessions[token];
  if (!s) return null;
  if (Date.now() - s.at > SESSION_TTL) {
    delete state.sessions[token];
    save();
    return null;
  }
  const org = state.orgs.find((o) => o.id === s.orgId);
  if (!org) return null;
  return { ...s, org };
}

export function dropSession(token) {
  if (token && state.sessions[token]) {
    delete state.sessions[token];
    save();
  }
}

export function upsertOrg(org) {
  const i = state.orgs.findIndex((o) => o.id === org.id);
  if (i >= 0) state.orgs[i] = org;
  else state.orgs.push(org);
  state.version += 1;
  save();
  return org;
}

export function setReset(email, codeStr) {
  state.resets[email.trim().toLowerCase()] = { code: codeStr, exp: Date.now() + 15 * 60 * 1000 };
  save();
  return state.resets[email.trim().toLowerCase()];
}

export function consumeReset(email, codeStr) {
  const rec = state.resets[(email || "").trim().toLowerCase()];
  if (!rec || rec.exp < Date.now() || rec.code !== codeStr) return false;
  delete state.resets[email.trim().toLowerCase()];
  save();
  return true;
}

// Seeded demo orgs ship with a plaintext password so the published demo logins keep
// working. Any real password is stored only as a bcrypt hash, and legacy plaintext is
// upgraded in place the first time it is used.
export async function setOrgPassword(org, plain) {
  org.passwordHash = await bcrypt.hash(plain, 10);
  delete org.password;
  upsertOrg(org);
  return org;
}

export async function checkOrgPassword(org, plain) {
  if (!plain) return false;
  if (org.passwordHash) return bcrypt.compare(plain, org.passwordHash);
  if (org.password && org.password === plain) {
    await setOrgPassword(org, plain);
    return true;
  }
  return false;
}

export function saveCandidate(profile) {
  if (!profile?.phone) return profile;
  state.candidates[profile.phone] = profile;
  save();
  return profile;
}

export function candidateByPhone(phone) {
  return state.candidates[phone] || null;
}

export const DEMO_RESET = "482911";
