import bcrypt from "bcryptjs";
import { ROTATE, code, memberEmail, memberRole } from "../src/lib/helpers.js";
import { seedDrive, seedExtraDrives, seedMegaDrive, seedOrgs, seedPlanDemoDrives } from "../src/data/seed.js";
import { mode, readState, settled, writeState } from "./persist.js";

export const storageMode = mode;

function fresh() {
  return {
    version: 1,
    startedAt: Date.now(),
    deskLeft: ROTATE,
    orgs: seedOrgs(),
    drives: [seedMegaDrive(), seedDrive(), ...seedExtraDrives(), ...seedPlanDemoDrives()],
    sessions: {},
    resets: {},
    candidates: {},
  };
}

function merge(raw) {
  if (!raw) return fresh();
  return { ...fresh(), ...raw, sessions: raw.sessions || {}, resets: raw.resets || {}, candidates: raw.candidates || {} };
}

let state = fresh();
let hydrated = null;

// Every serverless invocation may start cold, so requests wait on this once before
// touching state. Without it a cold start would serve the seed data and then
// overwrite the real queue.
export function ready() {
  if (!hydrated) {
    hydrated = readState()
      .then((raw) => { state = merge(raw); if (!raw) writeState(state); })
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
    if (Array.isArray(drives)) state.drives = drives;
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

export function publicSnapshot() {
  const { index, left } = deskWindow();
  return {
    ok: true,
    version: state.version,
    startedAt: state.startedAt,
    deskLeft: left,
    // This endpoint is read by every candidate phone, so credentials never ride along.
    orgs: state.orgs.map(({ password, passwordHash, ...rest }) => ({ ...rest, hasPassword: !!(password || passwordHash) })),
    drives: state.drives.map((d) => ({ ...d, desk: deriveDesk(d.gate || d.id, index) })),
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
